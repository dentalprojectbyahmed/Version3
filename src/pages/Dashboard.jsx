import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, DollarSign, TrendingUp, Activity, Clock } from 'lucide-react';
import { db } from '../services/database';
import { currencyService } from '../services/currency';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    monthRevenue: 0,
    pendingInvoices: 0,
  });
  
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(278);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get exchange rate
      const rate = await currencyService.getRate();
      setExchangeRate(rate);

      // Total patients
      const totalPatients = await db.patients.count();

      // Today's appointments
      const today = new Date();
      const todayStart = startOfDay(today);
      const todayEnd = endOfDay(today);
      
      const todayAppointments = await db.appointments
        .where('appointmentDate')
        .between(todayStart.toISOString(), todayEnd.toISOString())
        .count();

      // Month revenue
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      
      const monthInvoices = await db.invoices
        .where('invoiceDate')
        .between(monthStart.toISOString(), monthEnd.toISOString())
        .and(inv => inv.paymentStatus === 'paid')
        .toArray();
      
      const monthRevenue = monthInvoices.reduce((sum, inv) => sum + (inv.totalPKR || 0), 0);

      // Pending invoices
      const pendingInvoices = await db.invoices
        .where('paymentStatus')
        .equals('pending')
        .count();

      // Recent appointments
      const recent = await db.appointments
        .orderBy('appointmentDate')
        .reverse()
        .limit(5)
        .toArray();
      
      // Get patient details for appointments
      const appointmentsWithPatients = await Promise.all(
        recent.map(async (apt) => {
          const patient = await db.patients.get(apt.patientId);
          return { ...apt, patient };
        })
      );

      setStats({
        totalPatients,
        todayAppointments,
        monthRevenue,
        pendingInvoices,
      });
      
      setRecentAppointments(appointmentsWithPatients);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'bg-blue-500',
      href: '/patients',
    },
    {
      name: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Calendar,
      color: 'bg-green-500',
      href: '/appointments',
    },
    {
      name: 'Month Revenue',
      value: `Rs. ${stats.monthRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      href: '/billing',
    },
    {
      name: 'Pending Invoices',
      value: stats.pendingInvoices,
      icon: TrendingUp,
      color: 'bg-orange-500',
      href: '/billing',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-card rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-foreground">Welcome back, Dr. Ahmed!</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening at Abdullah Dental Care today</p>
        
        <div className="mt-4 flex items-center text-sm text-muted-foreground">
          <Clock className="w-4 h-4 mr-1" />
          <span>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
          <span className="mx-3">•</span>
          <Activity className="w-4 h-4 mr-1" />
          <span>Exchange Rate: $1 = Rs. {exchangeRate.toFixed(2)}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.href}
              className="bg-card rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.name}</p>
                  <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Appointments */}
      <div className="bg-card rounded-lg shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Appointments</h2>
            <Link to="/appointments" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {recentAppointments.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No recent appointments</p>
              <Link to="/appointments" className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block">
                Schedule an appointment
              </Link>
            </div>
          ) : (
            recentAppointments.map((apt) => (
              <div key={apt.id} className="p-6 hover:bg-background transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-foreground">
                      {apt.patient?.name || 'Unknown Patient'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {apt.treatmentType || 'General Checkup'}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-medium text-foreground">
                      {format(new Date(apt.appointmentDate), 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">{apt.timeSlot}</p>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded mt-1 ${
                        apt.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : apt.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/patients"
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white hover:shadow-md transition-all"
        >
          <Users className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold">Add New Patient</h3>
          <p className="text-blue-100 text-sm mt-1">Register a new patient</p>
        </Link>
        
        <Link
          to="/appointments"
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white hover:shadow-md transition-all"
        >
          <Calendar className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold">Schedule Appointment</h3>
          <p className="text-green-100 text-sm mt-1">Book a new appointment</p>
        </Link>
        
        <Link
          to="/billing"
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm p-6 text-white hover:shadow-md transition-all"
        >
          <DollarSign className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold">Create Invoice</h3>
          <p className="text-purple-100 text-sm mt-1">Generate patient invoice</p>
        </Link>
      </div>
    </div>
  );
}
