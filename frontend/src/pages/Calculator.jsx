import React, { useState, useId } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import {
  RiCarLine, RiBus2Line, RiFlightTakeoffLine, RiLightbulbFlashLine,
  RiLeafLine, RiRestaurantLine, RiRecycleLine, RiCheckLine,
  RiArrowLeftLine, RiArrowRightLine, RiDropLine, RiComputerLine,
  RiShoppingBagLine, RiFireLine, RiSmartphoneLine,
} from 'react-icons/ri';
import { carbonApi } from '../services/api';
import { setLastCalculation } from '../store/carbonSlice';
import { EmojiIcon } from '../utils/icons';

const STEPS = ['Transport', 'Energy', 'Food', 'Waste', 'Water & Gas', 'Digital', 'Shopping', 'Results'];

const VEHICLE_TYPES = [
  { value: 'flight_domestic', label: 'Domestic Flight', factor: 0.255 },
  { value: 'flight_international', label: 'International Flight', factor: 0.195 },
  { value: 'car_petrol', label: 'Petrol Car', factor: 0.192 },
  { value: 'car_diesel', label: 'Diesel Car', factor: 0.171 },
  { value: 'motorbike', label: 'Motorbike', factor: 0.114 },
  { value: 'bus', label: 'Bus', factor: 0.105 },
  { value: 'car_electric', label: 'Electric Car', factor: 0.053 },
  { value: 'train', label: 'Train', factor: 0.041 },
  { value: 'bicycle', label: 'Bicycle', factor: 0 },
];

const DIET_TYPES = [
  { value: 'vegan', label: 'Vegan', icon: '🌱', desc: '~1.5 kg CO₂/day · 100 kg/month', color: '#00ff88' },
  { value: 'vegetarian', label: 'Vegetarian', icon: '🥗', desc: '~1.7 kg CO₂/day · 150 kg/month', color: '#3ddc84' },
  { value: 'mixed', label: 'Mixed Diet', icon: '🍽️', desc: '~2.5 kg CO₂/day · 220 kg/month', color: '#ffb300' },
  { value: 'high_meat', label: 'High Meat', icon: '🥩', desc: '~3.3 kg CO₂/day · 330 kg/month', color: '#ff5252' },
];

const SHOPPING_ITEMS = [
  { key: 'tshirt', label: 'T-Shirts', emoji: '👕', factor: 7 },
  { key: 'jeans', label: 'Jeans', emoji: '👖', factor: 33 },
  { key: 'dress', label: 'Dresses', emoji: '👗', factor: 22 },
  { key: 'jacket', label: 'Jackets', emoji: '🧥', factor: 57 },
  { key: 'shoes', label: 'Shoes (pairs)', emoji: '👟', factor: 14 },
  { key: 'smartphone', label: 'Smartphones', emoji: '📱', factor: 70 },
  { key: 'laptop', label: 'Laptops', emoji: '💻', factor: 200 },
  { key: 'tablet', label: 'Tablets', emoji: '📱', factor: 130 },
  { key: 'tv', label: 'TVs', emoji: '📺', factor: 250 },
  { key: 'furniture', label: 'Furniture items', emoji: '🪑', factor: 90 },
];

