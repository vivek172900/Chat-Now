// API utility functions for handling authentication and requests

const API_BASE_URL = 'http://localhost:9000';

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return { success: true, data, status: response.status };
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    return { 
      success: false, 
      error: error.message || 'Network error occurred',
      status: error.status || 500 
    };
  }
};

// Authentication API calls
export const authAPI = {
  register: async (userData) => {
    return apiCall('/api/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  login: async (credentials) => {
    return apiCall('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
};

// User API calls
export const userAPI = {
  getAllUsers: async () => {
    return apiCall('/api/allusers');
  },
};

// Utility functions
export const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('Email');
  localStorage.removeItem('Fullname');
  localStorage.removeItem('Username');
  localStorage.removeItem('UserId');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

export default { authAPI, userAPI, clearAuthData, isAuthenticated };