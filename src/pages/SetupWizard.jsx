import { useState } from 'react';
import { Check, Cloud } from 'lucide-react';

export default function SetupWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    clinicName: 'Abdullah Dental Care',
    clinicAddress: '37-G4 Qasim Ave Phase 2, Hayatabad, Peshawar',
    clinicPhone: '+92-334-5822-622',
    doctorName: 'Dr. Ahmed Abdullah Khan',
    doctorPMC: '7071-D',
    googleClientId: ''
  });

  const handleFinish = () => {
    localStorage.setItem('setupComplete', 'true');
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Abdullah Dental Care Setup</h1>
          <p className="text-muted-foreground mt-2">Let's get your clinic management system ready</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-muted-foreground'}`}>
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && <div className={`w-20 h-1 mx-2 ${step > s ? 'bg-primary-600' : 'bg-gray-200'}`}></div>}
            </div>
          ))}
        </div>

        {/* Step 1: Clinic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Clinic Information</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Clinic Name</label>
              <input type="text" value={config.clinicName} onChange={(e) => setConfig({...config, clinicName: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input type="text" value={config.clinicAddress} onChange={(e) => setConfig({...config, clinicAddress: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="text" value={config.clinicPhone} onChange={(e) => setConfig({...config, clinicPhone: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Doctor Name</label>
              <input type="text" value={config.doctorName} onChange={(e) => setConfig({...config, doctorName: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">PMC Number</label>
              <input type="text" value={config.doctorPMC} onChange={(e) => setConfig({...config, doctorPMC: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        )}

        {/* Step 2: Google Sheets */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Cloud className="w-5 h-5 mr-2" />
              Google Sheets Integration (Optional)
            </h2>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-foreground mb-2">Enable multi-device sync with Google Sheets:</p>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 ml-2">
                <li>Go to Google Cloud Console</li>
                <li>Create project: "Abdullah Dental Care"</li>
                <li>Enable Google Sheets API & Google Drive API</li>
                <li>Create OAuth 2.0 credentials</li>
                <li>Add authorized origins</li>
                <li>Copy Client ID below</li>
              </ol>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Google OAuth Client ID (Optional)</label>
              <input type="text" value={config.googleClientId} onChange={(e) => setConfig({...config, googleClientId: e.target.value})}
                placeholder="Leave empty to skip" className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold">Setup Complete!</h2>
            <p className="text-muted-foreground">Your clinic management system is ready to use</p>
            <div className="bg-background rounded-lg p-4 text-left">
              <div className="text-sm space-y-1">
                <div><span className="font-medium">Clinic:</span> {config.clinicName}</div>
                <div><span className="font-medium">Doctor:</span> {config.doctorName}</div>
                <div><span className="font-medium">Sync:</span> {config.googleClientId ? 'Enabled' : 'Disabled (can enable later)'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}
            className="px-6 py-2 border rounded-lg disabled:opacity-50">
            Back
          </button>
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Continue
            </button>
          ) : (
            <button onClick={handleFinish} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Start Using
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
