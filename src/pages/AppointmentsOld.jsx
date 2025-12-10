import { useState, useEffect } from 'react';
import { Plus, Calendar as CalIcon, Clock, User, Check, X } from 'lucide-react';
import { db } from '../services/database';
import { format, addDays, startOfDay } from 'date-fns';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '', appointmentDate: '', timeSlot: '09:00', 
    treatmentType: '', duration: '30', status: 'scheduled', notes: ''
  });

  const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    const pts = await db.patients.toArray();
    setPatients(pts);
    const start = startOfDay(new Date(selectedDate)).toISOString();
    const end = startOfDay(addDays(new Date(selectedDate), 1)).toISOString();
    const apts = await db.appointments.where('appointmentDate').between(start, end).toArray();
    const withPatients = await Promise.all(apts.map(async a => ({ ...a, patient: await db.patients.get(a.patientId) })));
    setAppointments(withPatients);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const aptData = { ...formData, appointmentDate: new Date(formData.appointmentDate + 'T' + formData.timeSlot).toISOString(), createdAt: new Date().toISOString() };
    await db.appointments.add(aptData);
    await loadData();
    setShowModal(false);
    setFormData({ patientId: '', appointmentDate: '', timeSlot: '09:00', treatmentType: '', duration: '30', status: 'scheduled', notes: '' });
  };

  const updateStatus = async (id, status) => {
    await db.appointments.update(id, { status });
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage appointments</p>
        </div>
        <button onClick={() => { setFormData({ ...formData, appointmentDate: selectedDate }); setShowModal(true); }}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus className="w-5 h-5 mr-2" />Schedule
        </button>
      </div>

      <div className="bg-card rounded-lg shadow-sm p-4">
        <div className="flex items-center space-x-4">
          <CalIcon className="w-5 h-5 text-muted-foreground" />
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
          <div className="flex-1"></div>
          <div className="text-sm text-muted-foreground">{appointments.length} appointments</div>
        </div>
      </div>

      <div className="grid gap-4">
        {timeSlots.map(slot => {
          const apt = appointments.find(a => format(new Date(a.appointmentDate), 'HH:mm') === slot);
          return (
            <div key={slot} className="bg-card rounded-lg shadow-sm p-4 border-l-4" style={{borderLeftColor: apt ? (apt.status === 'completed' ? '#10b981' : apt.status === 'cancelled' ? '#ef4444' : '#3b82f6') : '#e5e7eb'}}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-foreground w-16"><Clock className="w-4 h-4 inline mr-1" />{slot}</div>
                  {apt ? (
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{apt.patient?.name || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">{apt.treatmentType || 'General Checkup'}</div>
                      {apt.notes && <div className="text-xs text-muted-foreground mt-1">{apt.notes}</div>}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">Available</div>
                  )}
                </div>
                {apt && (
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${apt.status === 'completed' ? 'bg-green-100 text-green-800' : apt.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                      {apt.status}
                    </span>
                    {apt.status === 'scheduled' && (
                      <>
                        <button onClick={() => updateStatus(apt.id, 'completed')} className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => updateStatus(apt.id, 'cancelled')} className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-lg bg-card">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">Schedule Appointment</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Patient *</label>
                <select required value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500">
                  <option value="">Select patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} - {p.mobileNumber}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date *</label>
                  <input type="date" required value={formData.appointmentDate} onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time *</label>
                  <select required value={formData.timeSlot} onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500">
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Treatment Type</label>
                <input type="text" value={formData.treatmentType} onChange={(e) => setFormData({ ...formData, treatmentType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="e.g., Root Canal, Cleaning" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (min)</label>
                <select value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500">
                  <option value="30">30 min</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
