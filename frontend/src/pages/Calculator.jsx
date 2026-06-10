import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { RiCarLine, RiBus2Line, RiFlightTakeoffLine, RiLightbulbFlashLine, RiLeafLine, RiRestaurantLine, RiRecycleLine, RiCheckLine, RiArrowLeftLine, RiArrowRightLine } from 'react-icons/ri';
import { carbonApi } from '../services/api';
import { setLastCalculation } from '../store/carbonSlice';
import { EmojiIcon } from '../utils/icons';

const STEPS = ['Transportation', 'Energy', 'Food & Diet', 'Waste', 'Results'];

const VEHICLE_TYPES = [
  { value: 'car_petrol', label: 'Petrol Car', factor: 0.21 },
  { value: 'car_diesel', label: 'Diesel Car', factor: 0.17 },
  { value: 'car_electric', label: 'Electric Car', factor: 0.05 },
  { value: 'motorbike', label: 'Motorbike', factor: 0.11 },
  { value: 'bus', label: 'Bus', factor: 0.09 },
  { value: 'train', label: 'Train', factor: 0.04 },
  { value: 'flight_domestic', label: 'Domestic Flight', factor: 0.26 },
  { value: 'flight_international', label: 'International Flight', factor: 0.20 },
];

const DIET_TYPES = [
  { value: 'vegan', label: 'Vegan', icon: '🌱', desc: '~1.5 kg CO₂/day', color: '#00ff88' },
  { value: 'vegetarian', label: 'Vegetarian', icon: '🥗', desc: '~1.7 kg CO₂/day', color: '#3ddc84' },
  { value: 'mixed', label: 'Mixed Diet', icon: '🍽️', desc: '~2.5 kg CO₂/day', color: '#ffb300' },
  { value: 'high_meat', label: 'High Meat', icon: '🥩', desc: '~3.3 kg CO₂/day', color: '#ff5252' },
];

