import React, { useState } from 'react';
import { RiSearchLine, RiExternalLinkLine } from 'react-icons/ri';

const ARTICLES = [
  {
    id: 1, category: 'climate', tag: '🌡️ Climate Change',
    title: 'Understanding the Carbon Budget',
    excerpt: 'Scientists estimate we have about 380 Gt CO₂ left before exceeding 1.5°C of warming. Here\'s what that means for daily life.',
    read: '5 min', color: '#ff5252',
    content: 'The Paris Agreement set a goal of limiting global warming to 1.5°C. To achieve this, global emissions need to reach net zero by 2050. Every person\'s choices matter — from what we eat to how we travel.',
  },
  {
    id: 2, category: 'energy', tag: '☀️ Renewable Energy',
    title: 'Solar Power: The Future of Home Energy',
    excerpt: 'Home solar installations have dropped 90% in cost over the last decade. Is 2024 the year to make the switch?',
    read: '7 min', color: '#00d4ff',
    content: 'Solar panel costs have fallen dramatically. A typical home system pays back in 6-8 years and can generate free electricity for 25+ years. Many governments offer tax credits and rebates.',
  },
  {
    id: 3, category: 'food', tag: '🌱 Green Living',
    title: 'The Plant-Based Revolution',
    excerpt: 'Switching to a plant-rich diet is one of the single most impactful climate actions an individual can take.',
    read: '4 min', color: '#00ff88',
    content: 'Food systems account for about 26% of global emissions. Beef produces 60× more greenhouse gas than peas per 100g of protein. Even reducing meat 2-3 days a week makes a significant difference.',
  },
  {
    id: 4, category: 'recycling', tag: '♻️ Recycling',
    title: 'The Circular Economy Explained',
    excerpt: 'What if waste was designed out of existence? The circular economy model is reshaping industries worldwide.',
    read: '6 min', color: '#ffb300',
    content: 'In a circular economy, products are designed for longevity, reuse, and recycling. This contrasts with the linear "take-make-dispose" model. Companies like Patagonia and Interface lead by example.',
  },
  {
    id: 5, category: 'climate', tag: '🌡️ Climate Change',
    title: 'Carbon Offsetting: Does It Work?',
    excerpt: 'Tree planting and carbon credits are popular, but controversial. We break down the science and the greenwashing.',
    read: '8 min', color: '#ff5252',
    content: 'High-quality carbon offsets can be effective but require careful verification. Look for Gold Standard or VCS certified projects. Offsetting should complement — not replace — emission reductions.',
  },
  {
    id: 6, category: 'energy', tag: '☀️ Renewable Energy',
    title: 'Wind Energy: Powering Billions',
    excerpt: 'Wind turbines now power over 1 billion homes globally. Here\'s how wind is transforming national grids.',
    read: '5 min', color: '#00d4ff',
    content: 'Wind energy is the fastest-growing electricity source. Offshore wind farms can generate electricity equivalent to nuclear plants without the waste. Countries like Denmark get 50%+ of electricity from wind.',
  },
  {
    id: 7, category: 'recycling', tag: '♻️ Recycling',
    title: '10 Ways to Reduce Plastic Waste Today',
    excerpt: 'Practical, achievable swaps to dramatically cut your plastic footprint starting this week.',
    read: '3 min', color: '#ffb300',
    content: '1. Reusable bags 2. Metal water bottle 3. Bamboo toothbrush 4. Bar shampoo 5. Beeswax wraps 6. Cloth produce bags 7. Reusable coffee cup 8. Solid dish soap 9. Compostable bin liners 10. Buying in bulk.',
  },
  {
    id: 8, category: 'food', tag: '🌱 Green Living',
    title: 'Urban Gardening: Grow Your Own Food',
    excerpt: 'You don\'t need a field to grow food. Balcony and community gardens are cutting food miles worldwide.',
    read: '4 min', color: '#00ff88',
    content: 'Urban gardens reduce food miles, provide fresh produce, support mental health, and build community. Start with herbs on a windowsill, progress to tomatoes and salad greens. Composting kitchen scraps closes the loop.',
  },
];

const CATEGORIES = ['all', 'climate', 'energy', 'food', 'recycling'];

export default function Hub() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = ARTICLES.filter((a) => {
    const matchCat = category === 'all' || a.category === category;
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (selected) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)} style={{ marginBottom: 24 }}>← Back to Hub</button>
        <div className="glass-card" style={{ padding: '36px 32px' }}>
          <span style={{ background: `${selected.color}18`, color: selected.color, border: `1px solid ${selected.color}30`, padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600 }}>{selected.tag}</span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 16, marginBottom: 12 }}>{selected.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>⏱️ {selected.read} read</p>
          <hr className="divider" />
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--text-secondary)', marginTop: 24 }}>{selected.content}</p>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--text-secondary)', marginTop: 16 }}>{selected.excerpt}</p>
          <div style={{ marginTop: 32, padding: '16px 20px', background: 'rgba(0,255,136,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,255,136,0.15)' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
              💡 <strong style={{ color: 'var(--color-primary)' }}>Take Action:</strong> Apply what you've learned and track your progress in the Carbon Calculator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,212,255,0.05))',
        border: '1px solid rgba(0,255,136,0.15)',
        borderRadius: 'var(--radius-xl)', padding: '36px', marginBottom: 32, textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>📚</div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>Environmental Awareness Hub</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto', fontSize: '0.9rem' }}>
          Explore curated articles, guides, and resources to deepen your understanding of climate change and sustainable living.
        </p>
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 200 }}>
          <RiSearchLine size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text" placeholder="Search articles…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input" style={{ paddingLeft: 40 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '8px 16px', borderRadius: 'var(--radius-full)',
                border: `1px solid ${category === cat ? 'var(--color-primary)' : 'var(--border-color)'}`,
                background: category === cat ? 'var(--color-primary-dim)' : 'transparent',
                color: category === cat ? 'var(--color-primary)' : 'var(--text-muted)',
                cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                textTransform: 'capitalize', transition: 'all var(--transition-fast)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {cat === 'all' ? '🌍 All' : cat === 'climate' ? '🌡️ Climate' : cat === 'energy' ? '☀️ Energy' : cat === 'food' ? '🌱 Food' : '♻️ Recycling'}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔍</div>
          <p>No articles found matching your search.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filtered.map((article, i) => (
            <div
              key={article.id}
              className="glass-card"
              style={{ padding: '24px', cursor: 'pointer', animationDelay: `${i * 0.05}s` }}
              onClick={() => setSelected(article)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <span style={{
                  background: `${article.color}15`, color: article.color,
                  border: `1px solid ${article.color}25`, padding: '3px 10px',
                  borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 600,
                }}>{article.tag}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>⏱️ {article.read}</span>
              </div>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 700, marginBottom: 10, lineHeight: 1.35, color: 'var(--text-primary)' }}>{article.title}</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{article.excerpt}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: article.color, fontSize: '0.82rem', fontWeight: 600 }}>
                Read Article <RiExternalLinkLine size={13} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