function StepIndicator({ step, total }) {
  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 36, flexWrap: 'wrap' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: i === step ? 28 : 24, height: 24,
            borderRadius: 'var(--radius-full)',
            background: i < step ? 'var(--color-primary)' : i === step ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' : 'var(--bg-input)',
            border: `2px solid ${i <= step ? 'var(--color-primary)' : 'var(--border-color)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.65rem', fontWeight: 700,
            color: i < step ? '#0a0f0d' : i === step ? '#0a0f0d' : 'var(--text-muted)',
            transition: 'all var(--transition-base)',
            boxShadow: i === step ? '0 0 15px rgba(0,255,136,0.4)' : 'none',
          }}>
            {i < step ? <RiCheckLine size={11} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div style={{ width: 20, height: 2, background: i < step ? 'var(--color-primary)' : 'var(--border-color)', borderRadius: 1 }} />
          )}
        </div>
      ))}
    </div>
  );
}

function NumberInput({ label, value, onChange, unit, min = 0, max, placeholder = '0', hint }) {
  const inputId = useId();
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={inputId}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          id={inputId}
          type="number" min={min} max={max}
          className="form-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{ paddingRight: unit ? 48 : undefined }}
        />
        {unit && (
          <span style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            fontSize: '0.78rem', color: 'var(--text-muted)', pointerEvents: 'none', fontWeight: 600,
          }}>{unit}</span>
        )}
      </div>
      {hint && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>{hint}</span>}
    </div>
  );
}

function ResultCard({ result }) {
  const {
    total_emission_kg, category_breakdown, eco_score, impact_level,
    suggestions, trees_equivalent, cars_equivalent, yearly_projection_kg, carbon_score,
  } = result;
  const impactColor = eco_score >= 70 ? '#00ff88' : eco_score >= 40 ? '#ffb300' : '#ff5252';
  const scoreColor = (carbon_score || 0) >= 75 ? '#00ff88' : (carbon_score || 0) >= 50 ? '#ffb300' : '#ff5252';

  const catColors = {
    transportation: '#00d4ff', energy: '#ffb300', food: '#ff6b35',
    waste: '#ff5252', water: '#00bfff', digital: '#a78bfa', shopping: '#34d399',
  };
  const catEmoji = {
    transportation: '🚗', energy: '⚡', food: '🍔', waste: '🗑️',
    water: '💧', digital: '📺', shopping: '🛍️',
  };

  return (
    <div className="animate-fade-in">
      {/* Score strip */}
      <div className="glass-card" style={{ padding: '28px', textAlign: 'center', marginBottom: 16, background: `linear-gradient(135deg, ${impactColor}08, transparent)`, borderColor: `${impactColor}30` }}>
        <div style={{ fontSize: '3rem', marginBottom: 6 }}>
          <EmojiIcon emoji={eco_score >= 70 ? '🌿' : eco_score >= 40 ? '🌱' : '⚠️'} size={48} aria-hidden="true" />
        </div>
        <div style={{ fontSize: '2.8rem', fontWeight: 900, color: impactColor, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
          {total_emission_kg.toFixed(2)}
          <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: 6 }}>kg CO₂</span>
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 4, marginBottom: 16 }}>Total Carbon Footprint</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: `${impactColor}18`, color: impactColor, border: `1px solid ${impactColor}30`, padding: '5px 12px' }}>
            Eco Score: {eco_score}/100
          </span>
          <span className="badge badge-blue">{impact_level} Impact</span>
          {carbon_score !== undefined && (
            <span className="badge" style={{ background: `${scoreColor}18`, color: scoreColor, border: `1px solid ${scoreColor}30`, padding: '5px 12px' }}>
              ⭐ Carbon Score: {carbon_score}/100
            </span>
          )}
        </div>
      </div>

      {/* Equivalents grid */}
      <div className="grid-2" style={{ marginBottom: 16 }}>
        {[
          { icon: '🌳', value: trees_equivalent, label: 'Trees needed to offset (1 yr)', color: '#00ff88', formula: 'CO₂ ÷ 21 kg/tree/yr' },
          { icon: '🚗', value: cars_equivalent, label: 'km equivalent by car', color: '#ff5252', formula: '÷ 0.192 kg/km' },
          ...(yearly_projection_kg ? [{ icon: '📈', value: (yearly_projection_kg / 1000).toFixed(1), label: 'Yearly projection (tonnes)', color: '#ffb300', formula: '× 365 days', noFixed: true }] : []),
        ].map((item, i) => (
          <div key={i} className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 4 }}><EmojiIcon emoji={item.icon} size={28} aria-hidden="true" /></div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: item.color, fontFamily: 'var(--font-display)' }}>
              {item.noFixed ? item.value : parseFloat(item.value).toFixed(1)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>{item.label}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 1, fontStyle: 'italic' }}>{item.formula}</div>
          </div>
        ))}
      </div>

      {/* Score Scale */}
      <div className="glass-card" style={{ padding: '18px 20px', marginBottom: 16 }}>
        <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>⭐ Score Scale</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            { range: '90–100', label: 'Excellent', color: '#00ff88' },
            { range: '75–89', label: 'Good', color: '#3ddc84' },
            { range: '50–74', label: 'Average', color: '#ffb300' },
            { range: '< 50', label: 'Needs Improvement', color: '#ff5252' },
          ].map((row) => (
            <div key={row.range} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '5px 10px', borderRadius: 'var(--radius-sm)',
              background: `${row.color}08`, border: `1px solid ${row.color}25`,
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: row.color }}>{row.range}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{row.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: 16 }}>
        <h3 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category Breakdown</h3>
        {Object.entries(category_breakdown).filter(([, val]) => val > 0).map(([cat, val]) => {
          const pct = total_emission_kg > 0 ? (val / total_emission_kg) * 100 : 0;
          const color = catColors[cat] || '#aaa';
          return (
            <div key={cat} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span>{catEmoji[cat] || '📊'}</span>{cat}
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color }}>
                  {val.toFixed(2)} kg ({pct.toFixed(0)}%)
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Suggestions */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 700, marginBottom: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}><EmojiIcon emoji="💡" size={16} aria-hidden="true" /> Personalized Suggestions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {suggestions.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: 'rgba(0,255,136,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,255,136,0.1)' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,255,136,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-primary)' }}>{i + 1}</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{s}</p>
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

  // Step 0: Transport
  const [transport, setTransport] = useState([{ vehicle_type: 'car_petrol', distance_km: '' }]);
  // Step 1: Energy
  const [energy, setEnergy] = useState({ electricity_kwh: '', lpg_kg: '', natural_gas_m3: '', renewable_kwh: '' });
  // Step 2: Food
  const [food, setFood] = useState({ diet_type: 'mixed', days: 30 });
  // Step 3: Waste
  const [waste, setWaste] = useState({ general_kg: '', recycled_kg: '', composted_kg: '', landfill_kg: '' });
  // Step 4: Water + Cooking Gas
  const [water, setWater] = useState({ litres_per_day: '', days: 30 });
  // Step 5: Digital
  const [digital, setDigital] = useState({ streaming_hours_month: '', screen_hours_day: '', ai_queries_month: '', days: 30 });
  // Step 6: Shopping
  const [shopping, setShopping] = useState(Object.fromEntries(SHOPPING_ITEMS.map((i) => [i.key, ''])));

  const addTrip = () => setTransport((p) => [...p, { vehicle_type: 'car_petrol', distance_km: '' }]);
  const removeTrip = (i) => setTransport((p) => p.filter((_, idx) => idx !== i));
  const updateTrip = (i, field, val) => setTransport((p) => p.map((t, idx) => idx === i ? { ...t, [field]: val } : t));

  const RESULT_STEP = STEPS.length - 1; // index 7

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const payload = {
        transportation: transport.filter((t) => t.distance_km > 0).map((t) => ({
          ...t, distance_km: parseFloat(t.distance_km) || 0,
        })),
        energy: {
          electricity_kwh: parseFloat(energy.electricity_kwh) || 0,
          lpg_kg: parseFloat(energy.lpg_kg) || 0,
          natural_gas_m3: parseFloat(energy.natural_gas_m3) || 0,
          renewable_kwh: parseFloat(energy.renewable_kwh) || 0,
        },
        food: { ...food, days: parseInt(food.days) || 30 },
        waste: {
          general_kg: parseFloat(waste.general_kg) || 0,
          recycled_kg: parseFloat(waste.recycled_kg) || 0,
          composted_kg: parseFloat(waste.composted_kg) || 0,
          landfill_kg: parseFloat(waste.landfill_kg) || 0,
        },
        water: {
          litres_per_day: parseFloat(water.litres_per_day) || 0,
          days: parseInt(water.days) || 30,
        },
        digital: {
          streaming_hours_month: parseFloat(digital.streaming_hours_month) || 0,
          screen_hours_day: parseFloat(digital.screen_hours_day) || 0,
          ai_queries_month: parseFloat(digital.ai_queries_month) || 0,
          days: parseInt(digital.days) || 30,
        },
        shopping: Object.fromEntries(
          SHOPPING_ITEMS.map((item) => [item.key, parseFloat(shopping[item.key]) || 0])
        ),
      };
      const { data } = await carbonApi.calculate(payload);
      setResult(data);
      dispatch(setLastCalculation(data));
      setStep(RESULT_STEP);
      toast.success('Carbon footprint calculated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Calculation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepIcons = ['🚗', '⚡', '🍽️', '♻️', '💧', '📺', '🛍️'];
  const stepDesc = [
    'Enter your travel and transport details',
    'Enter your home energy consumption',
    'Select your typical diet type',
    'Enter your waste generation details',
    'Enter your water & cooking gas usage',
    'Enter your digital device usage',
    'Enter your purchases this period',
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      <StepIndicator step={step} total={STEPS.length} />

      <div className="glass-card" style={{ padding: '32px 28px' }}>
        {step < RESULT_STEP && (
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 6 }}><EmojiIcon emoji={stepIcons[step]} size={32} aria-hidden="true" /></div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 4 }}>{STEPS[step]}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{stepDesc[step]}</p>
          </div>
        )}

        {/* ── Step 0: Transportation ── */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {transport.map((trip, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr) auto', gap: 10, alignItems: 'start' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor={`trip-vehicle-${i}`}>Vehicle Type</label>
                  <select id={`trip-vehicle-${i}`} className="form-select" value={trip.vehicle_type} onChange={(e) => updateTrip(i, 'vehicle_type', e.target.value)}>
                    {VEHICLE_TYPES.map((v) => (
                      <option key={v.value} value={v.value}>{v.label} ({v.factor} kg/km)</option>
                    ))}
                  </select>
                </div>
                <NumberInput label="Distance" value={trip.distance_km} unit="km"
                  onChange={(e) => updateTrip(i, 'distance_km', e.target.value)}
                  hint={`${((parseFloat(trip.distance_km) || 0) * (VEHICLE_TYPES.find(v => v.value === trip.vehicle_type)?.factor || 0)).toFixed(2)} kg CO₂`} />
                {transport.length > 1 && (
                  <button onClick={() => removeTrip(i)} aria-label={`Remove trip ${i + 1}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,82,82,0.1)', border: '1px solid rgba(255,82,82,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 12px', cursor: 'pointer', color: '#ff5252', height: 42, marginTop: 22 }}><EmojiIcon emoji="✕" size={16} aria-hidden="true" /></button>
                )}
              </div>
            ))}
            <button onClick={addTrip} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>+ Add Another Trip</button>

            {/* Reference table */}
            <div style={{ marginTop: 8, padding: '14px', background: 'rgba(0,255,136,0.04)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Emission Factors Reference</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px 16px' }}>
                {VEHICLE_TYPES.map((v) => (
                  <div key={v.value} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-secondary)', gap: 8 }}>
                    <span style={{ whiteSpace: 'nowrap' }}>{v.label}</span>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{v.factor} kg/km</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 1: Energy ── */}
        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <NumberInput label="⚡ Electricity" value={energy.electricity_kwh} unit="kWh"
              onChange={(e) => setEnergy((p) => ({ ...p, electricity_kwh: e.target.value }))}
              hint={`${((parseFloat(energy.electricity_kwh) || 0) * 0.82).toFixed(2)} kg CO₂ (0.82 kg/kWh)`} />
            <NumberInput label="🔥 LPG Gas" value={energy.lpg_kg} unit="kg"
              onChange={(e) => setEnergy((p) => ({ ...p, lpg_kg: e.target.value }))}
              hint={`${((parseFloat(energy.lpg_kg) || 0) * 3.0).toFixed(2)} kg CO₂ (3.0 kg/kg)`} />
            <NumberInput label="🏠 Natural Gas" value={energy.natural_gas_m3} unit="m³"
              onChange={(e) => setEnergy((p) => ({ ...p, natural_gas_m3: e.target.value }))}
              hint={`${((parseFloat(energy.natural_gas_m3) || 0) * 2.04).toFixed(2)} kg CO₂ (2.04 kg/m³)`} />
            <NumberInput label="☀️ Renewable Energy" value={energy.renewable_kwh} unit="kWh"
              onChange={(e) => setEnergy((p) => ({ ...p, renewable_kwh: e.target.value }))}
              hint={`${((parseFloat(energy.renewable_kwh) || 0) * 0.01).toFixed(2)} kg CO₂ (lifecycle)`} />
          </div>
        )}

        {/* ── Step 2: Food ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {DIET_TYPES.map((diet) => (
                <button key={diet.value}
                  onClick={() => setFood((p) => ({ ...p, diet_type: diet.value }))}
                  aria-pressed={food.diet_type === diet.value}
                  style={{
                    padding: '16px', borderRadius: 'var(--radius-md)',
                    border: `2px solid ${food.diet_type === diet.value ? diet.color : 'var(--border-color)'}`,
                    background: food.diet_type === diet.value ? `${diet.color}12` : 'var(--bg-input)',
                    cursor: 'pointer', textAlign: 'center',
                    boxShadow: food.diet_type === diet.value ? `0 0 15px ${diet.color}30` : 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ fontSize: '1.4rem', marginBottom: 6 }}><EmojiIcon emoji={diet.icon} size={22} aria-hidden="true" /></div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: food.diet_type === diet.value ? diet.color : 'var(--text-primary)' }}>{diet.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>{diet.desc}</div>
                </button>
              ))}
            </div>
            <NumberInput label="Number of Days" value={food.days} min={1} max={365} placeholder="30"
              onChange={(e) => setFood((p) => ({ ...p, days: e.target.value }))}
              hint="Period for which to calculate food emissions" />
          </div>
        )}

        {/* ── Step 3: Waste ── */}
        {step === 3 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { key: 'general_kg', label: 'General Waste', icon: '🗑️', factor: 0.57 },
              { key: 'recycled_kg', label: 'Recycled', icon: '♻️', factor: 0.10 },
              { key: 'composted_kg', label: 'Composted', icon: '🌿', factor: 0.05 },
              { key: 'landfill_kg', label: 'Landfill', icon: '⚠️', factor: 0.80 },
            ].map(({ key, label, icon, factor }) => (
              <NumberInput key={key} label={`${icon} ${label}`} value={waste[key]} unit="kg"
                onChange={(e) => setWaste((p) => ({ ...p, [key]: e.target.value }))}
                hint={`${((parseFloat(waste[key]) || 0) * factor).toFixed(2)} kg CO₂ (${factor} kg/kg)`} />
            ))}
          </div>
        )}

        {/* ── Step 4: Water + Cooking Gas ── */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ padding: '16px', background: 'rgba(0,191,255,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,191,255,0.2)', marginBottom: 4 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#00bfff', marginBottom: 4 }}>💧 Water Consumption</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Formula: Litres/day × 0.0003 kg CO₂/litre × days<br />
                Average person: ~150 litres/day · 5,000L = 1.5 kg CO₂
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <NumberInput label="💧 Water per Day" value={water.litres_per_day} unit="L"
                onChange={(e) => setWater((p) => ({ ...p, litres_per_day: e.target.value }))}
                hint={`${((parseFloat(water.litres_per_day) || 0) * 0.0003 * (parseInt(water.days) || 30)).toFixed(3)} kg CO₂`} />
              <NumberInput label="📅 Days" value={water.days} min={1} max={365}
                onChange={(e) => setWater((p) => ({ ...p, days: e.target.value }))} />
            </div>

            <div style={{ padding: '16px', background: 'rgba(255,64,129,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,64,129,0.2)', marginTop: 4 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ff4081', marginBottom: 4 }}>🔥 Cooking Gas (LPG)</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Formula: LPG kg × 3.0 kg CO₂/kg<br />
                Example: 15 kg LPG × 3.0 = 45 kg CO₂
              </div>
            </div>
            <NumberInput label="🔥 LPG / Cooking Gas" value={energy.lpg_kg} unit="kg"
              onChange={(e) => setEnergy((p) => ({ ...p, lpg_kg: e.target.value }))}
              hint={`${((parseFloat(energy.lpg_kg) || 0) * 3.0).toFixed(2)} kg CO₂ for this period`} />
          </div>
        )}

        {/* ── Step 5: Digital Footprint ── */}
        {step === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ padding: '16px', background: 'rgba(167,139,250,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(167,139,250,0.2)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a78bfa', marginBottom: 6 }}>💻 Digital Carbon Footprint</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 6 }}>
                {[
                  { label: 'Video Streaming', formula: '× 0.036 kg CO₂/hr' },
                  { label: 'General Screen Time', formula: '× 0.025 kg CO₂/hr/day' },
                  { label: 'AI Queries', formula: '× 0.004 kg CO₂/query' },
                ].map((item) => (
                  <div key={item.label} style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 2 }}>{item.label}</div>
                    {item.formula}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <NumberInput label="📺 Video Streaming" value={digital.streaming_hours_month} unit="hrs/mo"
                onChange={(e) => setDigital((p) => ({ ...p, streaming_hours_month: e.target.value }))}
                hint={`${((parseFloat(digital.streaming_hours_month) || 0) * 0.036).toFixed(3)} kg CO₂`} />
              <NumberInput label="🖥️ Screen Time" value={digital.screen_hours_day} unit="hrs/day"
                onChange={(e) => setDigital((p) => ({ ...p, screen_hours_day: e.target.value }))}
                hint={`${((parseFloat(digital.screen_hours_day) || 0) * 0.025 * (parseInt(digital.days) || 30)).toFixed(3)} kg CO₂`} />
              <NumberInput label="🤖 AI Queries" value={digital.ai_queries_month} unit="queries/mo"
                onChange={(e) => setDigital((p) => ({ ...p, ai_queries_month: e.target.value }))}
                hint={`${((parseFloat(digital.ai_queries_month) || 0) * 0.004).toFixed(3)} kg CO₂`} />
              <NumberInput label="📅 Days" value={digital.days} min={1} max={365}
                onChange={(e) => setDigital((p) => ({ ...p, days: e.target.value }))} />
            </div>
          </div>
        )}

        {/* ── Step 6: Shopping ── */}
        {step === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '14px', background: 'rgba(52,211,153,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#34d399', marginBottom: 4 }}>🛍️ Shopping Footprint</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Enter how many of each item you bought. CO₂ per item includes full lifecycle manufacturing emissions.
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {SHOPPING_ITEMS.map(({ key, label, emoji, factor }) => (
                <NumberInput key={key}
                  label={`${emoji} ${label}`}
                  value={shopping[key]}
                  onChange={(e) => setShopping((p) => ({ ...p, [key]: e.target.value }))}
                  hint={`${factor} kg CO₂/item · total: ${((parseFloat(shopping[key]) || 0) * factor).toFixed(0)} kg`} />
              ))}
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {step === RESULT_STEP && result && <ResultCard result={result} />}

        {/* ── Navigation ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, gap: 12 }}>
          {step > 0 && step < RESULT_STEP ? (
            <button className="btn btn-ghost" onClick={() => setStep((p) => p - 1)}>
              <RiArrowLeftLine /> Previous
            </button>
          ) : step === RESULT_STEP ? (
            <button className="btn btn-ghost" onClick={() => { setStep(0); setResult(null); }}>
              <RiArrowLeftLine /> Calculate Again
            </button>
          ) : <div />}

          {step < RESULT_STEP - 1 && (
            <button className="btn btn-primary" onClick={() => setStep((p) => p + 1)}>
              Next <RiArrowRightLine />
            </button>
          )}
          {step === RESULT_STEP - 1 && (
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
