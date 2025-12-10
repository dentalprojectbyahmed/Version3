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
