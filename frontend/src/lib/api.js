import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export function getTokens() {
  try {
    return JSON.parse(localStorage.getItem('toko_auth') || 'null');
  } catch {
    return null;
  }
}

export function setTokens(tokens) {
  if (!tokens) {
    localStorage.removeItem('toko_auth');
    return;
  }
  localStorage.setItem('toko_auth', JSON.stringify(tokens));
}

api.interceptors.request.use((config) => {
  const tokens = getTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let queue = [];

function resolveQueue(error, token) {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  queue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    // Don't attempt refresh loops on the auth endpoints themselves
    const isAuthRoute = original?.url?.includes('/auth/');

    if (status === 401 && !original._retry && !isAuthRoute) {
      const tokens = getTokens();
      if (!tokens?.refreshToken) {
        setTokens(null);
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken: tokens.refreshToken,
        });
        const newTokens = data?.data ?? data;
        const accessToken = newTokens.accessToken || newTokens.access_token;
        const refreshToken = newTokens.refreshToken || newTokens.refresh_token || tokens.refreshToken;
        setTokens({ accessToken, refreshToken });
        resolveQueue(null, accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (refreshError) {
        resolveQueue(refreshError, null);
        setTokens(null);
        window.dispatchEvent(new Event('toko:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

/** Extracts a human-readable message from the backend's error envelope. */
export function apiError(error, fallback = 'Something went wrong') {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

/** Unwraps the { success, message, data } envelope every endpoint returns. */
export function unwrap(res) {
  return res?.data?.data ?? res?.data;
}

export default api;
