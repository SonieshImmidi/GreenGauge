import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  RiLeafLine, RiBarChartLine, RiLightbulbLine, RiHistoryLine,
  RiArrowRightLine, RiGlobalLine, RiPlantLine, RiGroupLine,
  RiTwitterLine, RiGithubLine, RiLinkedinLine,
  RiSunLine, RiMoonLine, RiCarLine, RiFlightTakeoffLine,
  RiRestaurantLine, RiSaveLine, RiCheckLine,
} from 'react-icons/ri';
import { toggleTheme } from '../store/themeSlice';
import { EmojiIcon } from '../utils/icons';
import { carbonApi } from '../services/api';
import toast from 'react-hot-toast';

// ── Animated Counter ─────────────────────────────────────────────────
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

// ── Typewriter ────────────────────────────────────────────────────────
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

// ── Particle Canvas ────────────────────────────────────────────────────
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
      aria-hidden="true"
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}
    />
  );
}

// ── CO₂ Gauge Needle ──────────────────────────────────────────────────
function CO2Gauge({ value, max = 25 }) {
  const pct = Math.min(value / max, 1);
  // Color stops: green → yellow → orange → red
  const hue = Math.max(0, 120 - pct * 120);
  const color = `hsl(${hue}, 90%, 50%)`;
  const angle = -135 + pct * 270; // -135° to +135°

  return (
    <div style={{ position: 'relative', width: 160, height: 90, margin: '0 auto 8px' }} aria-hidden="true">
      {/* Arc background */}
      <svg width="160" height="90" viewBox="0 0 160 90" overflow="visible">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ff88" />
            <stop offset="33%" stopColor="#ffb300" />
            <stop offset="66%" stopColor="#ff6b35" />
            <stop offset="100%" stopColor="#ff3232" />
          </linearGradient>
        </defs>
        <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" strokeLinecap="round" />
        <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="url(#gaugeGrad)" strokeWidth="10" strokeLinecap="round" opacity="0.4" />
        {/* Needle */}
        <g transform={`translate(80,80) rotate(${angle})`}>
          <line x1="0" y1="0" x2="0" y2="-58" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <circle cx="0" cy="0" r="6" fill={color} />
        </g>
      </svg>
    </div>
  );
}

// ── Reusable Slider+Input row ─────────────────────────────────────────
function SliderRow({ id, label, icon: Icon, iconColor, value, setValue, min, max, step = 1, unit, marks }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
        <label htmlFor={id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          <Icon size={17} color={iconColor} aria-hidden="true" /> {label}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <input
            type="number" min={min} max={max}
            value={value}
            onChange={(e) => setValue(Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
            aria-label={`${label}: enter value directly`}
            style={{
              width: 62, padding: '3px 7px', textAlign: 'center',
              background: 'var(--bg-input)', border: `1.5px solid ${iconColor}44`,
              borderRadius: 'var(--radius-sm)', color: iconColor,
              fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-sans)',
              outline: 'none', MozAppearance: 'textfield', appearance: 'textfield',
            }}
            onFocus={(e) => { e.target.style.borderColor = iconColor; }}
            onBlur={(e) => { e.target.style.borderColor = `${iconColor}44`; }}
          />
          <span style={{ fontSize: '0.75rem', color: iconColor, fontWeight: 600, minWidth: 28 }}>{unit}</span>
        </div>
      </div>
      <input
        id={id} type="range" min={min} max={max} step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        aria-label={`${label}: ${value} ${unit}`}
        style={{ width: '100%', accentColor: iconColor, cursor: 'pointer' }}
      />
      {marks && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 3 }}>
          {marks.map((m, i) => <span key={i}>{m}</span>)}
        </div>
      )}
    </div>
  );
}

