import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  RiUserLine, RiMailLine, RiLockLine, RiSunLine, RiMoonLine,
  RiBellLine, RiSaveLine, RiShieldLine,
} from 'react-icons/ri';
import { updateUser } from '../store/authSlice';
import { toggleTheme } from '../store/themeSlice';
import { userApi } from '../services/api';
import { EmojiIcon } from '../utils/icons';

function Section({ title, icon: Icon, children }) {
  return (
    <div className="glass-card" style={{ padding: '28px 28px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--divider)' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-primary-dim)', border: '1px solid rgba(0,255,136,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color="var(--color-primary)" />
        </div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const theme = useSelector((s) => s.theme.mode);

  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [notifications, setNotifications] = useState(user?.notifications_enabled ?? true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleProfileSave = async () => {
    setProfileLoading(true);
    try {
      const { data } = await userApi.updateProfile(profile);
      dispatch(updateUser(data));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setProfileLoading(false); }
  };

  const handlePasswordChange = async () => {
    const e = {};
    if (!passwords.current_password) e.current = 'Required';
    if (!passwords.new_password) e.new = 'Required';
    else if (passwords.new_password.length < 6) e.new = 'Min 6 characters';
    if (passwords.new_password !== passwords.confirm_password) e.confirm = 'Passwords don\'t match';
    setErrors(e);
    if (Object.keys(e).length) return;

    setPasswordLoading(true);
    try {
      await userApi.changePassword(passwords);
      toast.success('Password changed successfully!');
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to change password.');
    } finally {
      setPasswordLoading(false); }
  };

  const handleNotificationsToggle = async () => {
    const newVal = !notifications;
    setNotifications(newVal);
    try {
      await userApi.updateProfile({ notifications_enabled: newVal });
      dispatch(updateUser({ notifications_enabled: newVal }));
      toast.success(newVal ? 'Notifications enabled' : 'Notifications disabled');
    } catch {}
  };

  const avatarLetter = (user?.name?.[0] || 'G').toUpperCase();

  return (
    <div className="animate-fade-in" style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Avatar section */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem', fontWeight: 800, color: '#0a0f0d',
          boxShadow: '0 0 24px rgba(0,255,136,0.35)',
          border: '3px solid rgba(0,255,136,0.3)',
          flexShrink: 0,
        }}>
          {avatarLetter}
        </div>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 3 }}>{user?.name}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>{user?.email}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="badge badge-green"><EmojiIcon emoji="🌿" size={14} aria-hidden="true" /> Active Member</span>
            <span className="badge badge-blue"><EmojiIcon emoji="⚡" size={14} aria-hidden="true" /> Eco Tracker</span>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <Section title="Personal Information" icon={RiUserLine}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="profile-name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <RiUserLine aria-hidden="true" size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input id="profile-name" name="name" type="text" autoComplete="name" className="form-input" style={{ paddingLeft: 40 }} value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="profile-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <RiMailLine aria-hidden="true" size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input id="profile-email" name="email" type="email" autoComplete="email" className="form-input" style={{ paddingLeft: 40 }} value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary btn-sm" onClick={handleProfileSave} disabled={profileLoading}>
              {profileLoading ? <span className="spinner" /> : <RiSaveLine />}
              {profileLoading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Appearance & Theme" icon={RiSunLine}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              {theme === 'dark' ? <><EmojiIcon emoji="🌙" size={16} aria-hidden="true" /> Dark Mode</> : <><EmojiIcon emoji="☀️" size={16} aria-hidden="true" /> Light Mode</>}
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
              {theme === 'dark' ? 'Easy on the eyes in low-light environments' : 'Clean look for bright environments'}
            </p>
          </div>
          <button
            onClick={() => dispatch(toggleTheme())}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 'var(--radius-full)',
              border: '1.5px solid var(--border-hover)',
              background: 'var(--bg-card)', cursor: 'pointer',
              color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.88rem',
              fontFamily: 'var(--font-sans)', transition: 'all var(--transition-base)',
            }}
          >
            {theme === 'dark' ? <RiSunLine size={16} /> : <RiMoonLine size={16} />}
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
          {['dark', 'light'].map((t) => (
            <div
              key={t}
              onClick={() => { if (theme !== t) dispatch(toggleTheme()); }}
              style={{
                padding: '16px', borderRadius: 'var(--radius-md)',
                border: `2px solid ${theme === t ? 'var(--color-primary)' : 'var(--border-color)'}`,
                background: t === 'dark' ? '#121212' : '#f0fff8',
                cursor: 'pointer', transition: 'all var(--transition-fast)',
                boxShadow: theme === t ? 'var(--color-primary-glow)' : 'none',
              }}
            >
              <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                {['#ff5252', '#ffb300', '#00ff88'].map((c) => <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />)}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: t === 'dark' ? '#e8fff2' : '#0d1f14' }}>
                {t === 'dark' ? <><EmojiIcon emoji="🌙" size={12} aria-hidden="true" /> Dark Mode</> : <><EmojiIcon emoji="☀️" size={12} aria-hidden="true" /> Light Mode</>}
              </div>
              {theme === t && <div style={{ fontSize: '0.68rem', color: 'var(--color-primary)', marginTop: 4 }}><EmojiIcon emoji="✓" size={11} aria-hidden="true" /> Active</div>}
            </div>
          ))}
        </div>
      </Section>

      {/* Security */}
      <Section title="Security & Password" icon={RiShieldLine}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'current_password', label: 'Current Password', errKey: 'current' },
            { key: 'new_password', label: 'New Password', errKey: 'new' },
            { key: 'confirm_password', label: 'Confirm New Password', errKey: 'confirm' },
          ].map(({ key, label, errKey }) => (
            <div key={key} className="form-group">
              <label className="form-label" htmlFor={`profile-${key}`}>{label}</label>
              <div style={{ position: 'relative' }}>
                <RiLockLine aria-hidden="true" size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input id={`profile-${key}`} name={key} type="password" autoComplete={key === 'current_password' ? 'current-password' : 'new-password'} className="form-input" style={{ paddingLeft: 40 }} placeholder="••••••••" value={passwords[key]} aria-invalid={!!errors[errKey]} aria-describedby={errors[errKey] ? `profile-${key}-error` : undefined} onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))} />
              </div>
              {errors[errKey] && <span id={`profile-${key}-error`} role="alert" style={{ color: 'var(--color-error)', fontSize: '0.78rem' }}>{errors[errKey]}</span>}
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePasswordChange} disabled={passwordLoading}>
              {passwordLoading ? <span className="spinner" /> : <RiShieldLine />}
              {passwordLoading ? 'Changing…' : 'Change Password'}
            </button>
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={RiBellLine}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Email Notifications</div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>Receive weekly carbon summaries and tips</p>
          </div>
          <button
            onClick={handleNotificationsToggle}
            style={{
              width: 52, height: 28, borderRadius: 14,
              background: notifications ? 'var(--color-primary)' : 'var(--bg-input)',
              border: `1px solid ${notifications ? 'var(--color-primary)' : 'var(--border-color)'}`,
              cursor: 'pointer', position: 'relative', transition: 'all var(--transition-base)',
              boxShadow: notifications ? '0 0 12px rgba(0,255,136,0.4)' : 'none',
            }}
          >
            <div style={{
              position: 'absolute', top: 3,
              left: notifications ? 26 : 3,
              width: 20, height: 20, borderRadius: '50%',
              background: '#fff', transition: 'left var(--transition-base)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }} />
          </button>
        </div>
      </Section>

      {/* Account Stats */}
      <div className="glass-card" style={{ padding: '20px 28px' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Account Info</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Member Since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A' },
            { label: 'Account Status', icon: '✅', value: 'Active' },
            { label: 'Theme', icon: theme === 'dark' ? '🌙' : '☀️', value: theme === 'dark' ? 'Dark' : 'Light' },
            { label: 'Plan', icon: '🌿', value: 'Free Tier' },
          ].map(({ label, icon, value }) => (
            <div key={label}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{icon && <><EmojiIcon emoji={icon} size={14} aria-hidden="true" /> </>}{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
