import { createSlice } from '@reduxjs/toolkit';

const getStoredAuth = () => {
  try {
    const token = localStorage.getItem('access_token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return { token, user, isAuthenticated: !!(token && user) };
  } catch {
    return { token: null, user: null, isAuthenticated: false };
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    ...getStoredAuth(),
    loading: false,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { access_token, refresh_token, user } = action.payload;
      state.token = access_token;
      state.user = user;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('access_token', access_token);
      if (refresh_token) localStorage.setItem('refresh_token', refresh_token);
      if (user) localStorage.setItem('user', JSON.stringify(user));
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    },
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
  },
});

export const { setCredentials, updateUser, logout, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
