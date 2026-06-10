import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { RiLeafLine, RiMailLine, RiLockLine, RiUserLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { setCredentials } from '../store/authSlice';
import { authApi, userApi } from '../services/api';
import { EmojiIcon } from '../utils/icons';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm_password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!form.confirm_password) e.confirm_password = 'Please confirm your password';
    else if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authApi.register(form);
      // Auto-login after register
      const { data: tokens } = await authApi.login({ email: form.email, password: form.password });
      localStorage.setItem('access_token', tokens.access_token);
      const { data: user } = await userApi.getProfile();
      dispatch(setCredentials({ ...tokens, user }));
      toast.success(`Welcome to GreenGauge, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      let msg = 'Registration failed. Please try again.';
      if (err.response?.data?.detail) {
        msg = Array.isArray(err.response.data.detail) ? err.response.data.detail[0].msg : err.response.data.detail;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColor = ['', '#ff5252', '#ffb300', '#00ff88'][strength];
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][strength];

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '10%', right: '15%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #00ff88, #00d4ff)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(0,255,136,0.4)' }}>
              <RiLeafLine size={24} color="#0a0f0d" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--color-primary)' }}>GreenGauge</span>
          </Link>
        </div>

        <div className="glass-card" style={{ padding: '40px 36px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 6, textAlign: 'center' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: 32, fontSize: '0.9rem' }}>
            Start your sustainability journey today
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <div style={{ position: 'relative' }}>
                <RiUserLine aria-hidden="true" size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input id="reg-name" name="name" type="text" autoComplete="name" className="form-input" style={{ paddingLeft: 40 }} placeholder="Jane Smith" value={form.name} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'reg-name-error' : undefined} onChange={handleChange('name')} />
              </div>
              {errors.name && <span id="reg-name-error" role="alert" style={{ color: 'var(--color-error)', fontSize: '0.78rem' }}>{errors.name}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <RiMailLine aria-hidden="true" size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input id="reg-email" name="email" type="email" autoComplete="email" className="form-input" style={{ paddingLeft: 40 }} placeholder="you@example.com" value={form.email} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'reg-email-error' : undefined} onChange={handleChange('email')} />
              </div>
              {errors.email && <span id="reg-email-error" role="alert" style={{ color: 'var(--color-error)', fontSize: '0.78rem' }}>{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <RiLockLine aria-hidden="true" size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input id="reg-password" name="password" type={showPw ? 'text' : 'password'} autoComplete="new-password" className="form-input" style={{ paddingLeft: 40, paddingRight: 44 }} placeholder="••••••••" value={form.password} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'reg-password-error' : undefined} onChange={handleChange('password')} />
                <button type="button" onClick={() => setShowPw((p) => !p)} aria-label={showPw ? 'Hide password' : 'Show password'} aria-pressed={showPw} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}>
                  {showPw ? <RiEyeOffLine aria-hidden="true" size={16} /> : <RiEyeLine aria-hidden="true" size={16} />}
                </button>
              </div>
              {form.password && (
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 6 }}>
                  {[1, 2, 3].map((n) => (
                    <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: n <= strength ? strengthColor : 'var(--bg-input)', transition: 'background 0.3s' }} />
                  ))}
                  <span style={{ fontSize: '0.72rem', color: strengthColor, fontWeight: 600, marginLeft: 6 }}>{strengthLabel}</span>
                </div>
              )}
              {errors.password && <span id="reg-password-error" role="alert" style={{ color: 'var(--color-error)', fontSize: '0.78rem' }}>{errors.password}</span>}
            </div>

            {/* Confirm */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <RiLockLine aria-hidden="true" size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input id="reg-confirm" name="confirm_password" type="password" autoComplete="new-password" className="form-input" style={{ paddingLeft: 40 }} placeholder="••••••••" value={form.confirm_password} aria-invalid={!!errors.confirm_password} aria-describedby={errors.confirm_password ? 'reg-confirm-error' : undefined} onChange={handleChange('confirm_password')} />
              </div>
              {errors.confirm_password && <span id="reg-confirm-error" role="alert" style={{ color: 'var(--color-error)', fontSize: '0.78rem' }}>{errors.confirm_password}</span>}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.95rem', marginTop: 4 }}>
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Creating Account…' : <><EmojiIcon emoji="🌿" size={16} aria-hidden="true" /> Create Account</>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
