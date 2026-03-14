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

export default api;
