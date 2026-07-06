import axios from 'axios';

/**
 * Admin API client.
 *
 * Calls go to the same-origin BFF proxy (`/api/proxy/*`), which attaches the
 * access token from an httpOnly cookie and refreshes it server-side. The browser
 * never holds a token, so there is nothing for XSS to steal and no token logic
 * here — just send the request with credentials and, on a 401 the server
 * couldn't recover, bounce to login.
 */
const apiClient = axios.create({
  baseURL: '/api/proxy',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !window.location.pathname.includes('/login')
    ) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default apiClient;
