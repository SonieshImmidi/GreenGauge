import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { RiLeafLine, RiArrowRightLine, RiDownloadLine, RiFireLine, RiTrophyLine, RiBarChartLine, RiAddLine } from 'react-icons/ri';
import { carbonApi } from '../services/api';
import { setReport } from '../store/carbonSlice';

const PIE_COLORS = { transportation: '#00ff88', energy: '#00d4ff', food: '#ffb300', waste: '#ff5252' };

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="label">{label}</div>
      <div className="value">{payload[0]?.value?.toFixed(2)} kg CO₂</div>
    </div>
  );
}

function StatCard({ title, value, unit, icon: Icon, color, sub, trend }) {
  return (
    <div className="glass-card" style={{ padding: '22px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${color}18`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={color} />
        </div>
        {trend !== undefined && (
          <span style={{
            background: trend >= 0 ? 'rgba(255,82,82,0.12)' : 'rgba(0,255,136,0.12)',
            color: trend >= 0 ? '#ff5252' : '#00ff88',
            padding: '3px 8px', borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem', fontWeight: 700,
          }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1 }}>
        {typeof value === 'number' ? value.toFixed(1) : value}
        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: 4 }}>{unit}</span>
      </div>
      {sub && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function EcoScoreCircle({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (score / 100) * circumference;
  const color = score >= 70 ? '#00ff88' : score >= 40 ? '#ffb300' : '#ff5252';

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 130, height: 130 }}>
      <svg width={130} height={130} style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
        <circle cx={65} cy={65} r={radius} fill="none" stroke="var(--bg-input)" strokeWidth={10} />
        <circle cx={65} cy={65} r={radius} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
        <span style={{ fontSize: '2.2rem', fontWeight: 800, color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2, fontWeight: 700, letterSpacing: '0.05em' }}>ECO SCORE</span>
      </div>
    </div>
  );
}

// Demo data for when there are no records yet
const DEMO_DAILY = [
  { date: 'Mon', emission: 8.2 }, { date: 'Tue', emission: 6.5 },
  { date: 'Wed', emission: 9.1 }, { date: 'Thu', emission: 5.8 },
  { date: 'Fri', emission: 7.3 }, { date: 'Sat', emission: 4.2 },
  { date: 'Sun', emission: 3.9 },
];
const DEMO_MONTHLY = [
  { month: 'Jan', emission: 210 }, { month: 'Feb', emission: 185 },
  { month: 'Mar', emission: 230 }, { month: 'Apr', emission: 175 },
  { month: 'May', emission: 195 }, { month: 'Jun', emission: 160 },
];
const DEMO_PIE = [
  { name: 'Transportation', value: 45, color: '#00ff88' },
  { name: 'Energy', value: 30, color: '#00d4ff' },
  { name: 'Food', value: 18, color: '#ffb300' },
  { name: 'Waste', value: 7, color: '#ff5252' },
];

export default function Dashboard() {
  const dispatch = useDispatch();
  const report = useSelector((s) => s.carbon.report);
  const user = useSelector((s) => s.auth.user);
  const [loading, setLoading] = useState(!report);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data } = await carbonApi.report();
        dispatch(setReport(data));
      } catch {}
      finally { setLoading(false); }
    };
    fetchReport();
  }, [dispatch]);

  const hasData = report && report.total_records > 0;

  const dailyData = hasData
    ? report.daily_trend.slice(-7).map((d) => ({ date: d.date.slice(5), emission: d.emission }))
    : DEMO_DAILY;

  const monthlyData = hasData
    ? report.monthly_trend.map((m) => ({ month: m.month, emission: m.emission }))
    : DEMO_MONTHLY;

  const pieData = hasData
    ? Object.entries(report.category_breakdown).map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: v, color: PIE_COLORS[k] || '#aaa' }))
    : DEMO_PIE;

  return (
    <div className="animate-fade-in">
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Good day, {user?.name?.split(' ')[0] || 'Eco Warrior'} 🌿
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {hasData ? 'Here\'s your environmental impact summary.' : 'Start by calculating your carbon footprint below!'}
        </p>
      </div>

      {!hasData && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,212,255,0.05))',
          border: '1px solid rgba(0,255,136,0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          marginBottom: 28,
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '1.5rem' }}>🌱</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Welcome! Let's get started.</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>The charts below show demo data. Calculate your first footprint to see your real impact.</div>
          </div>
          <Link to="/calculator" className="btn btn-primary btn-sm">
            <RiAddLine /> Calculate Now
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard title="Total Emissions" value={report?.total_emission_kg ?? 0} unit="kg CO₂" icon={RiFireLine} color="#ff5252" sub="All time tracked" />
        <StatCard title="This Month" value={report?.monthly_emission_kg ?? 0} unit="kg CO₂" icon={RiBarChartLine} color="#00d4ff" sub={`Daily avg: ${(report?.daily_average_kg ?? 0).toFixed(1)} kg`} />
        <StatCard title="Eco Score" value={report?.eco_score ?? 75} unit="/100" icon={RiLeafLine} color="#00ff88" sub="Based on your activity" />
        <StatCard title="Rank" value={report?.sustainability_rank ?? '🌱 Eco Warrior'} unit="" icon={RiTrophyLine} color="#ffb300" sub="Keep it up!" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Daily Trend */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Daily Emissions</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last 7 days</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="colorEmission" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="emission" stroke="#00ff88" strokeWidth={2} fill="url(#colorEmission)" dot={{ fill: '#00ff88', r: 3 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Monthly Trends</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>6-month overview</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="emission" fill="#00d4ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category + Eco Score */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Pie */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Category Breakdown</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 20 }}>Emission sources</p>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" style={{ filter: `drop-shadow(0 0 4px ${entry.color}60)` }} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v.toFixed(1)} kg`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pieData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', flex: 1 }}>{d.name}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{d.value.toFixed ? d.value.toFixed(1) : d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Eco Score + Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative', width: 130, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <EcoScoreCircle score={report?.eco_score ?? 75} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>Your Eco Score</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {(report?.eco_score ?? 75) >= 70
                  ? '🌟 Excellent! You\'re a carbon champion.'
                  : (report?.eco_score ?? 75) >= 40
                  ? '🌱 Good progress! Small changes make a big impact.'
                  : '⚡ Let\'s work on reducing your footprint together.'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { to: '/calculator', label: 'Calculate Footprint', icon: '🧮', color: '#00ff88' },
                { to: '/history', label: 'View History', icon: '📊', color: '#00d4ff' },
                { to: '/recommendations', label: 'Get Tips', icon: '💡', color: '#ffb300' },
              ].map((action) => (
                <Link key={action.to} to={action.to} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)', textDecoration: 'none',
                  fontSize: '0.88rem', fontWeight: 500,
                  transition: 'all var(--transition-fast)',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = action.color; e.currentTarget.style.color = action.color; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <span>{action.icon}</span>
                  {action.label}
                  <RiArrowRightLine size={14} style={{ marginLeft: 'auto' }} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
