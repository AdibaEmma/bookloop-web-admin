import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Check if token is about to expire (within 60 seconds)
const isTokenExpiringSoon = (): boolean => {
  if (typeof window === 'undefined') return false;
  const expiresAt = localStorage.getItem('admin_token_expires_at');
  if (!expiresAt) return false;

  const expiryTime = parseInt(expiresAt, 10);
  const bufferTime = 60 * 1000; // 60 seconds buffer
  return Date.now() >= expiryTime - bufferTime;
};

// Refresh the access token using refresh token
const refreshAccessToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;

  const refreshToken = localStorage.getItem('admin_refresh_token');
  if (!refreshToken) {
    return null;
  }

  try {
    // Use a separate axios instance to avoid interceptor loops
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/refresh`,
      { refresh_token: refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const { tokens } = response.data.result || response.data;

    if (tokens?.access_token) {
      localStorage.setItem('admin_token', tokens.access_token);
      if (tokens.refresh_token) {
        localStorage.setItem('admin_refresh_token', tokens.refresh_token);
      }
      if (tokens.expires_in) {
        localStorage.setItem('admin_token_expires_at', String(Date.now() + (tokens.expires_in * 1000)));
      }
      return tokens.access_token;
    }

    return null;
  } catch (error) {
    // Refresh failed - clear all tokens and redirect to login
    clearAuthData();
    return null;
  }
};

// Clear all authentication data
const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_token_expires_at');
    localStorage.removeItem('admin_user');
  }
};

// Request interceptor to add auth token and proactively refresh if expiring
apiClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      // Proactively refresh token if it's about to expire
      if (isTokenExpiringSoon() && !isRefreshing && !config.url?.includes('/auth/')) {
        isRefreshing = true;
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
          }
        } finally {
          isRefreshing = false;
        }
      } else {
        const token = localStorage.getItem('admin_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh if this is an auth endpoint
      if (originalRequest.url?.includes('/auth/')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        if (newToken) {
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } else {
          // Refresh failed - redirect to login
          processQueue(new Error('Refresh token failed'), null);
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          clearAuthData();
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
