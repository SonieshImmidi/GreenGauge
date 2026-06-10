import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  RiLeafLine, RiBarChartLine, RiLightbulbLine, RiHistoryLine,
  RiArrowRightLine, RiGlobalLine, RiPlantLine, RiGroupLine,
  RiTwitterLine, RiGithubLine, RiLinkedinLine,
  RiSunLine, RiMoonLine
} from 'react-icons/ri';
import { toggleTheme } from '../store/themeSlice';

// Animated Counter
function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const step = end / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
          current = Math.min(current + step, end);
          setCount(Math.floor(current));
          if (current >= end) clearInterval(timer);
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// Typewriter effect
function Typewriter({ words, delay = 2500 }) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      const timeout = setTimeout(() => setReverse(true), delay);
      return () => clearTimeout(timeout);
    }
    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }
    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, Math.max(reverse ? 50 : subIndex === words[index].length ? delay : 120, parseInt(Math.random() * 50)));
    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, delay, words]);

  useEffect(() => {
    const timeout2 = setInterval(() => setBlink((prev) => !prev), 500);
    return () => clearInterval(timeout2);
  }, []);

  return (
    <>
      {words[index].substring(0, subIndex)}
      <span style={{ opacity: blink ? 1 : 0, fontWeight: 300 }}>|</span>
    </>
  );
}

