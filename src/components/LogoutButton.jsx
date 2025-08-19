// src/components/LogoutButton.jsx
import React, { useState } from 'react';
import { LogOut, AlertTriangle } from 'lucide-react';

const LogoutButton = ({ 
  user, 
  logout, 
  variant = 'default', // 'default', 'header', 'danger'
  showConfirmation = false,
  className = ''
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (showConfirmation && !showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsLoggingOut(true);
    
    // Optional: Make API call to logout endpoint
    try {
      // await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API error:', error);
    }
    
    // Call the logout function
    logout();
    
    setIsLoggingOut(false);
    setShowConfirm(false);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  // Different button styles based on variant
  const getButtonStyle = () => {
    const baseStyle = "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    
    switch (variant) {
      case 'header':
        return `${baseStyle} text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100`;
      case 'danger':
        return `${baseStyle} bg-red-500 text-white hover:bg-red-600 shadow-sm`;
      default:
        return `${baseStyle} bg-gray-500 text-white hover:bg-gray-600 shadow-sm`;
    }
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            Are you sure you want to sign out? Any unsaved changes will be lost.
          </p>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`${getButtonStyle()} ${className}`}
      title={`Sign out ${user?.name}`}
    >
      <LogOut className="w-4 h-4" />
      {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
    </button>
  );
};

export default LogoutButton;