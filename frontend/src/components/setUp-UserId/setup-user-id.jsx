import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

const SetupUserId = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        setUserData(response.data.user);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
      }
    };

    fetchUserData();
  }, []);

  const [desiredId, setDesiredId] = useState('');
  const [available, setAvailable] = useState(null);

  const isValidFormat = (id) => /^[a-zA-Z0-9_.-]{6,30}$/.test(id);

  useEffect(() => {
    if (userData && userData.userId && String(userData.userId).length > 5) {
      navigate('/chat');
    }
  }, [userData, navigate]);

  useEffect(() => {
    let cancel = false;
    const check = async () => {
      if (!desiredId || !isValidFormat(desiredId)) {
        setAvailable(null);
        return;
      }
      try {
        const res = await authAPI.checkUserId(desiredId);
        if (!cancel) setAvailable(res.data.available);
      } catch (err) {
        if (!cancel) setAvailable(null);
      }
    };
    const t = setTimeout(check, 400);
    return () => {
      cancel = true;
      clearTimeout(t);
    };
  }, [desiredId]);

  const handleSetupUserId = async () => {
    setLoading(true);
    setError('');

    try {
      if (!desiredId || !isValidFormat(desiredId)) {
        setError('Please enter a valid userId (6-30 chars, letters, numbers, _, ., -)');
        setLoading(false);
        return;
      }

      if (available === false) {
        setError('That userId is already taken. Choose another.');
        setLoading(false);
        return;
      }

      const response = await authAPI.addUserId({ userId: desiredId });

      if (response.data && response.data.success) {
        setSuccess(true);
        const returnedUser = response.data.user || { ...userData, userId: response.data.userId };
        setUserData(returnedUser);

        try {
          const me = await authAPI.getCurrentUser();
          if (me.data && me.data.success) {
            localStorage.setItem('user', JSON.stringify(me.data.user));
          }
        } catch (err) {
          console.warn('Failed to refresh current user after setting userId', err);
        }

        setTimeout(() => {
          navigate('/chat');
        }, 500);
      } else {
        setError(response.data.error || 'Failed to setup userId');
      }
    } catch (error) {
      console.error('Error setting up userId:', error);
      setError(error.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Setup Your Account</h1>
          <p className="text-gray-400">We need to generate a unique ID for your account</p>
        </div>

        {userData && (
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                {userData.username?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="text-white font-medium">{userData.username}</h3>
                <p className="text-gray-400 text-sm">{userData.email}</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Your account is missing a unique identifier. This helps us manage your data securely.
            </p>
          </div>
        )}

        {success ? (
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-green-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">UserId created successfully!</span>
            </div>
            <p className="text-green-300 text-sm mt-2">
              Redirecting you to the chat...
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300">Choose your unique userId</label>
                <input
                  value={desiredId}
                  onChange={e => setDesiredId(e.target.value.trim())}
                  placeholder="e.g., alice_123"
                  className="w-full mt-2 p-2 rounded bg-gray-800 text-white"
                />
                <div className="mt-2 text-xs">
                  {!desiredId && <span className="text-red-400">Please enter a userId (minimum 6 characters)</span>}
                  {desiredId && !isValidFormat(desiredId) && <span className="text-red-400">Invalid format (6-30 chars, letters, numbers, underscore, dot, hyphen)</span>}
                  {desiredId && isValidFormat(desiredId) && available === null && <span className="text-gray-400">Checking availability…</span>}
                  {desiredId && isValidFormat(desiredId) && available === true && <span className="text-green-400">Available ✅</span>}
                  {desiredId && isValidFormat(desiredId) && available === false && <span className="text-red-400">Taken ❌ - choose another</span>}
                </div>
              </div>

              <button
                onClick={handleSetupUserId}
                disabled={loading || available !== true}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Setting up...
                  </>
                ) : (
                  'Set userId'
                )}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-xs">
                This is a one-time setup. Your userId will be used to identify you across the platform.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SetupUserId;