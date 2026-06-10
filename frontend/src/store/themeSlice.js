import { createSlice } from '@reduxjs/toolkit';

const getStoredTheme = () => {
  try {
    return localStorage.getItem('theme') || 'dark';
  } catch {
    return 'dark';
  }
};

const safeSetStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {}
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: getStoredTheme(),
  },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      safeSetStorage('theme', state.mode);
      document.documentElement.setAttribute('data-theme', state.mode);
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      safeSetStorage('theme', action.payload);
      document.documentElement.setAttribute('data-theme', action.payload);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