// Particle Canvas
function ParticleBackground() {
  const canvasRef = useRef(null);
  const theme = useSelector((s) => s.theme.mode);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.8 - 0.2,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const color = theme === 'dark' ? '0, 255, 136' : '0, 168, 90';

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${p.alpha})`;
        ctx.fill();

        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}
    />
  );
}

const FEATURES = [
  { icon: RiLeafLine, title: 'Carbon Tracking', desc: 'Track emissions from transportation, energy, food, and waste in real time.', color: 'var(--color-primary)' },
  { icon: RiBarChartLine, title: 'Analytics Dashboard', desc: 'Beautiful charts and trends to visualize your environmental impact over time.', color: 'var(--color-accent)' },
  { icon: RiLightbulbLine, title: 'Smart Recommendations', desc: 'Personalized AI-powered sustainability tips tailored to your lifestyle.', color: 'var(--color-warning)' },
  { icon: RiHistoryLine, title: 'History & Reports', desc: 'Export detailed monthly and annual carbon footprint reports in PDF or Excel.', color: 'var(--color-error)' },
];

const STATS = [
  { icon: RiGlobalLine, value: 37000000000, suffix: '+', label: 'Tonnes CO₂ Emitted Globally/Year', color: 'var(--color-error)' },
  { icon: RiPlantLine, value: 15000, suffix: '+', label: 'Users Tracking Their Impact', color: 'var(--color-primary)' },
  { icon: RiGroupLine, value: 2340, suffix: '', label: 'Trees Equivalent Saved', color: 'var(--color-accent)' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Environmental Engineer', text: 'GreenGauge completely changed how I think about my daily commute. The insights are eye-opening!', avatar: 'P' },
  { name: 'Marcus Chen', role: 'Sustainability Consultant', text: 'The personalized recommendations helped my team cut office emissions by 23% in just two months.', avatar: 'M' },
  { name: 'Aisha Patel', role: 'Climate Researcher', text: 'Clean UI, accurate calculations, and genuinely useful data. This is the tool I\'ve been looking for.', avatar: 'A' },
];

export default function Landing() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const theme = useSelector((s) => s.theme.mode);

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 40px',
        height: 64,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{
            width: 34, height: 34,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--color-primary-glow)',
          }}>
            <RiLeafLine size={18} color="var(--text-inverse)" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: 'var(--color-primary)' }}>
            GreenGauge
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={() => dispatch(toggleTheme())}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            style={{
              background: 'transparent', border: 'none',
              cursor: 'pointer', color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'color var(--transition-fast)', padding: 6
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            {theme === 'dark' ? <RiSunLine size={22} /> : <RiMoonLine size={22} />}
          </button>
          
          <div style={{ width: 1, height: 24, background: 'var(--divider)', margin: '0 8px' }} />

          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">Go to Dashboard →</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <ParticleBackground />

        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: 400, height: 400, background: 'radial-gradient(circle, var(--color-primary-dim) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 300, height: 300, background: 'radial-gradient(circle, var(--color-primary-dim) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '100px 24px 60px', textAlign: 'center' }}>
          <div className="animate-fade-up" style={{ marginBottom: 20 }}>
            <span className="badge badge-green" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
              🌍 Join 15,000+ Eco Warriors
            </span>
          </div>

          <h1 className="animate-fade-up" style={{
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            lineHeight: 1.05,
            marginBottom: 24,
            animationDelay: '0.1s',
          }}>
            Measure Your{' '}
            <span className="gradient-text" style={{ display: 'inline-block', minWidth: '8ch' }}>
              <Typewriter words={['Carbon Footprint', 'Daily Emissions', 'Eco Impact', 'Sustainability']} />
            </span>
            <br />& Save the Planet
          </h1>

          <p className="animate-fade-up" style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: 640,
            margin: '0 auto 40px',
            lineHeight: 1.7,
            animationDelay: '0.2s',
          }}>
            GreenGauge helps you understand, track, and reduce your daily carbon emissions
            through interactive dashboards, personalized insights, and actionable recommendations.
          </p>

          <div className="animate-fade-up" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.3s' }}>
            <Link to="/register" className="btn btn-primary btn-lg" style={{ fontSize: '1rem' }}>
              Start Tracking Free <RiArrowRightLine />
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Sign In
            </Link>
          </div>

          {/* Hero eco illustration */}
          <div className="animate-fade-up animate-float" style={{ marginTop: 64, animationDelay: '0.4s' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 180, height: 180,
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--color-primary-dim) 0%, transparent 70%)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--color-primary-glow)',
              animation: 'pulse-glow 3s ease-in-out infinite',
            }}>
              <span style={{ fontSize: '5rem' }}>🌍</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Impact Stats ── */}
      <section style={{ padding: '80px 0', borderTop: '1px solid var(--divider)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {STATS.map((stat, i) => (
              <div key={i} className="glass-card" style={{ padding: '32px 24px', textAlign: 'center' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: `var(--bg-input)`, border: `1px solid var(--border-color)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <stat.icon size={24} color={stat.color} />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: stat.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: '0.9rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 className="animate-fade-up" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: 16 }}>
              Everything You Need to Go <span className="gradient-text">Green</span>
            </h2>
            <p className="animate-fade-up" style={{ color: 'var(--text-secondary)', maxWidth: 540, margin: '0 auto', fontSize: '1rem', animationDelay: '0.1s' }}>
              A complete platform for tracking, understanding, and reducing your environmental impact.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {FEATURES.map((feat, i) => (
              <div key={i} className="glass-card animate-fade-up" style={{ padding: '28px 24px', animationDelay: `${i * 0.1 + 0.2}s` }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `var(--bg-input)`, border: `1px solid var(--border-color)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 18,
                }}>
                  <feat.icon size={24} color={feat.color} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{feat.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: '80px 0', borderTop: '1px solid var(--divider)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: 48 }}>
            Loved by <span className="gradient-text">Eco Champions</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="glass-card" style={{ padding: '28px 24px' }}>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, color: 'var(--text-inverse)', flexShrink: 0,
                  }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="animate-fade-up" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '60px 40px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'radial-gradient(circle, var(--color-primary-dim) 0%, transparent 70%)', borderRadius: '50%' }} />
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 800, marginBottom: 16 }}>
              Ready to Make a <span className="gradient-text">Difference?</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 32px', fontSize: '1rem' }}>
              Join thousands of eco-conscious individuals tracking and reducing their carbon footprint today.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg">
              🌱 Start Your Green Journey <RiArrowRightLine />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--divider)',
        padding: '40px 0',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            <RiLeafLine size={18} color="var(--color-primary)" />
            <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>GreenGauge</span>
          </div>
          <p style={{ marginBottom: 16 }}>Measure Your Environmental Footprint. Make Every Action Count.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 16 }}>
            {[RiTwitterLine, RiGithubLine, RiLinkedinLine].map((Icon, i) => (
              <button key={i} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: '50%', width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-muted)',
                transition: 'all var(--transition-fast)',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
          <p>© 2024 GreenGauge. Built for a sustainable future. 🌿</p>
        </div>
      </footer>
    </div>
  );
}

