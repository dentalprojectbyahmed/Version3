import { useState, useEffect } from 'react';
import { Plus, Download, Share2, Search } from 'lucide-react';
import { db } from '../services/database';
import { pdfService } from '../services/pdf';
import { shareService } from '../utils/share';
import { prescriptionSafety } from '../utils/prescriptionSafety';
import { format } from 'date-fns';
import { dentalConditions as conditions } from '../data/conditions';
import protocols from '../data/protocols.json';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedTier, setSelectedTier] = useState('standard');
  const [customMeds, setCustomMeds] = useState([]);
  const [safetyCheck, setSafetyCheck] = useState({ safe: true, warnings: [], errors: [] });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    condition: '',
    tier: 'standard',
    medications: [],
    instructions: '',
    prescribedBy: 'Dr. Ahmed Abdullah Khan',
    duration: '7 days'
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

  const checkMedicationSafety = (meds, patient) => {
    if (!patient || !meds || meds.length === 0) {
      setSafetyCheck({ safe: true, warnings: [], errors: [] });
      return;
    }
    const result = prescriptionSafety.checkSafety(patient, meds);
    setSafetyCheck(result);
  };

  const handlePatientSelect = async (patientId) => {
    setFormData({ ...formData, patientId });
    const patient = await db.patients.get(parseInt(patientId));
    setSelectedPatient(patient);
    if (customMeds.length > 0) {
      checkMedicationSafety(customMeds, patient);
    }
  };

  const handleConditionSelect = (conditionId) => {
    setSelectedCondition(conditionId);
    const protocol = protocols[conditionId];
    if (protocol && protocol[selectedTier]) {
      const meds = protocol[selectedTier].medications || [];
      setCustomMeds(meds.map(med => ({
        name: med.name || med,
        dosage: med.dosage || '',
        frequency: med.frequency || '',
        duration: med.duration || formData.duration
      })));
      setFormData({
        ...formData,
        condition: conditionId,
        tier: selectedTier,
        medications: meds,
        instructions: protocol[selectedTier].instructions || ''
      });
    }
  };

  const handleTierChange = (tier) => {
    setSelectedTier(tier);
    if (selectedCondition) {
      const protocol = protocols[selectedCondition];
      if (protocol && protocol[tier]) {
        const meds = protocol[tier].medications || [];
        setCustomMeds(meds.map(med => ({
          name: med.name || med,
          dosage: med.dosage || '',
          frequency: med.frequency || '',
          duration: med.duration || formData.duration
        })));
        setFormData({
          ...formData,
          tier,
          medications: meds,
          instructions: protocol[tier].instructions || ''
        });
      }
    }
  };

  const addCustomMedication = () => {
    const updated = [...customMeds, { name: '', dosage: '', frequency: '', duration: '7 days' }];
    setCustomMeds(updated);
    if (selectedPatient) {
      checkMedicationSafety(updated, selectedPatient);
    }
  };

  const updateCustomMed = (index, field, value) => {
    const updated = [...customMeds];
    updated[index][field] = value;
    setCustomMeds(updated);
    if (selectedPatient) {
      checkMedicationSafety(updated, selectedPatient);
    }
  };

  const removeCustomMed = (index) => {
    const updated = customMeds.filter((_, i) => i !== index);
    setCustomMeds(updated);
    if (selectedPatient) {
      checkMedicationSafety(updated, selectedPatient);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await db.prescriptions.add({
      ...formData,
      medications: customMeds,
      prescribedDate: new Date().toISOString(),
      appointmentId: null
    });
    await loadData();
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      condition: '',
      tier: 'standard',
      medications: [],
      instructions: '',
      prescribedBy: 'Dr. Ahmed Abdullah Khan',
      duration: '7 days'
    });
    setSelectedCondition('');
    setSelectedTier('standard');
    setCustomMeds([]);
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
    const pdfBlob = doc.output('blob');
    await shareService.sharePrescription(presc, presc.patient, pdfBlob);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Prescriptions</h1>
          <p className="text-muted-foreground mt-1">Manage patient prescriptions with protocol-based system</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus className="w-5 h-5 mr-2" />New Prescription
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
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
        <div className="bg-card rounded-lg shadow-sm p-4">
          <div className="text-sm text-muted-foreground">Conditions Treated</div>
          <div className="text-2xl font-bold">{new Set(prescriptions.map(p => p.condition)).size}</div>
        </div>
      </div>

      <div className="grid gap-4">
        {prescriptions.map(presc => (
          <div key={presc.id} className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{presc.patient?.name}</h3>
                <p className="text-sm text-muted-foreground">{format(new Date(presc.prescribedDate), 'MMM d, yyyy')}</p>
                {presc.condition && (
                  <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {conditions.find(c => c.id === presc.condition)?.name || presc.condition}
                  </span>
                )}
                {presc.tier && (
                  <span className="inline-block mt-2 ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded capitalize">
                    {presc.tier} Protocol
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => downloadPrescription(presc)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <Download className="w-5 h-5" />
                </button>
                <button onClick={() => sharePrescription(presc)} className="p-2 text-green-600 hover:bg-green-50 rounded">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-sm font-medium text-foreground">Medications:</div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {Array.isArray(presc.medications) 
                    ? presc.medications.map((med, i) => (
                        <div key={i} className="ml-4">
                          • {typeof med === 'string' ? med : `${med.name} - ${med.dosage} ${med.frequency} for ${med.duration}`}
                        </div>
                      ))
                    : presc.medications}
                </div>
              </div>
              {presc.instructions && (
                <div>
                  <div className="text-sm font-medium text-foreground">Instructions:</div>
                  <div className="text-sm text-muted-foreground">{presc.instructions}</div>
                </div>
              )}
              <div className="text-xs text-muted-foreground">Prescribed by: {presc.prescribedBy}</div>
            </div>
          </div>
        ))}
        {prescriptions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No prescriptions yet</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-lg bg-card max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-semibold">New Prescription</h3>
              <button onClick={() => { setShowModal(false); resetForm(); }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Patient *</label>
                <select required value={formData.patientId} onChange={(e) => handlePatientSelect(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Select patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} - {p.mobileNumber}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Dental Condition</label>
                <select value={selectedCondition} onChange={(e) => handleConditionSelect(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Select condition (or create custom)</option>
                  {conditions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {selectedCondition && (
                <div>
                  <label className="block text-sm font-medium mb-2">Protocol Tier</label>
                  <div className="flex gap-3">
                    {['premium', 'standard', 'basic'].map(tier => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => handleTierChange(tier)}
                        className={`px-4 py-2 rounded-lg capitalize ${
                          selectedTier === tier 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-muted text-foreground hover:bg-gray-200'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Medications *</label>
                  <button type="button" onClick={addCustomMedication} className="text-sm text-primary-600 hover:text-primary-700">
                    + Add Medication
                  </button>
                </div>
                <div className="space-y-2">
                  {customMeds.map((med, index) => (
                    <div key={index} className="flex gap-2 items-start p-3 bg-background rounded">
                      <div className="flex-1 grid grid-cols-4 gap-2">
                        <input
                          type="text"
                          placeholder="Medication name"
                          value={med.name}
                          onChange={(e) => updateCustomMed(index, 'name', e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Dosage"
                          value={med.dosage}
                          onChange={(e) => updateCustomMed(index, 'dosage', e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Frequency"
                          value={med.frequency}
                          onChange={(e) => updateCustomMed(index, 'frequency', e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Duration"
                          value={med.duration}
                          onChange={(e) => updateCustomMed(index, 'duration', e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        />
                      </div>
                      <button type="button" onClick={() => removeCustomMed(index)} className="text-red-600 hover:text-red-700">
                        ✕
                      </button>
                    </div>
                  ))}
                  {customMeds.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      Select a condition or click "Add Medication" to add custom medications
                    </div>
                  )}
                </div>

                {/* Safety Warnings */}
                {(safetyCheck.errors.length > 0 || safetyCheck.warnings.length > 0) && (
                  <div className="mt-3 space-y-2">
                    {safetyCheck.errors.map((error, i) => (
                      <div key={`error-${i}`} className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                        {error}
                      </div>
                    ))}
                    {safetyCheck.warnings.map((warning, i) => (
                      <div key={`warning-${i}`} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                        {warning}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Instructions</label>
                <textarea value={formData.instructions} onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg" rows={4}
                  placeholder="Special instructions for the patient..." />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Create Prescription</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
