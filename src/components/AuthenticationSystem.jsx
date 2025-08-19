import React, { useState, useContext, createContext, useEffect } from 'react';
import { Eye, EyeOff, Lock, User, Shield, AlertTriangle, CheckCircle, UserCheck } from 'lucide-react';

// Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check for existing token in memory (since we can't use localStorage in artifacts)
    // In a real app, you'd check localStorage/sessionStorage here
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role
        });
        setToken(data.token);
        
        // In a real app, you'd store the token in localStorage:
        // localStorage.setItem('authToken', data.token);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.message || 'Invalid credentials' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Network error. Please check your connection.' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // In a real app: localStorage.removeItem('authToken');
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    const permissions = {
      ADMIN: ['create_bookings', 'view_bookings', 'edit_bookings'],
      PARENT: ['create_bookings', 'view_bookings', 'edit_bookings', 'export_excel', 'app_control']
    };
    
    return permissions[user.role]?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      login, 
      logout, 
      hasPermission, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Login Form Component (Signup functionality removed)
const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
    
    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600 mt-2">Sign in to your booking account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>

          
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { user, logout, hasPermission } = useAuth();

  const roleColors = {
    ADMIN: 'bg-blue-100 text-blue-800',
    PARENT: 'bg-purple-100 text-purple-800'
  };

  const roleIcons = {
    ADMIN: User,
    PARENT: Shield
  };

  const RoleIcon = roleIcons[user?.role] || User;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Booking Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <RoleIcon className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.name}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[user?.role]}`}>
                  {user?.role}
                </span>
              </div>
              
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Booking Forms */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Forms</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
                Flight Booking
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
                Hotel Booking
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
                Car Rental
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
                Visa Booking
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
                Airport Transfer
              </button>
            </div>
          </div>

          {/* Excel Export - Only for PARENT role */}
          {hasPermission('export_excel') && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Data Export</h3>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                Export to Excel
              </button>
              <p className="text-xs text-gray-500 mt-2">Export all booking data to Excel format</p>
            </div>
          )}

          {/* App Control - Only for PARENT role */}
          {hasPermission('app_control') && (
            <div className="bg-white rounded-lg shadow p-6 border-2 border-red-200">
              <h3 className="text-lg font-medium text-red-900 mb-4">App Control</h3>
              <div className="space-y-2">
                <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors">
                  Maintenance Mode
                </button>
                <button className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors">
                  Shutdown App
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Developer controls for app management</p>
            </div>
          )}
        </div>

        {/* Role-specific welcome message */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                Welcome, {user?.name}!
              </h3>
              <p className="text-gray-600 mt-1">
                {user?.role === 'ADMIN' 
                  ? 'You have admin access to create and manage bookings for your company.'
                  : 'You have parent access with full control over the application including Excel export and app management.'
                }
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Main Authentication System Component (Signup removed)
const AuthenticationSystem = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  return <LoginForm />;
};

// Default export
export default AuthenticationSystem;