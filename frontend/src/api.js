import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://protective-solace-production-b001.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log the error for debugging
    console.error('API Interceptor Error:', error);
    console.error('Status:', error.response?.status);
    console.error('URL:', error.config?.url);
    
    // Don't auto-redirect on 401 during loan application
    // Let the component handle it
    if (error.response?.status === 401 && !error.config?.url?.includes('/loans/apply')) {
      console.error('Authentication failed - redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;

