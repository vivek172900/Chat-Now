// src/pages/DebugAuth.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { authAPI } from '../services/api';

const DebugAuth = () => {
  const { isSignedIn, getToken, signOut } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [localStorageData, setLocalStorageData] = useState({});
  const [apiTestResult, setApiTestResult] = useState(null);

  useEffect(() => {
    // Get localStorage data
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    setLocalStorageData({
      token: token ? '✅ Present' : '❌ Missing',
      user: userData ? '✅ Present' : '❌ Missing',
      parsedUser: userData ? JSON.parse(userData) : null,
    });
  }, []);

  const testAPI = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setApiTestResult({ error: 'No token in localStorage' });
        return;
      }

      const response = await fetch('http://localhost:9000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      setApiTestResult({
        status: response.status,
        data: data
      });
    } catch (error) {
      setApiTestResult({ error: error.message });
    }
  };

  const handleManualSync = async () => {
    try {
      const clerkToken = await getToken();
      const userData = {
        clerkUserId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        username: user.username || user.firstName,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePic: user.imageUrl,
      };

      const response = await authAPI.syncUser(userData);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        alert('✅ Manual sync successful! Check localStorage.');
        window.location.reload();
      }
    } catch (error) {
      alert(`❌ Sync failed: ${error.message}`);
    }
  };

  const clearLocalStorage = () => {
    localStorage.clear();
    alert('LocalStorage cleared!');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Authentication Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Clerk Status */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Clerk Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Is Signed In:</span>
                <span className={`font-bold ${isSignedIn ? 'text-green-400' : 'text-red-400'}`}>
                  {isSignedIn ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              
              {user && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">User ID:</span>
                    <span className="text-blue-400 font-mono">{user.id}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Email:</span>
                    <span className="text-white">{user.primaryEmailAddress?.emailAddress}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Username:</span>
                    <span className="text-white">{user.username || 'Not set'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Full Name:</span>
                    <span className="text-white">{user.fullName}</span>
                  </div>
                </>
              )}
              
              <button
                onClick={() => signOut()}
                className="w-full mt-4 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
              >
                Sign Out from Clerk
              </button>
            </div>
          </div>

          {/* LocalStorage Status */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">LocalStorage Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Token:</span>
                <span className={`font-bold ${localStorageData.token?.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
                  {localStorageData.token || 'Checking...'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">User Data:</span>
                <span className={`font-bold ${localStorageData.user?.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
                  {localStorageData.user || 'Checking...'}
                </span>
              </div>
              
              {localStorageData.parsedUser && (
                <div className="mt-4 p-3 bg-gray-700 rounded">
                  <h3 className="text-gray-300 text-sm mb-2">User Object:</h3>
                  <pre className="text-xs text-gray-400 overflow-auto max-h-32">
                    {JSON.stringify(localStorageData.parsedUser, null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={clearLocalStorage}
                  className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600"
                >
                  Clear Storage
                </button>
                
                <button
                  onClick={handleManualSync}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                >
                  Manual Sync
                </button>
              </div>
            </div>
          </div>

          {/* API Test */}
          <div className="md:col-span-2 bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">API Test</h2>
            <button
              onClick={testAPI}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mb-4"
            >
              Test /api/auth/me Endpoint
            </button>
            
            {apiTestResult && (
              <div className="mt-4 p-4 bg-gray-700 rounded">
                <h3 className="text-white font-medium mb-2">API Response:</h3>
                <pre className="text-sm text-gray-300 overflow-auto max-h-48">
                  {JSON.stringify(apiTestResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="md:col-span-2 bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
              >
                Go to Login
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600"
              >
                Go to Dashboard
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugAuth;