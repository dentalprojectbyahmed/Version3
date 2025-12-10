import { useState } from 'react';
import { Lock, X } from 'lucide-react';

export default function PINProtection({ onSuccess, onCancel }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Get stored PIN from localStorage
    const storedPIN = localStorage.getItem('settings_pin');
    
    if (!storedPIN) {
      setError('No PIN set. Please set a PIN in Settings first.');
      return;
    }

    if (pin === storedPIN) {
      onSuccess();
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Enter PIN</h2>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-muted-foreground hover:text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <p className="text-muted-foreground mb-6">
          This action requires administrator PIN verification.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter 4-digit PIN"
            maxLength={4}
            className="w-full px-4 py-3 border border-border rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            autoFocus
          />

          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3 mt-6">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-background"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary/100 text-white rounded-lg hover:bg-sky-600"
            >
              Verify
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
