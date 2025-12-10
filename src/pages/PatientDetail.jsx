import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, DollarSign, Stethoscope } from 'lucide-react';
import { db } from '../services/database';
import { format } from 'date-fns';
import DentalChart from '../components/common/DentalChart';

export default function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedTeeth, setSelectedTeeth] = useState([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    const p = await db.patients.get(parseInt(id));
    setPatient(p);
    
    const apts = await db.appointments.where('patientId').equals(parseInt(id)).toArray();
    setAppointments(apts);
    
    const trts = await db.treatmentRecords.where('patientId').equals(parseInt(id)).toArray();
    setTreatments(trts);
    
    const presc = await db.prescriptions.where('patientId').equals(parseInt(id)).toArray();
    setPrescriptions(presc);
    
    const invs = await db.invoices.where('patientId').equals(parseInt(id)).toArray();
    setInvoices(invs);
    
    const teethSet = new Set();
    trts.forEach(t => {
      if (t.toothNumber) teethSet.add(t.toothNumber);
    });
    setSelectedTeeth(Array.from(teethSet));
  };

  if (!patient) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const totalPaid = invoices.filter(i => i.paymentStatus === 'paid').reduce((sum, i) => sum + i.totalPKR, 0);
  const totalPending = invoices.filter(i => i.paymentStatus === 'pending').reduce((sum, i) => sum + i.totalPKR, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/patients" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{patient.name}</h1>
          <p className="text-muted-foreground">{patient.mobileNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Appointments</div>
              <div className="text-2xl font-bold">{appointments.length}</div>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Treatments</div>
              <div className="text-2xl font-bold">{treatments.length}</div>
            </div>
            <Stethoscope className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Total Paid</div>
              <div className="text-2xl font-bold">Rs. {totalPaid.toLocaleString()}</div>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Pending</div>
              <div className="text-2xl font-bold">Rs. {totalPending.toLocaleString()}</div>
            </div>
            <DollarSign className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Dental Chart</h2>
        <DentalChart selectedTeeth={selectedTeeth} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Appointments</h2>
          <div className="space-y-3">
            {appointments.slice(0, 5).map(apt => (
              <div key={apt.id} className="flex justify-between items-center p-3 bg-background rounded">
                <div>
                  <div className="font-medium">{apt.treatmentType || 'Checkup'}</div>
                  <div className="text-sm text-muted-foreground">{format(new Date(apt.appointmentDate), 'MMM d, yyyy')}</div>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${apt.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {apt.status}
                </span>
              </div>
            ))}
            {appointments.length === 0 && <div className="text-muted-foreground text-center py-4">No appointments</div>}
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Invoices</h2>
          <div className="space-y-3">
            {invoices.slice(0, 5).map(inv => (
              <div key={inv.id} className="flex justify-between items-center p-3 bg-background rounded">
                <div>
                  <div className="font-medium">{inv.invoiceNumber}</div>
                  <div className="text-sm text-muted-foreground">{format(new Date(inv.invoiceDate), 'MMM d, yyyy')}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">Rs. {inv.totalPKR.toLocaleString()}</div>
                  <span className={`text-xs ${inv.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                    {inv.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
            {invoices.length === 0 && <div className="text-muted-foreground text-center py-4">No invoices</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
