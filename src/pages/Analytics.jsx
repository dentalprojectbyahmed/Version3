import { useState, useEffect } from 'react';
import { db } from '../services/database';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

export default function Analytics() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    paidInvoices: 0,
    pendingAmount: 0,
    totalPatients: 0,
    newPatientsThisMonth: 0,
    appointmentsThisMonth: 0
  });
  const [revenueData, setRevenueData] = useState({ labels: [], data: [] });
  const [categoryData, setCategoryData] = useState({ labels: [], data: [] });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const invoices = await db.invoices.toArray();
    const patients = await db.patients.toArray();
    const appointments = await db.appointments.toArray();
    const treatments = await db.treatmentRecords.toArray();
    
    const totalRevenue = invoices.filter(i => i.paymentStatus === 'paid').reduce((sum, i) => sum + i.totalPKR, 0);
    const paidInvoices = invoices.filter(i => i.paymentStatus === 'paid').length;
    const pendingAmount = invoices.filter(i => i.paymentStatus === 'pending').reduce((sum, i) => sum + i.totalPKR, 0);
    
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    const newPatientsThisMonth = patients.filter(p => {
      const d = new Date(p.registrationDate);
      return d >= monthStart && d <= monthEnd;
    }).length;
    
    const appointmentsThisMonth = appointments.filter(a => {
      const d = new Date(a.appointmentDate);
      return d >= monthStart && d <= monthEnd;
    }).length;
    
    // Revenue by month (last 6 months)
    const months = [];
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const revenue = invoices.filter(inv => {
        const d = new Date(inv.invoiceDate);
        return d >= start && d <= end && inv.paymentStatus === 'paid';
      }).reduce((sum, inv) => sum + inv.totalPKR, 0);
      
      months.push(format(date, 'MMM yyyy'));
      monthlyRevenue.push(revenue);
    }
    
    setRevenueData({ labels: months, data: monthlyRevenue });
    
    // Treatment categories
    const catalog = await db.treatmentCatalog.toArray();
    const categories = {};
    treatments.forEach(t => {
      const treatment = catalog.find(c => c.id === t.treatmentId);
      if (treatment) {
        categories[treatment.category] = (categories[treatment.category] || 0) + 1;
      }
    });
    
    setCategoryData({
      labels: Object.keys(categories),
      data: Object.values(categories)
    });
    
    setStats({
      totalRevenue,
      paidInvoices,
      pendingAmount,
      totalPatients: patients.length,
      newPatientsThisMonth,
      appointmentsThisMonth
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics & Reports</h1>
        <p className="text-muted-foreground mt-1">Clinic performance overview</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
          <div className="text-sm opacity-90">Total Revenue</div>
          <div className="text-3xl font-bold mt-2">Rs. {stats.totalRevenue.toLocaleString()}</div>
          <div className="text-sm opacity-75 mt-1">{stats.paidInvoices} paid invoices</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-sm p-6 text-white">
          <div className="text-sm opacity-90">Pending Amount</div>
          <div className="text-3xl font-bold mt-2">Rs. {stats.pendingAmount.toLocaleString()}</div>
          <div className="text-sm opacity-75 mt-1">Outstanding payments</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
          <div className="text-sm opacity-90">Total Patients</div>
          <div className="text-3xl font-bold mt-2">{stats.totalPatients}</div>
          <div className="text-sm opacity-75 mt-1">+{stats.newPatientsThisMonth} this month</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">Revenue Trend (Last 6 Months)</h3>
          <Line
            data={{
              labels: revenueData.labels,
              datasets: [{
                label: 'Revenue (PKR)',
                data: revenueData.data,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
              }]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => 'Rs. ' + value.toLocaleString()
                  }
                }
              }
            }}
          />
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">Treatment Categories</h3>
          <Pie
            data={{
              labels: categoryData.labels,
              datasets: [{
                data: categoryData.data,
                backgroundColor: [
                  'rgba(59, 130, 246, 0.8)',
                  'rgba(16, 185, 129, 0.8)',
                  'rgba(245, 158, 11, 0.8)',
                  'rgba(239, 68, 68, 0.8)',
                  'rgba(139, 92, 246, 0.8)',
                  'rgba(236, 72, 153, 0.8)',
                  'rgba(20, 184, 166, 0.8)',
                ]
              }]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom' }
              }
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">This Month Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-background rounded">
              <span className="text-muted-foreground">New Patients</span>
              <span className="text-xl font-bold">{stats.newPatientsThisMonth}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-background rounded">
              <span className="text-muted-foreground">Appointments</span>
              <span className="text-xl font-bold">{stats.appointmentsThisMonth}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-background rounded">
              <span className="text-muted-foreground">Revenue</span>
              <span className="text-xl font-bold">Rs. {stats.totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-background rounded">
              <span className="text-muted-foreground">Avg per Invoice</span>
              <span className="text-xl font-bold">
                Rs. {stats.paidInvoices > 0 ? Math.round(stats.totalRevenue / stats.paidInvoices).toLocaleString() : 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-background rounded">
              <span className="text-muted-foreground">Collection Rate</span>
              <span className="text-xl font-bold">
                {stats.paidInvoices > 0 ? Math.round((stats.totalRevenue / (stats.totalRevenue + stats.pendingAmount)) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-background rounded">
              <span className="text-muted-foreground">Avg per Patient</span>
              <span className="text-xl font-bold">
                Rs. {stats.totalPatients > 0 ? Math.round(stats.totalRevenue / stats.totalPatients).toLocaleString() : 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
