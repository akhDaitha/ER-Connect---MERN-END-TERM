import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor for handling common error responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(customMessage));
  }
);

export default api;
