import { authAPI } from './api';

export const requireUserId = async (to, from, next) => {
  try {
    const response = await authAPI.getCurrentUser();
    const user = response.data.user;
    
    if (!user || !user.userId) {
      console.log('User does not have userId, redirecting to setup');
      next('/setup-user-id');
    } else {
      next();
    }
  } catch (error) {
    console.error('Error checking userId:', error);
    next('/login');
  }
};

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

export const ensureUserId = async () => {
  try {
    const response = await authAPI.getCurrentUser();
    const user = response.data.user;
    
    if (!user || !user.userId) {
      console.log('Creating userId for user...');
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