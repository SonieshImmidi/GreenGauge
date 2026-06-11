import React, { useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store';
import { setTheme } from './store/themeSlice';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator';
import History from './pages/History';
import Recommendations from './pages/Recommendations';
import Hub from './pages/Hub';
import Profile from './pages/Profile';
import AIChatWidget from './components/AIChatWidget';
import './index.css';

function AppInner() {
  const dispatch = useDispatch();
  const theme = useSelector((s) => s.theme.mode);

  useEffect(() => {
    dispatch(setTheme(theme));
  }, []);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            backdropFilter: 'blur(16px)',
            fontFamily: 'var(--font-sans)',
          },
          success: { iconTheme: { primary: '#00ff88', secondary: '#0a0f0d' } },
          error: { iconTheme: { primary: '#ff5252', secondary: '#fff' } },
        }}
      />
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/history" element={<History />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/hub" element={<Hub />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      {/* AI Chat Widget — visible on all pages */}
      <AIChatWidget />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppInner />
    </Provider>
  );
}
