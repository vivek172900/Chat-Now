import React from 'react';
import { SignUp, useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { authAPI } from '../services/api';

const Signup = () => {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn && user) {
      console.log('✅ User signed up via Clerk:', user);
      syncUserWithBackend();
    }
  }, [isSignedIn, user]);

  const syncUserWithBackend = async () => {
    try {
      console.log('🔄 Syncing new user with backend...');
      
      // Get Clerk session token
      const clerkToken = await getToken();
      console.log('🔑 Clerk token obtained');
      
      // Extract user data from Clerk
      const userData = {
        clerkUserId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        username: user.username || user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0],
        firstName: user.firstName,
        lastName: user.lastName,
        profilePic: user.imageUrl,
      };
      
      console.log('📋 New user data to sync:', userData);
      
      // Sync with backend
      const response = await authAPI.syncUser(userData);
      console.log('✅ Backend sync response:', response.data);
      
      if (response.data.success) {
        // Store token and user data in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        console.log('💾 Token saved to localStorage:', !!response.data.token);
        console.log('👤 User saved to localStorage:', response.data.user);
        
        // Navigate to dashboard
        navigate('/chat');
      } else {
        console.error('❌ Backend sync failed:', response.data.error);
      }
    } catch (error) {
      console.error('❌ Error syncing user:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Account 🚀</h1>
            <p className="text-gray-400">Sign up to join ChatApp</p>
          </div>

          <SignUp
            routing="path"
            path="/signup"
            signInUrl="/login"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none border-0 p-0",
                headerTitle: "text-white text-2xl font-bold hidden",
                headerSubtitle: "text-gray-400 hidden",
                socialButtonsBlockButton: 
                  "bg-gray-700 hover:bg-gray-600 border-0 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 mb-3",
                dividerLine: "bg-gray-700",
                dividerText: "text-gray-400",
                formFieldLabel: "text-gray-300 font-medium",
                formFieldInput: 
                  "bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                formButtonPrimary: 
                  "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200",
                footerActionText: "text-gray-400",
                footerActionLink: "text-blue-400 hover:text-blue-300",
                identityPreviewEditButton: "text-blue-400",
                formResendCodeLink: "text-blue-400",
              },
            }}
          />
        </div>
        
        <div className="bg-gray-850 px-8 py-6 border-t border-gray-700">
          <p className="text-center text-gray-400 text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;