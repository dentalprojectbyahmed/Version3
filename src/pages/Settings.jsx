import { useState, useEffect } from 'react';
import { Save, RefreshCw, Database, Cloud, DollarSign, Plus, Edit2, Trash2, Lock, Shield } from 'lucide-react';
import { db } from '../services/database';
import { currencyService } from '../services/currency';
import { googleSheets } from '../services/googleSheets';
import { useAuth } from '../contexts/AuthContext';
import PINProtection from '../components/auth/PINProtection';

export default function Settings() {
  const { isAdmin } = useAuth();
  const [settings, setSettings] = useState({});
  const [exchangeRate, setExchangeRate] = useState(278);
  const [manualRate, setManualRate] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [treatments, setTreatments] = useState([]);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(null);
  const [treatmentForm, setTreatmentForm] = useState({
    code: '', category: 'Preventive', name: '', description: '', priceUSD: 0, fdiNotation: 'Single'
  });
  const [showPINModal, setShowPINModal] = useState(false);
  const [pinAction, setPinAction] = useState(null);
  const [isPINVerified, setIsPINVerified] = useState(false);
  const [newPIN, setNewPIN] = useState('');
  const [confirmPIN, setConfirmPIN] = useState('');
  const [showSetPIN, setShowSetPIN] = useState(false);

  const categories = ['Preventive', 'Restorative', 'Endodontics', 'Prosthodontics', 'Surgery', 'Orthodontics', 'Periodontics', 'Pediatric', 'Cosmetic', 'Implants', 'Emergency'];

  useEffect(() => {
    loadSettings();
    loadTreatments();
  }, []);

  const loadTreatments = async () => {
    const trts = await db.treatmentCatalog.toArray();
    setTreatments(trts);
  };

  const loadSettings = async () => {
    const allSettings = await db.settings.toArray();
    const settingsObj = {};
    allSettings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    setSettings(settingsObj);
    
    const rate = await currencyService.getRate();
    setExchangeRate(rate);
  };

  const updateSetting = async (key, value) => {
    await db.settings.put({ key, value });
    await loadSettings();
  };

  const refreshRate = async () => {
    const rate = await currencyService.fetchLiveRate();
    setExchangeRate(rate);
  };

  const setManualExchangeRate = async () => {
    if (manualRate && !isNaN(manualRate)) {
      await currencyService.setManualRate(parseFloat(manualRate));
      setExchangeRate(parseFloat(manualRate));
      setManualRate('');
    }
  };

  const resetToAuto = async () => {
    await currencyService.resetToAuto();
    const rate = await currencyService.getRate();
    setExchangeRate(rate);
  };

  const openTreatmentModal = (treatment = null) => {
    if (treatment) {
      setEditingTreatment(treatment);
      setTreatmentForm({ ...treatment });
    } else {
      setEditingTreatment(null);
      setTreatmentForm({ code: '', category: 'Preventive', name: '', description: '', priceUSD: 0, fdiNotation: 'Single' });
    }
    setShowTreatmentModal(true);
  };

  const saveTreatment = async () => {
    if (editingTreatment) {
      await db.treatmentCatalog.update(editingTreatment.id, treatmentForm);
    } else {
      await db.treatmentCatalog.add(treatmentForm);
    }
    await loadTreatments();
    setShowTreatmentModal(false);
  };

  const deleteTreatment = async (id) => {
    if (confirm('Delete this treatment?')) {
      await db.treatmentCatalog.delete(id);
      await loadTreatments();
    }
  };

  const syncToCloud = async () => {
    setIsSyncing(true);
    try {
      await googleSheets.syncToCloud();
      alert('Synced to Google Sheets successfully!');
    } catch (error) {
      alert('Sync failed: ' + error.message);
    }
    setIsSyncing(false);
  };

  const syncFromCloud = async () => {
    setIsSyncing(true);
    try {
      await googleSheets.syncFromCloud();
      alert('Synced from Google Sheets successfully!');
    } catch (error) {
      alert('Sync failed: ' + error.message);
    }
    setIsSyncing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure clinic and app settings</p>
      </div>

      <div className="bg-card rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Clinic Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Clinic Name</label>
            <input type="text" value={settings.clinicName || ''} 
              onChange={(e) => updateSetting('clinicName', e.target.value)}
              onBlur={(e) => updateSetting('clinicName', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input type="text" value={settings.clinicPhone || ''} 
              onChange={(e) => updateSetting('clinicPhone', e.target.value)}
              onBlur={(e) => updateSetting('clinicPhone', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Address</label>
            <input type="text" value={settings.clinicAddress || ''} 
              onChange={(e) => updateSetting('clinicAddress', e.target.value)}
              onBlur={(e) => updateSetting('clinicAddress', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Doctor Name</label>
            <input type="text" value={settings.doctorName || ''} 
              onChange={(e) => updateSetting('doctorName', e.target.value)}
              onBlur={(e) => updateSetting('doctorName', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">PMC Number</label>
            <input type="text" value={settings.doctorPMC || ''} 
              onChange={(e) => updateSetting('doctorPMC', e.target.value)}
              onBlur={(e) => updateSetting('doctorPMC', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Qualification</label>
            <input type="text" value={settings.doctorQualification || ''} 
              onChange={(e) => updateSetting('doctorQualification', e.target.value)}
              onBlur={(e) => updateSetting('doctorQualification', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg" placeholder="BDS, MPH" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={settings.doctorEmail || ''} 
              onChange={(e) => updateSetting('doctorEmail', e.target.value)}
              onBlur={(e) => updateSetting('doctorEmail', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="bg-blue-50 rounded-lg p-4 text-sm text-foreground">
            ℹ️ Changes auto-save and will appear on all invoices, prescriptions, and PDFs immediately
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Currency & Exchange Rate
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background rounded-lg">
            <div>
              <div className="font-medium">Current Rate</div>
              <div className="text-2xl font-bold text-primary-600">$1 = Rs. {exchangeRate}</div>
              <div className="text-sm text-muted-foreground">
                {settings.exchangeRateManual === 'true' ? 'Manual Rate' : 'Auto-updated hourly'}
              </div>
            </div>
            <button onClick={refreshRate} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Set Manual Rate</label>
            <div className="flex space-x-2">
              <input type="number" step="0.01" value={manualRate} onChange={(e) => setManualRate(e.target.value)}
                placeholder="Enter custom rate" className="flex-1 px-3 py-2 border rounded-lg" />
              <button onClick={setManualExchangeRate} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                Set Rate
              </button>
              {settings.exchangeRateManual === 'true' && (
                <button onClick={resetToAuto} className="px-4 py-2 border rounded-lg hover:bg-background">
                  Reset to Auto
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Cloud className="w-5 h-5 mr-2" />
          Google Sheets Sync
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <div className="font-medium">Multi-Device Sync</div>
              <div className="text-sm text-muted-foreground">Sync data across all devices using Google Sheets</div>
              {settings.lastSync && (
                <div className="text-xs text-muted-foreground mt-1">
                  Last synced: {new Date(settings.lastSync).toLocaleString()}
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <button onClick={syncToCloud} disabled={isSyncing} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {isSyncing ? 'Syncing...' : 'Sync Up'}
              </button>
              <button onClick={syncFromCloud} disabled={isSyncing} className="px-4 py-2 border rounded-lg hover:bg-background disabled:opacity-50">
                Sync Down
              </button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="mb-2">To enable Google Sheets sync:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Set up Google OAuth in .env file</li>
              <li>Click "Sync Up" to create spreadsheet</li>
              <li>Data will sync automatically every 30 seconds</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Treatment Catalog Management</h2>
          <button onClick={() => openTreatmentModal()} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <Plus className="w-4 h-4 mr-2" />Add Treatment
          </button>
        </div>
        <div className="text-sm text-muted-foreground mb-4">Total treatments: {treatments.length}</div>
        <div className="max-h-96 overflow-y-auto border rounded-lg">
          <table className="min-w-full divide-y">
            <thead className="bg-background sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Code</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">USD</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">PKR</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {treatments.map(t => (
                <tr key={t.id} className="hover:bg-background">
                  <td className="px-4 py-2 text-sm font-mono">{t.code}</td>
                  <td className="px-4 py-2 text-sm">{t.name}</td>
                  <td className="px-4 py-2 text-sm">{t.category}</td>
                  <td className="px-4 py-2 text-sm text-right">${t.priceUSD}</td>
                  <td className="px-4 py-2 text-sm text-right">Rs. {Math.round(t.priceUSD * exchangeRate).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => openTreatmentModal(t)} className="text-primary-600 hover:text-primary-900 mr-2">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteTreatment(t.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showTreatmentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-lg bg-card">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingTreatment ? 'Edit' : 'Add'} Treatment</h3>
              <button onClick={() => setShowTreatmentModal(false)}>✕</button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Code *</label>
                  <input type="text" value={treatmentForm.code} onChange={(e) => setTreatmentForm({...treatmentForm, code: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select value={treatmentForm.category} onChange={(e) => setTreatmentForm({...treatmentForm, category: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input type="text" value={treatmentForm.name} onChange={(e) => setTreatmentForm({...treatmentForm, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input type="text" value={treatmentForm.description} onChange={(e) => setTreatmentForm({...treatmentForm, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (USD) *</label>
                  <input type="number" step="0.01" value={treatmentForm.priceUSD} onChange={(e) => setTreatmentForm({...treatmentForm, priceUSD: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">PKR (Auto)</label>
                  <input type="text" value={`Rs. ${Math.round(treatmentForm.priceUSD * exchangeRate).toLocaleString()}`} disabled
                    className="w-full px-3 py-2 border rounded-lg bg-background" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">FDI Notation</label>
                <select value={treatmentForm.fdiNotation} onChange={(e) => setTreatmentForm({...treatmentForm, fdiNotation: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg">
                  <option value="Single">Single Tooth</option>
                  <option value="Multiple">Multiple Teeth</option>
                  <option value="Quadrant">Quadrant</option>
                  <option value="Arch">Full Arch</option>
                  <option value="All">All Teeth</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowTreatmentModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={saveTreatment} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                {editingTreatment ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Database Statistics</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 bg-background rounded">
            <div className="text-2xl font-bold">{settings.totalPatients || 0}</div>
            <div className="text-sm text-muted-foreground">Patients</div>
          </div>
          <div className="text-center p-4 bg-background rounded">
            <div className="text-2xl font-bold">70</div>
            <div className="text-sm text-muted-foreground">Treatments</div>
          </div>
          <div className="text-center p-4 bg-background rounded">
            <div className="text-2xl font-bold">{settings.totalInvoices || 0}</div>
            <div className="text-sm text-muted-foreground">Invoices</div>
          </div>
          <div className="text-center p-4 bg-background rounded">
            <div className="text-2xl font-bold">{settings.totalAppointments || 0}</div>
            <div className="text-sm text-muted-foreground">Appointments</div>
          </div>
        </div>
      </div>
    </div>
  );
}
