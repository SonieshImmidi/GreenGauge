import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import carbonReducer from './carbonSlice';
import themeReducer from './themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    carbon: carbonReducer,
    theme: themeReducer,
  },
});

export default store;
