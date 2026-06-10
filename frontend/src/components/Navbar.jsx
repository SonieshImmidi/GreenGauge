import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RiMenuLine, RiSunLine, RiMoonLine, RiNotification3Line } from 'react-icons/ri';
import { toggleTheme } from '../store/themeSlice';

const PAGE_TITLES = {
  '/dashboard':       { title: 'Dashboard',   sub: 'Your environmental impact overview' },
  '/calculator':      { title: 'Calculator',  sub: 'Measure your carbon footprint' },
  '/history':         { title: 'History',     sub: 'Track your emission records' },
  '/recommendations': { title: 'Insights',    sub: 'Personalized sustainability tips' },
  '/hub':             { title: 'Eco Hub',     sub: 'Environmental awareness & education' },
  '/profile':         { title: 'Profile',     sub: 'Manage your account settings' },
};

export default function Navbar({ onMenuClick }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const theme = useSelector((s) => s.theme.mode);
  const user = useSelector((s) => s.auth.user);
  const { title, sub } = PAGE_TITLES[location.pathname] || { title: 'GreenGauge', sub: '' };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      right: 0,
      left: 'var(--sidebar-width)',
      height: 'var(--navbar-height)',
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--divider)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: 16,
      zIndex: 90,
      transition: 'left var(--transition-base)',
    }}>
      <button
        onClick={onMenuClick}
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)', padding: '8px',
          cursor: 'pointer', color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all var(--transition-fast)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
      >
        <RiMenuLine size={20} />
      </button>

      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{title}</h1>
        {sub && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>{sub}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Theme Toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-full)', padding: '8px 14px',
            cursor: 'pointer', color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: '0.8rem', fontWeight: 500, fontFamily: 'var(--font-sans)',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          {theme === 'dark' ? <RiSunLine size={16} /> : <RiMoonLine size={16} />}
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>

        {/* Notification bell */}
        <button style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: '50%', width: 38, height: 38,
          cursor: 'pointer', color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', transition: 'all var(--transition-fast)',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <RiNotification3Line size={18} />
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--color-primary)',
            boxShadow: '0 0 6px var(--color-primary)',
          }} />
        </button>

        {/* Avatar */}
        <Link to="/profile" style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, color: '#0a0f0d', fontSize: '0.85rem',
          border: '2px solid var(--border-color)',
          transition: 'border-color var(--transition-fast)',
          textDecoration: 'none',
          flexShrink: 0,
        }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
        >
          {user?.name?.[0]?.toUpperCase() || 'G'}
        </Link>
      </div>
    </header>
  );
}
