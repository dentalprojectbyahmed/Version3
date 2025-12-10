import { useState, useEffect } from 'react';
import { Plus, Calendar as CalIcon, Clock, User, Check, X, Stethoscope, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import { db } from '../services/database';
import { format, addDays, startOfDay, subDays } from 'date-fns';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [calendarType, setCalendarType] = useState('all'); // 'all', 'general', 'orthodontist'
  const [showModal, setShowModal] = useState(false);
  const [showGapFiller, setShowGapFiller] = useState(false);
  const [suggestedPatients, setSuggestedPatients] = useState([]);
  const [formData, setFormData] = useState({
    patientId: '', 
    appointmentDate: '', 
    timeSlot: '15:00', 
    treatmentType: '', 
    duration: '30', 
    status: 'scheduled', 
    notes: '',
    calendarType: 'general', // 'general' or 'orthodontist'
    dentistId: 'dr-ahmed', // 'dr-ahmed' or 'naveed'
    appointmentColor: 'green' // 'green' (routine), 'red' (surgery), 'blue' (ortho)
  });

  // Time slots: 3 PM to 10 PM (30-minute intervals)
  const timeSlots = [
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', 
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', 
    '21:00', '21:30', '22:00'
  ];

  useEffect(() => {
    loadData();
  }, [selectedDate, calendarType]);

  const loadData = async () => {
    const pts = await db.patients.toArray();
    setPatients(pts);
    
    const start = startOfDay(new Date(selectedDate)).toISOString();
    const end = startOfDay(addDays(new Date(selectedDate), 1)).toISOString();
    
    let apts = await db.appointments
      .where('appointmentDate')
      .between(start, end)
      .toArray();
    
    // Filter by calendar type
    if (calendarType !== 'all') {
      apts = apts.filter(a => a.calendarType === calendarType);
    }
    
    const withPatients = await Promise.all(
      apts.map(async a => ({ 
        ...a, 
        patient: await db.patients.get(a.patientId) 
      }))
    );
    
    setAppointments(withPatients);
    
    // Calculate gap filler suggestions
    calculateGapFillerSuggestions(withPatients, pts);
  };

  const calculateGapFillerSuggestions = async (todayApts, allPatients) => {
    // Find empty slots
    const bookedSlots = todayApts.map(a => format(new Date(a.appointmentDate), 'HH:mm'));
    const emptySlots = timeSlots.filter(slot => !bookedSlots.includes(slot));
    
    if (emptySlots.length === 0) {
      setSuggestedPatients([]);
      return;
    }

    // Get patients with pending treatments or overdue follow-ups
    const suggestions = [];
    
    for (const patient of allPatients) {
      // Get patient's treatment records
      const treatments = await db.treatmentRecords
        .where('patientId')
        .equals(patient.id)
        .toArray();
      
      const pendingTreatments = treatments.filter(t => t.status !== 'completed');
      
      // Get patient's last visit
      const lastApt = await db.appointments
        .where('patientId')
        .equals(patient.id)
        .toArray();
      
      const sortedApts = lastApt.sort((a, b) => 
        new Date(b.appointmentDate) - new Date(a.appointmentDate)
      );
      
      const lastVisit = sortedApts[0];
      const daysSinceLastVisit = lastVisit 
        ? Math.floor((new Date() - new Date(lastVisit.appointmentDate)) / (1000 * 60 * 60 * 24))
        : 999;
      
      // Priority scoring
      let priority = 0;
      let reason = '';
      
      if (pendingTreatments.length > 0) {
        priority += pendingTreatments.length * 10;
        reason = `${pendingTreatments.length} pending treatment(s)`;
      }
      
      if (daysSinceLastVisit > 180) {
        priority += 20;
        reason = reason ? `${reason}, overdue follow-up` : 'Overdue follow-up';
      } else if (daysSinceLastVisit > 90) {
        priority += 10;
        reason = reason ? `${reason}, due for check-up` : 'Due for check-up';
      }
      
      if (priority > 0) {
        suggestions.push({
          patient,
          priority,
          reason,
          lastVisit: lastVisit ? format(new Date(lastVisit.appointmentDate), 'MMM dd, yyyy') : 'Never',
          daysSinceLastVisit
        });
      }
    }
    
    // Sort by priority (highest first)
    suggestions.sort((a, b) => b.priority - a.priority);
    
    setSuggestedPatients(suggestions.slice(0, 5)); // Top 5 suggestions
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const aptData = { 
      ...formData, 
      appointmentDate: new Date(formData.appointmentDate + 'T' + formData.timeSlot).toISOString(), 
      createdAt: new Date().toISOString() 
    };
    
    await db.appointments.add(aptData);
    await loadData();
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ 
      patientId: '', 
      appointmentDate: '', 
      timeSlot: '15:00', 
      treatmentType: '', 
      duration: '30', 
      status: 'scheduled', 
      notes: '',
      calendarType: 'general',
      dentistId: 'dr-ahmed',
      appointmentColor: 'green'
    });
  };

  const updateStatus = async (id, status) => {
    await db.appointments.update(id, { status });
    await loadData();
  };

  const quickBookPatient = (patientId, slot) => {
    setFormData({
      ...formData,
      patientId: patientId.toString(),
      appointmentDate: selectedDate,
      timeSlot: slot
    });
    setShowModal(true);
    setShowGapFiller(false);
  };

  const changeDate = (days) => {
    const newDate = days > 0 
      ? addDays(new Date(selectedDate), days)
      : subDays(new Date(selectedDate), Math.abs(days));
    setSelectedDate(format(newDate, 'yyyy-MM-dd'));
  };

  const getColorClass = (color) => {
    switch(color) {
      case 'green': return 'border-green-500 bg-green-50';
      case 'red': return 'border-red-500 bg-red-50';
      case 'blue': return 'border-sky-500 bg-primary/10';
      default: return 'border-border bg-card';
    }
  };

  const getColorBadge = (color) => {
    switch(color) {
      case 'green': return 'bg-green-100 text-green-800';
      case 'red': return 'bg-red-100 text-red-800';
      case 'blue': return 'bg-primary/10 text-sky-800';
      default: return 'bg-muted text-foreground';
    }
  };

  const emptySlots = timeSlots.filter(slot => 
    !appointments.find(a => format(new Date(a.appointmentDate), 'HH:mm') === slot)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-muted-foreground mt-1">Dual calendar system with Smart Gap Filler</p>
        </div>
        <div className="flex gap-2">
          {emptySlots.length > 0 && suggestedPatients.length > 0 && (
            <button 
              onClick={() => setShowGapFiller(!showGapFiller)}
              className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              <Lightbulb className="w-5 h-5 mr-2" />
              Smart Gap Filler ({emptySlots.length} empty)
            </button>
          )}
          <button 
            onClick={() => { setFormData({ ...formData, appointmentDate: selectedDate }); setShowModal(true); }}
            className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Schedule
          </button>
        </div>
      </div>

      {/* Calendar Type Filter */}
      <div className="bg-card rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CalIcon className="w-5 h-5 text-muted-foreground" />
            
            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => changeDate(-1)}
                className="p-2 hover:bg-muted rounded"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500" 
              />
              
              <button 
                onClick={() => changeDate(1)}
                className="p-2 hover:bg-muted rounded"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
                className="px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded"
              >
                Today
              </button>
            </div>

            {/* Calendar Type Tabs */}
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => setCalendarType('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  calendarType === 'all' 
                    ? 'bg-sky-600 text-white' 
                    : 'bg-muted text-foreground hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCalendarType('general')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  calendarType === 'general' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-muted text-foreground hover:bg-gray-200'
                }`}
              >
                General
              </button>
              <button
                onClick={() => setCalendarType('orthodontist')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  calendarType === 'orthodontist' 
                    ? 'bg-sky-600 text-white' 
                    : 'bg-muted text-foreground hover:bg-gray-200'
                }`}
              >
                <Stethoscope className="w-4 h-4 inline mr-1" />
                Orthodontist
              </button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Smart Gap Filler Panel */}
      {showGapFiller && suggestedPatients.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-foreground">Smart Gap Filler Suggestions</h3>
            </div>
            <button 
              onClick={() => setShowGapFiller(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-2">
            {suggestedPatients.map((suggestion, idx) => (
              <div key={idx} className="bg-card rounded-lg p-3 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-foreground">{suggestion.patient.name}</div>
                  <div className="text-sm text-muted-foreground">{suggestion.reason}</div>
                  <div className="text-xs text-muted-foreground">Last visit: {suggestion.lastVisit}</div>
                </div>
                <div className="flex gap-2">
                  {emptySlots.slice(0, 3).map(slot => (
                    <button
                      key={slot}
                      onClick={() => quickBookPatient(suggestion.patient.id, slot)}
                      className="px-3 py-1 text-sm bg-sky-600 text-white rounded hover:bg-sky-700"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appointments Grid */}
      <div className="grid gap-3">
        {timeSlots.map(slot => {
          const apt = appointments.find(a => format(new Date(a.appointmentDate), 'HH:mm') === slot);
          const isEmpty = !apt;
          
          return (
            <div 
              key={slot} 
              className={`rounded-lg shadow-sm p-4 border-l-4 transition-all ${
                apt ? getColorClass(apt.appointmentColor) : 'border-border bg-background'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="text-sm font-medium text-foreground w-20">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {slot}
                  </div>
                  
                  {apt ? (
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-foreground">{apt.patient?.name || 'Unknown'}</div>
                        <span className={`px-2 py-0.5 text-xs rounded ${getColorBadge(apt.appointmentColor)}`}>
                          {apt.appointmentColor === 'green' ? 'Routine' : apt.appointmentColor === 'red' ? 'Surgery' : 'Ortho'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {apt.calendarType === 'orthodontist' ? '(Orthodontist)' : '(General)'}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">{apt.treatmentType || 'General Checkup'}</div>
                      {apt.notes && <div className="text-xs text-muted-foreground mt-1">{apt.notes}</div>}
                    </div>
                  ) : (
                    <div className="text-muted-foreground italic">Available slot</div>
                  )}
                </div>
                
                {apt && (
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      apt.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      apt.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {apt.status}
                    </span>
                    {apt.status === 'scheduled' && (
                      <>
                        <button 
                          onClick={() => updateStatus(apt.id, 'completed')} 
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                          title="Mark as completed"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => updateStatus(apt.id, 'cancelled')} 
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Cancel appointment"
                        >
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

      {/* Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Schedule Appointment</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Patient</label>
                    <select 
                      value={formData.patientId} 
                      onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Select patient</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Calendar Type</label>
                    <select 
                      value={formData.calendarType} 
                      onChange={(e) => setFormData({...formData, calendarType: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="general">General</option>
                      <option value="orthodontist">Orthodontist</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input 
                      type="date" 
                      value={formData.appointmentDate} 
                      onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Time</label>
                    <select 
                      value={formData.timeSlot} 
                      onChange={(e) => setFormData({...formData, timeSlot: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {timeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Appointment Type</label>
                    <select 
                      value={formData.appointmentColor} 
                      onChange={(e) => setFormData({...formData, appointmentColor: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="green">Routine (Green)</option>
                      <option value="red">Surgery (Red)</option>
                      <option value="blue">Orthodontic (Blue)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                    <select 
                      value={formData.duration} 
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Treatment Type</label>
                  <input 
                    type="text" 
                    value={formData.treatmentType} 
                    onChange={(e) => setFormData({...formData, treatmentType: e.target.value})}
                    placeholder="e.g., Root Canal, Cleaning, Braces Adjustment"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea 
                    value={formData.notes} 
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-background"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                  >
                    Schedule Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