// ── Carbon Estimator Section ──────────────────────────────────────────
function CarbonEstimator({ isAuthenticated }) {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────
  const [carKm, setCarKm] = useState(30);
  const [flights, setFlights] = useState(2);
  const [meatMeals, setMeatMeals] = useState(7);
  const [waterLitres, setWaterLitres] = useState(150);
  const [lpgKg, setLpgKg] = useState(10);
  const [streamingHrs, setStreamingHrs] = useState(2);
  const [clothesBought, setClothesBought] = useState(2);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ── Emission Calculations (kg CO₂) ────────────────────────────
  // Transportation
  const carEmissions = carKm * 365 * 0.192;           // 0.192 kg CO₂/km (DEFRA)
  const flightEmissions = flights * 4000 * 0.195;      // 4000km avg × 0.195 kg/km

  // Diet: map meat meals/week to daily factor × 365
  const dietFactor = meatMeals === 0 ? 1.50 : meatMeals <= 3 ? 1.70 : meatMeals <= 10 ? 2.50 : 3.30;
  const foodEmissions = dietFactor * 365;

  // Water: 0.0003 kg CO₂/litre × 365 days
  const waterEmissions = waterLitres * 0.0003 * 365;

  // LPG / cooking gas: 3.0 kg CO₂/kg
  const lpgEmissions = lpgKg * 3.0 * 12;              // monthly × 12

  // Streaming: 0.036 kg CO₂/hour × hrs/day × 365
  const digitalEmissions = streamingHrs * 0.036 * 365;

  // Shopping: avg T-shirt 7kg × # per month × 12
  const shoppingEmissions = clothesBought * 7 * 12;

  const totalKg = carEmissions + flightEmissions + foodEmissions + waterEmissions + lpgEmissions + digitalEmissions + shoppingEmissions;
  const totalTonnes = (totalKg / 1000).toFixed(2);
  const globalAvg = 4700; // kg/year (4.7 tonnes)
  const pctOfAvg = Math.round((totalKg / globalAvg) * 100);

  // Carbon Score: 100 - (total / 20000) * 100 (20t = max practical)
  const carbonScore = Math.max(0, Math.min(100, Math.round(100 - (totalKg / 20000) * 100)));

  // Trees to offset: total / 21 (1 tree = 21 kg/yr)
  const treesNeeded = Math.ceil(totalKg / 21);

  // Yearly projection
  const yearlyTonnes = (totalKg / 1000).toFixed(1);

  let severityColor, severityLabel;
  if (totalKg / 1000 <= 2) {
    severityColor = '#00ff88'; severityLabel = '🌟 Excellent — Climate Hero!';
  } else if (totalKg / 1000 <= 4.7) {
    severityColor = '#00d4ff'; severityLabel = '✅ Good — Below Global Average';
  } else if (totalKg / 1000 <= 10) {
    severityColor = '#ffb300'; severityLabel = '⚠️ Average — Room to Improve';
  } else {
    severityColor = '#ff5252'; severityLabel = '🚨 High — Action Needed';
  }

  const scoreColor = carbonScore >= 75 ? '#00ff88' : carbonScore >= 50 ? '#ffb300' : '#ff5252';
  const scoreLabel = carbonScore >= 90 ? 'Excellent' : carbonScore >= 75 ? 'Good' : carbonScore >= 50 ? 'Average' : 'Needs Improvement';

  const breakdown = [
    { label: 'Transport', value: (carEmissions / 1000).toFixed(2), color: '#00d4ff', icon: RiCarLine },
    { label: 'Aviation', value: (flightEmissions / 1000).toFixed(2), color: '#ffb300', icon: RiFlightTakeoffLine },
    { label: 'Diet', value: (foodEmissions / 1000).toFixed(2), color: '#ff6b35', icon: RiRestaurantLine },
    { label: 'Water', value: (waterEmissions / 1000).toFixed(2), color: '#00bfff', icon: null, emoji: '💧' },
    { label: 'LPG/Gas', value: (lpgEmissions / 1000).toFixed(2), color: '#ff4081', icon: null, emoji: '🔥' },
    { label: 'Digital', value: (digitalEmissions / 1000).toFixed(2), color: '#a78bfa', icon: null, emoji: '📺' },
    { label: 'Shopping', value: (shoppingEmissions / 1000).toFixed(2), color: '#34d399', icon: null, emoji: '🛍️' },
  ];

  const handleSave = async () => {
    const pending = {
      carKm: parseFloat(carKm), flights: parseFloat(flights),
      meatMeals: parseFloat(meatMeals), waterLitres: parseFloat(waterLitres),
      lpgKg: parseFloat(lpgKg), streamingHrs: parseFloat(streamingHrs),
      clothesBought: parseFloat(clothesBought), totalTonnes: parseFloat(totalTonnes),
    };

    if (!isAuthenticated) {
      sessionStorage.setItem('pendingCarbonEntry', JSON.stringify(pending));
      toast('🔒 Create an account to save your result!', { icon: '🌿' });
      navigate('/register?ref=calculator');
      return;
    }

    setSaving(true);
    try {
      const apiPayload = {
        transportation: [
          ...(carKm > 0 ? [{ vehicle_type: 'car_petrol', distance_km: carKm * 365 }] : []),
          ...(flights > 0 ? [{ vehicle_type: 'flight_international', distance_km: flights * 4000 }] : []),
        ],
        energy: { electricity_kwh: 0, lpg_kg: lpgKg * 12, natural_gas_m3: 0, renewable_kwh: 0 },
        food: {
          diet_type: meatMeals === 0 ? 'vegan' : meatMeals <= 3 ? 'vegetarian' : meatMeals <= 10 ? 'mixed' : 'high_meat',
          days: 365,
        },
        waste: { general_kg: 0, recycled_kg: 0, composted_kg: 0, landfill_kg: 0 },
        water: { litres_per_day: waterLitres, days: 365 },
        digital: { streaming_hours_month: streamingHrs * 30, screen_hours_day: 0, ai_queries_month: 0, days: 365 },
        shopping: { tshirt: clothesBought * 12, jeans: 0, dress: 0, jacket: 0, shoes: 0, smartphone: 0, laptop: 0, tablet: 0, tv: 0, furniture: 0 },
      };
      await carbonApi.calculate(apiPayload);
      setSaved(true);
      toast.success('Carbon estimate saved! View your history 📊');
      setTimeout(() => navigate('/history'), 1500);
    } catch {
      toast.error('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      id="calculator"
      aria-labelledby="calc-heading"
      style={{ padding: '100px 0', borderTop: '1px solid var(--divider)', background: 'var(--bg-secondary)' }}
    >
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="badge badge-green" style={{ marginBottom: 16, display: 'inline-block' }}>
            ⚡ Quick Estimate — No Account Required
          </span>
          <h2 id="calc-heading" className="animate-fade-up" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: 16 }}>
            Calculate Your <span className="gradient-text">Carbon Footprint</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', fontSize: '1rem' }}>
            Adjust sliders or type values directly across <strong style={{ color: 'var(--color-primary)' }}>7 categories</strong> — see your CO₂ update live.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 32, alignItems: 'start' }}>

          {/* ── Left: Inputs ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Transport Card */}
            <div className="glass-card" style={{ padding: '28px 28px 20px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
                🚗 Transportation
              </h3>
              <SliderRow id="slider-car" label="Car travel per day" icon={RiCarLine} iconColor="#00d4ff"
                value={carKm} setValue={setCarKm} min={0} max={200} unit="km"
                marks={['0', '100 km', '200 km']} />
              <SliderRow id="slider-flights" label="Flights per year" icon={RiFlightTakeoffLine} iconColor="#ffb300"
                value={flights} setValue={setFlights} min={0} max={30} unit="trips"
                marks={['0', '15', '30']} />
            </div>

            {/* Diet + Water + LPG Card */}
            <div className="glass-card" style={{ padding: '28px 28px 20px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
                🍔 Food, Water & Energy
              </h3>
              <SliderRow id="slider-meat" label="Meat meals per week" icon={RiRestaurantLine} iconColor="#ff6b35"
                value={meatMeals} setValue={setMeatMeals} min={0} max={21} unit="meals"
                marks={['0 (Vegan)', '10', '21']} />
              <SliderRow id="slider-water" label="Water usage per day" icon={RiCarLine} iconColor="#00bfff"
                value={waterLitres} setValue={setWaterLitres} min={0} max={1000} step={10} unit="L"
                marks={['0 L', '500 L', '1000 L']} />
              <SliderRow id="slider-lpg" label="LPG/Cooking gas per month" icon={RiCarLine} iconColor="#ff4081"
                value={lpgKg} setValue={setLpgKg} min={0} max={60} unit="kg"
                marks={['0 kg', '30 kg', '60 kg']} />
            </div>

            {/* Digital + Shopping Card */}
            <div className="glass-card" style={{ padding: '28px 28px 20px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
                📺 Digital & Shopping
              </h3>
              <SliderRow id="slider-streaming" label="Video streaming per day" icon={RiCarLine} iconColor="#a78bfa"
                value={streamingHrs} setValue={setStreamingHrs} min={0} max={12} unit="hrs"
                marks={['0', '6 hrs', '12 hrs']} />
              <SliderRow id="slider-clothes" label="Clothes bought per month" icon={RiCarLine} iconColor="#34d399"
                value={clothesBought} setValue={setClothesBought} min={0} max={30} unit="items"
                marks={['0', '15', '30']} />
            </div>

            {/* Emission factor reference */}
            <div style={{
              padding: '12px 16px', background: 'rgba(0,255,136,0.04)',
              border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
              fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.7,
            }}>
              📊 <strong>Factors (IPCC/DEFRA 2023):</strong> Car 0.192 kg/km · Flight 0.195 kg/km · Water 0.0003 kg/L · LPG 3.0 kg/kg · Streaming 0.036 kg/hr · Clothing 7 kg/item avg
            </div>
          </div>

          {/* ── Right: Results ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Gauge + Total */}
            <div className="glass-card" style={{ padding: '28px 24px', textAlign: 'center' }}>
              <CO2Gauge value={parseFloat(totalTonnes)} max={25} />
              <div style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 900, fontFamily: 'var(--font-display)', color: severityColor, lineHeight: 1, marginBottom: 4, transition: 'color 0.4s' }}>
                {totalTonnes}
              </div>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: 14 }}>tonnes CO₂ per year</div>

              <div style={{
                display: 'inline-block', padding: '7px 16px', borderRadius: 'var(--radius-full)',
                background: `${severityColor}18`, border: `1px solid ${severityColor}40`,
                fontSize: '0.82rem', fontWeight: 600, color: severityColor, marginBottom: 18, transition: 'all 0.4s',
              }}>
                {severityLabel}
              </div>

              {/* vs Global avg */}
              <div style={{ textAlign: 'left', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 5 }}>
                  <span>vs. Global avg (4.7t/yr)</span>
                  <span style={{ color: severityColor, fontWeight: 700 }}>{pctOfAvg}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(pctOfAvg, 100)}%`, background: `linear-gradient(90deg, ${severityColor}, ${severityColor}88)` }}
                    role="progressbar" aria-valuenow={pctOfAvg} aria-valuemin={0} aria-valuemax={100} />
                </div>
              </div>
            </div>

            {/* Carbon Score + Equivalents */}
            <div className="glass-card" style={{ padding: '22px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: scoreColor, fontFamily: 'var(--font-display)' }}>{carbonScore}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>Carbon Score</div>
                  <div style={{ fontSize: '0.7rem', color: scoreColor, fontWeight: 600 }}>{scoreLabel}</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#00ff88', fontFamily: 'var(--font-display)' }}>🌳 {treesNeeded}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>Trees to Offset</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>per year</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffb300', fontFamily: 'var(--font-display)' }}>{yearlyTonnes}t</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>Yearly Projection</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CO₂ per year</div>
                </div>
              </div>
            </div>

            {/* Score Scale */}
            <div className="glass-card" style={{ padding: '18px 22px' }}>
              <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                ⭐ Score Scale
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { range: '90–100', label: 'Excellent', color: '#00ff88' },
                  { range: '75–89', label: 'Good', color: '#3ddc84' },
                  { range: '50–74', label: 'Average', color: '#ffb300' },
                  { range: '< 50', label: 'Needs Improvement', color: '#ff5252' },
                ].map((row) => (
                  <div key={row.range} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 10px', borderRadius: 'var(--radius-sm)', background: carbonScore >= parseInt(row.range) || row.range === '< 50' ? `${row.color}10` : 'transparent', border: `1px solid ${row.color}25` }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: row.color }}>{row.range}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{row.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Breakdown */}
            <div className="glass-card" style={{ padding: '22px 24px' }}>
              <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
                Category Breakdown
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {breakdown.map((item) => {
                  const pct = totalKg > 0 ? Math.round((parseFloat(item.value) * 1000 / totalKg) * 100) : 0;
                  return (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {item.icon ? <item.icon size={13} color={item.color} /> : <span style={{ fontSize: '0.8rem' }}>{item.emoji}</span>}
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: item.color }}>{item.value}t</span>
                      </div>
                      <div className="progress-bar" style={{ height: 4 }}>
                        <div className="progress-fill" style={{ width: `${pct}%`, background: item.color }} role="presentation" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save CTA */}
            <button
              id="save-carbon-btn"
              onClick={handleSave}
              disabled={saving || saved}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '15px', fontSize: '1rem', borderRadius: 'var(--radius-lg)' }}
              aria-label={isAuthenticated ? 'Save your carbon footprint estimate to history' : 'Sign up to save your carbon footprint estimate'}
            >
              {saving ? (<><span className="spinner" role="status" aria-label="Saving…" /> Saving…</>)
                : saved ? (<><RiCheckLine size={20} /> Saved! Redirecting…</>)
                : (<><RiSaveLine size={20} />{isAuthenticated ? 'Save to My History' : 'Save Result — Free Sign Up'}</>)}
            </button>

            {!isAuthenticated && (
              <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: -8 }}>
                Your estimate is preserved when you sign up 🌿
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


// ── Static data ────────────────────────────────────────────────────────
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
  { name: 'Aisha Patel', role: 'Climate Researcher', text: "Clean UI, accurate calculations, and genuinely useful data. This is the tool I've been looking for.", avatar: 'A' },
];

// ── Landing Page ──────────────────────────────────────────────────────
export default function Landing() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const theme = useSelector((s) => s.theme.mode);

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* ── Navbar ── */}
      <nav
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-color)',
          padding: '0 40px',
          height: 64,
          display: 'flex', alignItems: 'center', gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{
            width: 34, height: 34,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--color-primary-glow)',
          }}>
            <RiLeafLine size={18} color="var(--text-inverse)" aria-hidden="true" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: 'var(--color-primary)' }}>
            GreenGauge
          </span>
        </div>

        {/* Skip to content link for accessibility */}
        <a href="#main-content" className="sr-only" style={{
          position: 'absolute', left: -9999, top: 8,
          background: 'var(--color-primary)', color: '#000', padding: '8px 16px', borderRadius: 8,
          fontWeight: 700, zIndex: 9999,
        }} onFocus={(e) => { e.target.style.left = '8px'; }}
          onBlur={(e) => { e.target.style.left = '-9999px'; }}>
          Skip to main content
        </a>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Nav link to calculator */}
          <a
            href="#calculator"
            style={{
              fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)',
              textDecoration: 'none', padding: '6px 12px', borderRadius: 'var(--radius-full)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => { e.target.style.color = 'var(--color-primary)'; }}
            onMouseLeave={(e) => { e.target.style.color = 'var(--text-secondary)'; }}
          >
            Calculator
          </a>

          <button
            onClick={() => dispatch(toggleTheme())}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
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

      {/* ── Main content ── */}
      <main id="main-content">
        {/* ── Hero ── */}
        <section
          aria-label="Hero"
          style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}
        >
          <ParticleBackground />

          {/* Glow orbs */}
          <div aria-hidden="true" style={{ position: 'absolute', top: '20%', left: '10%', width: 400, height: 400, background: 'radial-gradient(circle, var(--color-primary-dim) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div aria-hidden="true" style={{ position: 'absolute', bottom: '20%', right: '10%', width: 300, height: 300, background: 'radial-gradient(circle, var(--color-primary-dim) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />

          <div className="container" style={{ position: 'relative', zIndex: 1, padding: '100px 24px 60px', textAlign: 'center' }}>
            <div className="animate-fade-up" style={{ marginBottom: 20 }}>
              <span className="badge badge-green" style={{ fontSize: '0.8rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <EmojiIcon emoji="🌍" size={14} aria-hidden="true" /> Join 15,000+ Eco Warriors
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
              <a href="#calculator" className="btn btn-primary btn-lg" style={{ fontSize: '1rem' }}>
                ⚡ Try Calculator Free
              </a>
              <Link to="/register" className="btn btn-outline btn-lg">
                Start Tracking Free <RiArrowRightLine />
              </Link>
            </div>

            {/* Hero eco illustration */}
            <div className="animate-fade-up animate-float" style={{ marginTop: 64, animationDelay: '0.4s' }} aria-hidden="true">
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
                <EmojiIcon emoji="🌍" size={80} aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Impact Stats ── */}
        <section aria-label="Impact statistics" style={{ padding: '80px 0', borderTop: '1px solid var(--divider)' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
              {STATS.map((stat, i) => (
                <div key={i} className="glass-card" style={{ padding: '32px 24px', textAlign: 'center' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: `var(--bg-input)`, border: `1px solid var(--border-color)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                  }} aria-hidden="true">
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
        <section aria-labelledby="features-heading" style={{ padding: '80px 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 id="features-heading" className="animate-fade-up" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: 16 }}>
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
                  }} aria-hidden="true">
                    <feat.icon size={24} color={feat.color} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{feat.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 🌿 Carbon Estimator ── */}
        <CarbonEstimator isAuthenticated={isAuthenticated} />

        {/* ── Testimonials ── */}
        <section aria-labelledby="testimonials-heading" style={{ padding: '80px 0', borderTop: '1px solid var(--divider)' }}>
          <div className="container">
            <h2 id="testimonials-heading" style={{ textAlign: 'center', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: 48 }}>
              Loved by <span className="gradient-text">Eco Champions</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              {TESTIMONIALS.map((t, i) => (
                <article key={i} className="glass-card" style={{ padding: '28px 24px' }}>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
                    "{t.text}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, color: 'var(--text-inverse)', flexShrink: 0,
                    }} aria-hidden="true">{t.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.role}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section aria-label="Call to action" style={{ padding: '80px 0' }}>
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
              <div aria-hidden="true" style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'radial-gradient(circle, var(--color-primary-dim) 0%, transparent 70%)', borderRadius: '50%' }} />
              <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 800, marginBottom: 16 }}>
                Ready to Make a <span className="gradient-text">Difference?</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 32px', fontSize: '1rem' }}>
                Join thousands of eco-conscious individuals tracking and reducing their carbon footprint today.
              </p>
              <Link to="/register" className="btn btn-primary btn-lg">
                🌱 Start Your Green Journey <RiArrowRightLine aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer
        role="contentinfo"
        style={{
          borderTop: '1px solid var(--divider)',
          padding: '40px 0',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
        }}
      >
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            <RiLeafLine size={18} color="var(--color-primary)" aria-hidden="true" />
            <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>GreenGauge</span>
          </div>
          <p style={{ marginBottom: 16 }}>Measure Your Environmental Footprint. Make Every Action Count.</p>
          <nav aria-label="Social media links" style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 16 }}>
            {[
              { Icon: RiTwitterLine, label: 'Twitter' },
              { Icon: RiGithubLine, label: 'GitHub' },
              { Icon: RiLinkedinLine, label: 'LinkedIn' },
            ].map(({ Icon, label }, i) => (
              <button key={i} aria-label={`Visit our ${label}`} style={{
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
          </nav>
          <p style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>© 2024 GreenGauge. Built for a sustainable future. <EmojiIcon emoji="🌿" size={14} aria-hidden="true" /></p>
        </div>
      </footer>
    </div>
  );
}
