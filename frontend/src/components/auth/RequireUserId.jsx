import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

const RequireUserId = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        // Not logged in
        navigate('/login', { replace: true });
        return;
      }

      try {
        const res = await authAPI.getCurrentUser();
        if (!mounted) return;

        if (!(res.data && res.data.success && res.data.user)) {
          // Something wrong with session, go to login
          navigate('/login', { replace: true });
          return;
        }

        const user = res.data.user;
        if (!user.userId || String(user.userId).length < 6) {
          // enforce userId policy
          navigate('/setup-user-id', { replace: true });
          return;
        }

        // All good - allow access
        setLoading(false);
      } catch (err) {
        console.error('RequireUserId check failed:', err);
        navigate('/login', { replace: true });
      }
    };

    check();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Checking account...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireUserId;
