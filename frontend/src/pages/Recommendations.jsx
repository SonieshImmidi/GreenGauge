import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { recommendationsApi } from '../services/api';
import { setRecommendations } from '../store/carbonSlice';

const CAT_COLORS = {
  transportation: '#00ff88', energy: '#00d4ff', food: '#ffb300', waste: '#ff5252', lifestyle: '#c084fc',
};
const CAT_ICONS = {
  transportation: '🚗', energy: '⚡', food: '🌾', waste: '♻️', lifestyle: '🌿',
};

function RecommendationCard({ rec, index }) {
  const [expanded, setExpanded] = useState(false);
  const cat = (rec.title || '').toLowerCase().includes('transport') ? 'transportation'
    : (rec.title || '').toLowerCase().includes('electr') || (rec.title || '').toLowerCase().includes('energy') ? 'energy'
    : (rec.title || '').toLowerCase().includes('food') || (rec.title || '').toLowerCase().includes('meat') || (rec.title || '').toLowerCase().includes('plant') ? 'food'
    : (rec.title || '').toLowerCase().includes('recycl') || (rec.title || '').toLowerCase().includes('compost') || (rec.title || '').toLowerCase().includes('waste') ? 'waste'
    : 'lifestyle';

  const color = CAT_COLORS[cat] || '#aaa';

  return (
    <div
      className="glass-card"
      style={{
        padding: '22px 22px',
        borderColor: `${color}25`,
        cursor: 'pointer',
        animation: `fadeInUp 0.4s ease ${index * 0.07}s both`,
      }}
      onClick={() => setExpanded((p) => !p)}
    >
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: `${color}18`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem', flexShrink: 0,
        }}>
          {rec.icon || CAT_ICONS[cat]}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{rec.title}</h3>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <span style={{
                background: `${color}15`, color, border: `1px solid ${color}30`,
                padding: '2px 10px', borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem', fontWeight: 700,
              }}>
                -{rec.impact}% CO₂
              </span>
              {rec.urgency === 'High Priority' && (
                <span className="badge badge-red" style={{ fontSize: '0.68rem' }}>🔴 High Priority</span>
              )}
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 8 }}>
            {rec.tip}
          </p>

          {expanded && (
            <div style={{
              marginTop: 14, padding: '12px 14px',
              background: `${color}08`, borderRadius: 'var(--radius-md)',
              border: `1px solid ${color}20`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Impact Potential</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${rec.impact}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>0%</span>
                <span style={{ fontSize: '0.75rem', color, fontWeight: 700 }}>{rec.impact}% reduction possible</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>100%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const STATIC_RECS = [
  { icon: '🚌', title: 'Use Public Transport', tip: 'Taking the bus instead of driving saves ~89g CO₂ per km vs. 210g for a petrol car.', impact: 58, urgency: 'Recommended' },
  { icon: '💡', title: 'Switch to LED Lighting', tip: 'LED bulbs use 75% less energy and last 25× longer than incandescent bulbs.', impact: 75, urgency: 'Recommended' },
  { icon: '🥗', title: 'Try Meatless Mondays', tip: 'One meat-free day per week reduces annual food emissions by ~52 kg CO₂.', impact: 15, urgency: 'Recommended' },
  { icon: '♻️', title: 'Maximize Recycling', tip: 'Recycling aluminium uses 95% less energy than producing it from raw materials.', impact: 95, urgency: 'Recommended' },
  { icon: '☀️', title: 'Use Renewable Energy', tip: 'Switching to a green energy tariff can eliminate your electricity emissions entirely.', impact: 100, urgency: 'High Priority' },
  { icon: '🌳', title: 'Plant Trees to Offset', tip: 'A mature tree absorbs ~21.7 kg CO₂/year. Plant 10 to offset a tonne annually.', impact: 5, urgency: 'Recommended' },
];

export default function Recommendations() {
  const dispatch = useDispatch();
  const stored = useSelector((s) => s.carbon.recommendations);
  const [recs, setRecs] = useState(stored.length ? stored : STATIC_RECS);
  const [loading, setLoading] = useState(false);
  const [topCat, setTopCat] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await recommendationsApi.get();
        if (data.recommendations?.length) {
          setRecs(data.recommendations);
          setTopCat(data.top_emission_category);
          dispatch(setRecommendations(data.recommendations));
        }
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, [dispatch]);

  const categories = ['all', 'transportation', 'energy', 'food', 'waste', 'lifestyle'];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      {topCat && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,82,82,0.08), transparent)',
          border: '1px solid rgba(255,82,82,0.2)',
          borderRadius: 'var(--radius-lg)', padding: '18px 22px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <span style={{ fontSize: '1.5rem' }}>⚡</span>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
              Your Top Emission Source: <span style={{ color: '#ff5252', textTransform: 'capitalize' }}>{topCat}</span>
            </div>
            <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>These recommendations are prioritized for your profile.</div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '7px 16px',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${filter === cat ? 'var(--color-primary)' : 'var(--border-color)'}`,
              background: filter === cat ? 'var(--color-primary-dim)' : 'transparent',
              color: filter === cat ? 'var(--color-primary)' : 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
              textTransform: 'capitalize', transition: 'all var(--transition-fast)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {CAT_ICONS[cat] || '🌍'} {cat}
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ display: 'grid', gap: 14 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card" style={{ padding: '22px', height: 100 }}>
              <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 12, width: '90%' }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {recs.map((rec, i) => (
            <RecommendationCard key={i} rec={rec} index={i} />
          ))}
        </div>
      )}

      <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        💡 Click any card to see impact potential details
      </p>
    </div>
  );
}
