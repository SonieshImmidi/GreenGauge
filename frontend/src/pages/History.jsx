import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { RiFilterLine, RiDownloadLine, RiRefreshLine } from 'react-icons/ri';
import { carbonApi } from '../services/api';
import { setHistory } from '../store/carbonSlice';

const CATEGORY_COLORS = {
  transportation: '#00ff88', energy: '#00d4ff', food: '#ffb300', waste: '#ff5252',
};
const CATEGORY_ICONS = { transportation: '🚗', energy: '⚡', food: '🍽️', waste: '♻️' };

function exportToCSV(records) {
  const headers = ['Date', 'Category', 'Sub Category', 'Emission (kg CO₂)'];
  const rows = records.map((r) => [
    new Date(r.date).toLocaleDateString(),
    r.category,
    r.sub_category || '-',
    r.emission_value.toFixed(3),
  ]);
  const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `greengauge-history-${Date.now()}.csv`;
  a.click(); URL.revokeObjectURL(url);
  toast.success('Export downloaded!');
}

export default function History() {
  const dispatch = useDispatch();
  const history = useSelector((s) => s.carbon.history);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const pageSize = 15;

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = { page, page_size: pageSize };
      if (category) params.category = category;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const { data } = await carbonApi.history(params);
      dispatch(setHistory(data.records));
      setTotal(data.total);
    } catch {
      toast.error('Failed to load history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [page, category]);

  const handleFilter = () => { setPage(1); fetchHistory(); };
  const handleReset = () => { setCategory(''); setDateFrom(''); setDateTo(''); setPage(1); };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="animate-fade-in">
      {/* Filters */}
      <div className="glass-card" style={{ padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ minWidth: 160 }}>
            <label className="form-label">Category</label>
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              <option value="transportation">🚗 Transportation</option>
              <option value="energy">⚡ Energy</option>
              <option value="food">🍽️ Food</option>
              <option value="waste">♻️ Waste</option>
            </select>
          </div>
          <div className="form-group" style={{ minWidth: 160 }}>
            <label className="form-label">From Date</label>
            <input type="date" className="form-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="form-group" style={{ minWidth: 160 }}>
            <label className="form-label">To Date</label>
            <input type="date" className="form-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleFilter}><RiFilterLine /> Apply</button>
          <button className="btn btn-ghost btn-sm" onClick={handleReset}><RiRefreshLine /> Reset</button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => exportToCSV(history)}
            disabled={!history.length}
            style={{ marginLeft: 'auto' }}
          >
            <RiDownloadLine /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary stats */}
      {history.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
          {['transportation', 'energy', 'food', 'waste'].map((cat) => {
            const catRecords = history.filter((r) => r.category === cat);
            const total = catRecords.reduce((s, r) => s + r.emission_value, 0);
            return (
              <div key={cat} className="glass-card" style={{ padding: '16px 18px', borderColor: `${CATEGORY_COLORS[cat]}30` }}>
                <div style={{ fontSize: '1.2rem', marginBottom: 6 }}>{CATEGORY_ICONS[cat]}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: CATEGORY_COLORS[cat], fontFamily: 'var(--font-display)' }}>
                  {total.toFixed(2)}
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 3 }}>kg</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize', marginTop: 2 }}>{cat}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Category</th>
                <th>Sub Category</th>
                <th>CO₂ Emission</th>
                <th>Impact</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: 16, width: '80%', borderRadius: 4 }} /></td>
                    ))}
                  </tr>
                ))
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📊</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>No records found</div>
                    <div style={{ fontSize: '0.85rem' }}>Start by calculating your carbon footprint.</div>
                  </td>
                </tr>
              ) : (
                history.map((record) => {
                  const color = CATEGORY_COLORS[record.category] || '#aaa';
                  const impact = record.emission_value < 2 ? 'Low' : record.emission_value < 5 ? 'Medium' : 'High';
                  const impColor = record.emission_value < 2 ? '#00ff88' : record.emission_value < 5 ? '#ffb300' : '#ff5252';
                  return (
                    <tr key={record.id}>
                      <td style={{ fontSize: '0.82rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{new Date(record.date).toLocaleDateString()}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date(record.date).toLocaleTimeString()}</div>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '4px 10px', borderRadius: 'var(--radius-full)',
                          background: `${color}15`, color, border: `1px solid ${color}30`,
                          fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize',
                        }}>
                          {CATEGORY_ICONS[record.category]} {record.category}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{record.sub_category || '—'}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {record.emission_value.toFixed(3)}
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 3 }}>kg CO₂</span>
                      </td>
                      <td>
                        <span style={{ background: `${impColor}15`, color: impColor, border: `1px solid ${impColor}30`, padding: '3px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600 }}>
                          {impact}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid var(--divider)' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} of {total} records
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>← Prev</button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: page === i + 1 ? 'var(--color-primary)' : 'var(--bg-card)',
                  border: `1px solid ${page === i + 1 ? 'var(--color-primary)' : 'var(--border-color)'}`,
                  color: page === i + 1 ? '#0a0f0d' : 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                }}>{i + 1}</button>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
