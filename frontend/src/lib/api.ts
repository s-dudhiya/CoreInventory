import axios from 'axios';

// Create a configured axios instance
export const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  withCredentials: true, // Crucial for sending/receiving HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
