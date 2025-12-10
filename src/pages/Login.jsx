import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSuccess = async (credentialResponse) => {
    try {
      setError('');
      const decoded = jwtDecode(credentialResponse.credential);
      
      await login({
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture
      });

      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleError = () => {
    setError('Google Sign-In failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-primary/100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Abdullah Dental Care
          </h1>
          <p className="text-muted-foreground">
            Complete Clinic Management System
          </p>
        </div>

        {/* Clinic Info */}
        <div className="bg-primary/10 rounded-lg p-4 mb-6 text-sm text-foreground">
          <p className="font-semibold mb-1">Dr. Ahmed Abdullah Khan</p>
          <p>37-G4, Qasim Ave., Phase 2, Hayatabad</p>
          <p>Peshawar, Pakistan</p>
          <p className="mt-2">📞 +92-334-5822-622</p>
        </div>

        {/* Login Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4 text-center">
            Sign In to Continue
          </h2>
          
          {/* Authorized Users Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm">
            <p className="font-semibold text-blue-800 mb-2">Authorized Users:</p>
            <ul className="text-blue-700 space-y-1">
              <li>• Dr. Ahmed (ahmedakg@gmail.com)</li>
              <li>• Naveed (meetmrnaveed@gmail.com)</li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Google Sign-In Button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap
              theme="filled_blue"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground mt-6">
          <p>Secure login powered by Google OAuth</p>
          <p className="mt-1">Your data is encrypted and protected</p>
        </div>
      </div>
    </div>
  );
}
