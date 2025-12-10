import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, User } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLocalLogin = async (email, name) => {
    try {
      setError('');

      // Call the existing AuthContext login() but with a fake "googleUser" object
      await login({
        email,
        name,
        picture: '',
      });

      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-xl border border-border p-8 max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
            <Shield className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Abdullah Dental Care
          </h1>
          <p className="text-muted-foreground text-sm">
            Complete Clinic Management System
          </p>
        </div>

        {/* Clinic Info */}
        <div className="bg-muted rounded-lg p-4 mb-6 text-sm text-foreground">
          <p className="font-semibold mb-1">Dr. Ahmed Abdullah Khan</p>
          <p>37-G4, Qasim Ave., Phase 2, Hayatabad</p>
          <p>Peshawar, Pakistan</p>
          <p className="mt-2">📞 +92-334-5822-622</p>
        </div>

        <div className="mb-6">
                    {/* Login choices */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2 text-center">
              Sign in to continue
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Choose who is using the clinic system right now.
            </p>

            {error && (
              <div className="bg-destructive/5 border border-destructive rounded-lg p-3 mb-4 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                type="button"
                onClick={() =>
                  handleLocalLogin('ahmedakg@gmail.com', 'Dr. Ahmed Abdullah Khan')
                }
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
              >
                <User className="w-4 h-4" />
                Sign in as Dr. Ahmed
              </button>

              <button
                type="button"
                onClick={() =>
                  handleLocalLogin('meetmrnaveed@gmail.com', 'Naveed')
                }
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition"
              >
                <User className="w-4 h-4" />
                Sign in as Naveed
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground mt-6">
            <p>Local secure login. Google Sign-In is disabled.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