function StepIndicator({ step, total }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 40 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            width: i === step ? 32 : 28, height: 28,
            borderRadius: 'var(--radius-full)',
            background: i < step ? 'var(--color-primary)' : i === step ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' : 'var(--bg-input)',
            border: `2px solid ${i <= step ? 'var(--color-primary)' : 'var(--border-color)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 700,
            color: i < step ? '#0a0f0d' : i === step ? '#0a0f0d' : 'var(--text-muted)',
            transition: 'all var(--transition-base)',
            boxShadow: i === step ? '0 0 15px rgba(0,255,136,0.4)' : 'none',
          }}>
            {i < step ? <RiCheckLine size={13} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div style={{ width: 40, height: 2, background: i < step ? 'var(--color-primary)' : 'var(--border-color)', borderRadius: 1, transition: 'background var(--transition-slow)' }} />
          )}
        </div>
      ))}
    </div>
  );
}

function ResultCard({ result }) {
  const { total_emission_kg, category_breakdown, eco_score, impact_level, suggestions, trees_equivalent, cars_equivalent } = result;
  const impactColor = eco_score >= 70 ? '#00ff88' : eco_score >= 40 ? '#ffb300' : '#ff5252';

  return (
    <div className="animate-fade-in">
      {/* Score */}
      <div className="glass-card" style={{ padding: '32px', textAlign: 'center', marginBottom: 20, background: `linear-gradient(135deg, ${impactColor}08, transparent)`, borderColor: `${impactColor}30` }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 8 }}>
          <EmojiIcon emoji={eco_score >= 70 ? '🌿' : eco_score >= 40 ? '🌱' : '⚠️'} size={56} aria-hidden="true" />
        </div>
        <div style={{ fontSize: '3rem', fontWeight: 900, color: impactColor, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
          {total_emission_kg.toFixed(2)}
          <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: 6 }}>kg CO₂</span>
        </div>
        <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: 8 }}>Total Carbon Footprint</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: `${impactColor}18`, color: impactColor, border: `1px solid ${impactColor}30`, padding: '6px 14px' }}>
            Eco Score: {eco_score}/100
          </span>
          <span className="badge badge-blue">{impact_level} Impact</span>
        </div>
      </div>

      {/* Equivalents */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        {[
          { icon: '🌳', value: trees_equivalent, label: 'Trees needed to offset (1 yr)', color: '#00ff88' },
          { icon: '🚗', value: cars_equivalent, label: 'km equivalent by car', color: '#ff5252' },
        ].map((item, i) => (
          <div key={i} className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: 6 }}><EmojiIcon emoji={item.icon} size={32} aria-hidden="true" /></div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: item.color, fontFamily: 'var(--font-display)' }}>{item.value.toFixed(1)}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: 20 }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category Breakdown</h3>
        {Object.entries(category_breakdown).map(([cat, val]) => {
          const pct = total_emission_kg > 0 ? (val / total_emission_kg) * 100 : 0;
          const color = { transportation: '#00ff88', energy: '#00d4ff', food: '#ffb300', waste: '#ff5252' }[cat] || '#aaa';
          return (
            <div key={cat} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{cat}</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color }}>
                  {val.toFixed(2)} kg ({pct.toFixed(0)}%)
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Suggestions */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}><EmojiIcon emoji="💡" size={16} aria-hidden="true" /> Personalized Suggestions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {suggestions.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '12px', background: 'rgba(0,255,136,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,255,136,0.1)' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,255,136,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary)' }}>{i + 1}</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{s}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Calculator() {
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [transport, setTransport] = useState([{ vehicle_type: 'car_petrol', distance_km: '' }]);
  const [energy, setEnergy] = useState({ electricity_kwh: '', lpg_kg: '', natural_gas_m3: '', renewable_kwh: '' });
  const [food, setFood] = useState({ diet_type: 'mixed', days: 1 });
  const [waste, setWaste] = useState({ general_kg: '', recycled_kg: '', composted_kg: '', landfill_kg: '' });

  const addTrip = () => setTransport((p) => [...p, { vehicle_type: 'car_petrol', distance_km: '' }]);
  const removeTrip = (i) => setTransport((p) => p.filter((_, idx) => idx !== i));
  const updateTrip = (i, field, val) => setTransport((p) => p.map((t, idx) => idx === i ? { ...t, [field]: val } : t));

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const payload = {
        transportation: transport.filter((t) => t.distance_km > 0).map((t) => ({ ...t, distance_km: parseFloat(t.distance_km) || 0 })),
        energy: { electricity_kwh: parseFloat(energy.electricity_kwh) || 0, lpg_kg: parseFloat(energy.lpg_kg) || 0, natural_gas_m3: parseFloat(energy.natural_gas_m3) || 0, renewable_kwh: parseFloat(energy.renewable_kwh) || 0 },
        food: { ...food, days: parseInt(food.days) || 1 },
        waste: { general_kg: parseFloat(waste.general_kg) || 0, recycled_kg: parseFloat(waste.recycled_kg) || 0, composted_kg: parseFloat(waste.composted_kg) || 0, landfill_kg: parseFloat(waste.landfill_kg) || 0 },
      };
      const { data } = await carbonApi.calculate(payload);
      setResult(data);
      dispatch(setLastCalculation(data));
      setStep(4);
      toast.success('Carbon footprint calculated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Calculation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { padding: '10px 14px', background: 'var(--bg-input)', border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'var(--font-sans)', width: '100%', outline: 'none', transition: 'border-color var(--transition-fast)' };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 760, margin: '0 auto' }}>
      <StepIndicator step={step} total={STEPS.length} />

      <div className="glass-card" style={{ padding: '36px 32px' }}>
        {step < 4 && (
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>
              <EmojiIcon emoji={['🚗', '⚡', '🍽️', '♻️'][step]} size={32} aria-hidden="true" />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 6 }}>{STEPS[step]}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              {['Enter your travel details', 'Enter your energy usage', 'Select your diet type', 'Enter your waste details'][step]}
            </p>
          </div>
        )}

        {/* Step 0: Transportation */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {transport.map((trip, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor={`trip-vehicle-${i}`}>Vehicle Type</label>
                  <select id={`trip-vehicle-${i}`} className="form-select" value={trip.vehicle_type} onChange={(e) => updateTrip(i, 'vehicle_type', e.target.value)}>
                    {VEHICLE_TYPES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor={`trip-distance-${i}`}>Distance (km)</label>
                  <input id={`trip-distance-${i}`} type="number" min="0" className="form-input" placeholder="e.g. 25" value={trip.distance_km} onChange={(e) => updateTrip(i, 'distance_km', e.target.value)} />
                </div>
                {transport.length > 1 && (
                  <button onClick={() => removeTrip(i)} aria-label={`Remove trip ${i + 1}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,82,82,0.1)', border: '1px solid rgba(255,82,82,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 12px', cursor: 'pointer', color: '#ff5252', height: 42 }}><EmojiIcon emoji="✕" size={16} aria-hidden="true" /></button>
                )}
              </div>
            ))}
            <button onClick={addTrip} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>+ Add Another Trip</button>
          </div>
        )}

        {/* Step 1: Energy */}
        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { key: 'electricity_kwh', label: 'Electricity', icon: '⚡', unit: 'kWh' },
              { key: 'lpg_kg', label: 'LPG Gas', icon: '🔥', unit: 'kg' },
              { key: 'natural_gas_m3', label: 'Natural Gas', icon: '🏠', unit: 'm³' },
              { key: 'renewable_kwh', label: 'Renewable', icon: '☀️', unit: 'kWh' },
            ].map(({ key, label, icon, unit }) => (
              <div key={key} className="form-group">
                <label className="form-label" htmlFor={`energy-${key}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><EmojiIcon emoji={icon} size={16} aria-hidden="true" /> {label} ({unit})</label>
                <input id={`energy-${key}`} name={key} type="number" min="0" className="form-input" placeholder="0" value={energy[key]} onChange={(e) => setEnergy((p) => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Food */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {DIET_TYPES.map((diet) => (
                <button
                  key={diet.value}
                  onClick={() => setFood((p) => ({ ...p, diet_type: diet.value }))}
                  aria-pressed={food.diet_type === diet.value}
                  style={{
                    padding: '18px', borderRadius: 'var(--radius-md)',
                    border: `2px solid ${food.diet_type === diet.value ? diet.color : 'var(--border-color)'}`,
                    background: food.diet_type === diet.value ? `${diet.color}12` : 'var(--bg-input)',
                    cursor: 'pointer', textAlign: 'center',
                    transition: 'all var(--transition-fast)',
                    boxShadow: food.diet_type === diet.value ? `0 0 15px ${diet.color}30` : 'none',
                  }}
                >
                  <div style={{ fontSize: '1.4rem', marginBottom: 6 }}><EmojiIcon emoji={diet.icon} size={22} aria-hidden="true" /></div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: food.diet_type === diet.value ? diet.color : 'var(--text-primary)' }}>{diet.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>{diet.desc}</div>
                </button>
              ))}
            </div>
            <div className="form-group" style={{ maxWidth: 200 }}>
              <label className="form-label" htmlFor="food-days">Number of Days</label>
              <input id="food-days" name="days" type="number" min="1" max="365" className="form-input" value={food.days} onChange={(e) => setFood((p) => ({ ...p, days: e.target.value }))} />
            </div>
          </div>
        )}

        {/* Step 3: Waste */}
        {step === 3 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { key: 'general_kg', label: 'General Waste', icon: '🗑️', unit: 'kg', desc: '0.5 kg CO₂/kg' },
              { key: 'recycled_kg', label: 'Recycled', icon: '♻️', unit: 'kg', desc: '0.1 kg CO₂/kg' },
              { key: 'composted_kg', label: 'Composted', icon: '🌿', unit: 'kg', desc: '0.05 kg CO₂/kg' },
              { key: 'landfill_kg', label: 'Landfill', icon: '⚠️', unit: 'kg', desc: '0.8 kg CO₂/kg' },
            ].map(({ key, label, icon, unit, desc }) => (
              <div key={key} className="form-group">
                <label className="form-label" htmlFor={`waste-${key}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><EmojiIcon emoji={icon} size={16} aria-hidden="true" /> {label} ({unit})</label>
                <input id={`waste-${key}`} name={key} type="number" min="0" className="form-input" placeholder="0" value={waste[key]} onChange={(e) => setWaste((p) => ({ ...p, [key]: e.target.value }))} />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{desc}</span>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {step === 4 && result && <ResultCard result={result} />}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, gap: 12 }}>
          {step > 0 && step < 4 ? (
            <button className="btn btn-ghost" onClick={() => setStep((p) => p - 1)}>
              <RiArrowLeftLine /> Previous
            </button>
          ) : step === 4 ? (
            <button className="btn btn-ghost" onClick={() => { setStep(0); setResult(null); }}>
              <RiArrowLeftLine /> Calculate Again
            </button>
          ) : <div />}

          {step < 3 && (
            <button className="btn btn-primary" onClick={() => setStep((p) => p + 1)}>
              Next <RiArrowRightLine />
            </button>
          )}
          {step === 3 && (
            <button className="btn btn-primary" onClick={handleCalculate} disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Calculating…' : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><EmojiIcon emoji="🌍" size={16} aria-hidden="true" /> Calculate Footprint</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
