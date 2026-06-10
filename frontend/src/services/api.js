import axios from 'axios';
import store from '../store';
import { logout, setCredentials } from '../store/authSlice';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE}/api/auth/refresh-token`, {
            refresh_token: refresh,
          });
          const { access_token, refresh_token } = res.data;
          store.dispatch(setCredentials({ access_token, refresh_token, user: store.getState().auth.user }));
          original.headers.Authorization = `Bearer ${access_token}`;
          return api(original);
        } catch {
          store.dispatch(logout());
        }
      } else {
        store.dispatch(logout());
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  refresh: (refresh_token) => api.post('/api/auth/refresh-token', { refresh_token }),
};

// ─── Carbon ──────────────────────────────────────────────────────────
export const carbonApi = {
  calculate: (data) => api.post('/api/carbon/calculate', data),
  history: (params) => api.get('/api/carbon/history', { params }),
  report: () => api.get('/api/carbon/report'),
};

// ─── User ─────────────────────────────────────────────────────────────
export const userApi = {
  getProfile: () => api.get('/api/user/profile'),
  updateProfile: (data) => api.put('/api/user/profile', data),
  changePassword: (data) => api.post('/api/user/change-password', data),
};

// ─── Recommendations ──────────────────────────────────────────────────
export const recommendationsApi = {
  get: () => api.get('/api/recommendations'),
};

export default api;
