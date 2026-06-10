import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  RiDashboardLine, RiCalculatorLine, RiHistoryLine,
  RiLightbulbLine, RiBookOpenLine, RiUserLine,
  RiLeafLine, RiLogoutBoxLine,
} from 'react-icons/ri';
import { logout } from '../store/authSlice';
import { authApi } from '../services/api';

const NAV_ITEMS = [
  { to: '/dashboard',       icon: RiDashboardLine,  label: 'Dashboard' },
  { to: '/calculator',      icon: RiCalculatorLine, label: 'Calculator' },
  { to: '/history',         icon: RiHistoryLine,    label: 'History' },
  { to: '/recommendations', icon: RiLightbulbLine,  label: 'Insights' },
  { to: '/hub',             icon: RiBookOpenLine,   label: 'Eco Hub' },
  { to: '/profile',         icon: RiUserLine,       label: 'Profile' },
];

export default function Sidebar({ open }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    dispatch(logout());
    navigate('/');
  };

  return (
    <>
      <aside
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 'var(--sidebar-width)',
          height: '100vh',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform var(--transition-base)',
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <Link to="/dashboard" style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--divider)',
          display: 'flex', alignItems: 'center', gap: 10,
          textDecoration: 'none',
        }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--color-primary-glow)',
            flexShrink: 0,
          }}>
            <RiLeafLine size={20} color="#0a0f0d" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-primary)' }}>
              GreenGauge
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: -2 }}>
              Measure Your Impact
            </div>
          </div>
        </Link>

        {/* User pill */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--divider)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, color: '#0a0f0d', fontSize: '0.85rem', flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase() || 'G'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Guest'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || ''}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 'var(--radius-md)',
                marginBottom: 4,
                color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--color-primary-dim)' : 'transparent',
                border: isActive ? '1px solid rgba(0,255,136,0.2)' : '1px solid transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.9rem',
                transition: 'all var(--transition-fast)',
                textDecoration: 'none',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} style={{ flexShrink: 0, filter: isActive ? 'drop-shadow(0 0 6px var(--color-primary))' : 'none' }} />
                  {label}
                  {isActive && (
                    <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', boxShadow: '0 0 8px var(--color-primary)' }} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--divider)' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '11px 14px',
              background: 'transparent',
              border: '1px solid transparent',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-error)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'all var(--transition-fast)',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,82,82,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,82,82,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
          >
            <RiLogoutBoxLine size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
