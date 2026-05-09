import axios from 'axios';
import { supabase } from './supabase';

const API_URL =
  typeof window !== 'undefined'
    ? '/backend/api'
    : `${process.env.BACKEND_URL || 'http://localhost:3001'}/api`;

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production' && API_URL.includes('localhost')) {
  console.warn('WARNING: API_URL is pointing to localhost in a production build. This will likely fail in the browser.');
}

/**
 * Axios instance pre-configured to attach the Supabase access token
 * to every request as a Bearer token.
 */
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Supabase JWT
api.interceptors.request.use(async (config) => {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // eslint-disable-next-line no-console
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} | Token Present`);
    } else {
      // eslint-disable-next-line no-console
      console.warn(`[API Request] ${config.method?.toUpperCase()} ${config.url} | No Token Found`);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[API Request Error]', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor: handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    const originalRequest = error.config;

    // Only try to refresh once per request
    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (originalRequest) originalRequest._retry = true;
      // eslint-disable-next-line no-console
      console.warn('API returned 401. Attempting to refresh Supabase session...');

      const { data, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError || !data.session) {
        // eslint-disable-next-line no-console
        console.error('Session refresh failed. Redirecting to login.');
        if (typeof window !== 'undefined') {
          // Clear any corrupted state
          await supabase.auth.signOut();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      // Session refreshed! Retry the original request with the new token
      // eslint-disable-next-line no-console
      console.log('Session refreshed successfully. Retrying request...');
      if (originalRequest) {
        originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`;
        return api(originalRequest);
      }
    }

    const status = error.response?.status;
    const data = error.response?.data;
    const message = error.message;
    const url = error.config?.url;

    // eslint-disable-next-line no-console
    console.error(`[API Error] ${message} | Status: ${status} | URL: ${url}`);
    if (data) {
      // eslint-disable-next-line no-console
      console.error('[API Error Data]', data);
    }
    return Promise.reject(error);
  },
);
