import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:8000/api/`;
  }
  return 'http://127.0.0.1:8000/api/';
};

// Create a configured axios instance
export const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // Crucial for sending/receiving HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop if refresh itself fails with 401
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('auth/refresh')) {
      originalRequest._retry = true;
      try {
        await axios.post(`${getBaseURL()}auth/refresh/`, {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {
        // Clear auth state and redirect if refresh fails
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
