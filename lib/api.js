import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // We intentionally do NOT globally redirect on 401 here because it ruins public pages.
    // AuthContext and specific protected route guards handle redirects instead.
    return Promise.reject(error);
  }
);
