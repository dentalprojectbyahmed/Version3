import { useState, useEffect } from 'react';
import { Plus, Download, Share2 } from 'lucide-react';
import { db } from '../services/database';
import { pdfService } from '../services/pdf';
import { format } from 'date-fns';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '', medications: '', instructions: '', prescribedBy: 'Dr. Ahmed Abdullah Khan'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const pts = await db.patients.toArray();
    const presc = await db.prescriptions.orderBy('prescribedDate').reverse().toArray();
    const withPatients = await Promise.all(presc.map(async p => ({
      ...p,
      patient: await db.patients.get(p.patientId)
    })));
    setPatients(pts);
    setPrescriptions(withPatients);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await db.prescriptions.add({
      ...formData,
      prescribedDate: new Date().toISOString(),
      appointmentId: null
    });
    await loadData();
    setShowModal(false);
    setFormData({ patientId: '', medications: '', instructions: '', prescribedBy: 'Dr. Ahmed Abdullah Khan' });
  };

  const downloadPrescription = async (presc) => {
    const settings = await db.settings.toArray();
    const settingsObj = {};
    settings.forEach(s => { settingsObj[s.key] = s.value; });
    
    const doc = pdfService.generatePrescription(presc, presc.patient, settingsObj);
    pdfService.downloadPDF(doc, `Prescription-${presc.patient.name}-${format(new Date(presc.prescribedDate), 'yyyy-MM-dd')}.pdf`);
  };

  const sharePrescription = async (presc) => {
    const settings = await db.settings.toArray();
    const settingsObj = {};
    settings.forEach(s => { settingsObj[s.key] = s.value; });
    
    const doc = pdfService.generatePrescription(presc, presc.patient, settingsObj);
    const shared = await pdfService.sharePDF(doc, `Prescription-${presc.patient.name}.pdf`);
    if (!shared) {
      downloadPrescription(presc);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Prescriptions</h1>
          <p className="text-muted-foreground mt-1">Manage patient prescriptions</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus className="w-5 h-5 mr-2" />New Prescription
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="text-sm text-muted-foreground">Total Prescriptions</div>
          <div className="text-2xl font-bold">{prescriptions.length}</div>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="text-sm text-muted-foreground">This Month</div>
          <div className="text-2xl font-bold">
            {prescriptions.filter(p => {
              const d = new Date(p.prescribedDate);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {prescriptions.map(presc => (
          <div key={presc.id} className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{presc.patient?.name}</h3>
                <p className="text-sm text-muted-foreground">{format(new Date(presc.prescribedDate), 'MMM d, yyyy')}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => downloadPrescription(presc)} className="p-2 text-primary-600 hover:bg-primary-50 rounded">
                  <Download className="w-5 h-5" />
                </button>
                <button onClick={() => sharePrescription(presc)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-foreground">Medications:</div>
                <div className="mt-1 text-foreground whitespace-pre-line">{presc.medications}</div>
              </div>
              {presc.instructions && (
                <div>
                  <div className="text-sm font-medium text-foreground">Instructions:</div>
                  <div className="mt-1 text-foreground whitespace-pre-line">{presc.instructions}</div>
                </div>
              )}
            </div>
          </div>
        ))}
        {prescriptions.length === 0 && (
          <div className="bg-card rounded-lg shadow-sm p-12 text-center text-muted-foreground">No prescriptions</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-card">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">New Prescription</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Patient *</label>
                <select required value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Select patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Medications *</label>
                <textarea required value={formData.medications} onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  rows={4} placeholder="e.g., Amoxicillin 500mg - 3 times daily for 7 days" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Instructions</label>
                <textarea value={formData.instructions} onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows={3} placeholder="Special instructions for patient" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
