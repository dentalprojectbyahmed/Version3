import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/database';

const AuthContext = createContext(null);

// Authorized users
const AUTHORIZED_USERS = {
  'ahmedakg@gmail.com': {
    role: 'admin',
    name: 'Dr. Ahmed Abdullah Khan',
    permissions: ['all']
  },
  'meetmrnaveed@gmail.com': {
    role: 'user',
    name: 'Naveed',
    permissions: ['patients', 'appointments', 'treatments', 'prescriptions', 'billing']
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('dental_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (e) {
        localStorage.removeItem('dental_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (googleUser) => {
    const email = googleUser.email;
    
    // Check if user is authorized
    if (!AUTHORIZED_USERS[email]) {
      throw new Error('Unauthorized user. Only Dr. Ahmed and Naveed can access this app.');
    }

    const userData = {
      email,
      name: googleUser.name || AUTHORIZED_USERS[email].name,
      picture: googleUser.picture,
      role: AUTHORIZED_USERS[email].role,
      permissions: AUTHORIZED_USERS[email].permissions,
      loginTime: new Date().toISOString()
    };

    // Store user session
    localStorage.setItem('dental_user', JSON.stringify(userData));
    setUser(userData);

    // Log login activity
    await db.activityLog.add({
      userId: email,
      action: 'login',
      timestamp: new Date().toISOString()
    });

    return userData;
  };

  const logout = async () => {
    if (user) {
      // Log logout activity
      await db.activityLog.add({
        userId: user.email,
        action: 'logout',
        timestamp: new Date().toISOString()
      });
    }

    localStorage.removeItem('dental_user');
    setUser(null);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'admin') return true; // Admin has all permissions
    return user.permissions.includes(permission);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
