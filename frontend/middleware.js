// middleware.js
import { authAPI } from './api';

/**
 * Check if current user has userId
 * If not, redirect to userId setup page
 */
export const requireUserId = async (to, from, next) => {
  try {
    const response = await authAPI.getCurrentUser();
    const user = response.data.user;
    
    if (!user || !user.userId) {
      // User doesn't have userId, redirect to setup
      console.log('User does not have userId, redirecting to setup');
      next('/setup-user-id');
    } else {
      // User has userId, allow access
      next();
    }
  } catch (error) {
    console.error('Error checking userId:', error);
    // If there's an error, redirect to login
    next('/login');
  }
};

/**
 * Check if current user has userId (non-blocking)
 * Returns true/false without redirecting
 */
export const hasUserId = async () => {
  try {
    const response = await authAPI.getCurrentUser();
    const user = response.data.user;
    return user && user.userId;
  } catch (error) {
    console.error('Error checking userId:', error);
    return false;
  }
};

/**
 * Ensure userId exists for current user
 * If not, create one automatically
 */
export const ensureUserId = async () => {
  try {
    const response = await authAPI.getCurrentUser();
    const user = response.data.user;
    
    if (!user || !user.userId) {
      console.log('Creating userId for user...');
      // Call backend to add userId
      const addUserIdResponse = await authAPI.addUserId({});
      if (addUserIdResponse.data.success) {
        console.log('userId created:', addUserIdResponse.data.user.userId || addUserIdResponse.data.userId);
        return addUserIdResponse.data.user?.userId || addUserIdResponse.data.userId || null;
      }
      return null;
    }
    
    return user.userId;
  } catch (error) {
    console.error('Error ensuring userId:', error);
    return null;
  }
};

/**
 * Initialize userId check on app startup
 */
export const initializeUserId = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return false;
  }
  
  try {
    const hasId = await hasUserId();
    
    if (!hasId) {
      // Try to create userId automatically
      const newUserId = await ensureUserId();
      if (newUserId) {
        console.log('Auto-created userId on startup:', newUserId);
        return true;
      }
    }
    
    return hasId;
  } catch (error) {
    console.error('Error initializing userId:', error);
    return false;
  }
};