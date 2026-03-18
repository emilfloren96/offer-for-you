import { useState, useEffect } from 'react';
import { SERVICE_CATEGORIES, REGIONS } from '../data/marketplace';
import { ProCard } from './ProCard';
import type { Professional } from '../data/marketplace';

const BACKEND = 'http://localhost:3001';

interface ProDirectoryProps {
  initialCategory?: string;
  initialRegion?: string;
  onBack: () => void;
}

interface ContactModalProps {
  pro: Professional;
  onClose: () => void;
}

function ContactModal({ pro, onClose }: ContactModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 'var(--border-radius)',
          padding: '32px',
          maxWidth: 400,
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div
            aria-hidden="true"
            style={{
              width: 52, height: 52, borderRadius: '50%',
              backgroundColor: pro.avatarColor, color: '#fff',
              fontWeight: 700, fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            {pro.initials}
          </div>
          <div>
            <h2 id="contact-modal-title" style={{ fontWeight: 700, fontSize: 17, color: 'var(--primary-blue)', margin: 0 }}>
              {pro.name}
            </h2>
            <div style={{ fontSize: 13, color: '#4b5563' }}>{pro.company}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {pro.phone && (
            <a
              href={`tel:${pro.phone.replace(/[^0-9+]/g, '')}`}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 'var(--border-radius)', textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600, fontSize: 14 }}
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {pro.phone}
            </a>
          )}
          <a
            href={`mailto:${pro.email}?subject=Förfrågan via Offer For You`}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 'var(--border-radius)', textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600, fontSize: 14 }}
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            {pro.email}
          </a>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '10px 0', border: '2px solid #e5e7eb', borderRadius: 'var(--border-radius)', background: '#fff', color: '#4b5563', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
          >
            Stäng
          </button>
          <a
            href={`mailto:${pro.email}?subject=Förfrågan via Offer For You`}
            style={{ flex: 2, padding: '10px 0', backgroundColor: 'var(--primary-blue)', border: 'none', borderRadius: 'var(--border-radius)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            Skicka förfrågan
          </a>
        </div>
      </div>
    </div>
  );
}

export function ProDirectory({ initialCategory, initialRegion, onBack }: ProDirectoryProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory ?? 'all');
  const [selectedRegion, setSelectedRegion] = useState(initialRegion ?? 'all');
  const [contactPro, setContactPro] = useState<Professional | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'rating' | 'jobs'>('score');

  const [pros, setPros] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch professionals from API whenever category or region filter changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedRegion !== 'all') params.set('region', selectedRegion);

    fetch(`${BACKEND}/api/professionals?${params}`)
      .then(r => { if (!r.ok) throw new Error('Kunde inte hämta proffs'); return r.json(); })
      .then((data: Professional[]) => {
        // Build initials + avatarColor from company name if missing
        const withDefaults = data.map((p, i) => ({
          ...p,
          initials: p.initials ?? p.company.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
          avatarColor: p.avatarColor ?? ['#004494','#c0392b','#27ae60','#8e44ad','#e67e22','#16a085'][i % 6],
          rating: p.rating ?? 0,
          reviewCount: p.reviewCount ?? 0,
          completedJobs: p.completedJobs ?? 0,
          responseTime: p.responseTime ?? '–',
          name: p.name ?? p.company,
        }));
        setPros(withDefaults);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedRegion]);

  const sorted = [...pros].sort((a, b) => {
    if (a.premium !== b.premium) return a.premium ? -1 : 1;
    if (sortBy === 'score')  return b.score - a.score;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.completedJobs - a.completedJobs;
  });

  const activeCatLabel = SERVICE_CATEGORIES.find(c => c.id === selectedCategory)?.label;

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-white)' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100, padding: '0 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: 0 }}>
            ← Tillbaka
          </button>
          <span style={{ color: '#d1d5db' }}>|</span>
          <span style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>Hitta Proffs</span>
        </div>
      </div>

      {/* Hero strip */}
      <div style={{ backgroundColor: 'var(--bg-light-grey)', padding: '40px 24px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary-blue)', marginBottom: 8 }}>
            {activeCatLabel ? `Proffs inom ${activeCatLabel}` : 'Hitta rätt hantverkare'}
            {selectedRegion !== 'all' ? ` i ${selectedRegion}` : ''}
          </h1>
          <p style={{ fontSize: 15, color: '#4b5563', marginBottom: 24 }}>
            Kontakta proffs direkt — alla har fyllt i sin profil och region själva.
          </p>

          {/* Filter bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              aria-label="Filtrera på tjänst"
              style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: 'var(--border-radius)', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', backgroundColor: '#fff', cursor: 'pointer' }}
            >
              <option value="all">Alla tjänster</option>
              {SERVICE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>

            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              aria-label="Filtrera på region"
              style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: 'var(--border-radius)', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', backgroundColor: '#fff', cursor: 'pointer' }}
            >
              <option value="all">Alla regioner</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              aria-label="Sortera"
              style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: 'var(--border-radius)', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', backgroundColor: '#fff', cursor: 'pointer' }}
            >
              <option value="score">Energybrand Score</option>
              <option value="rating">Högst betyg</option>
              <option value="jobs">Flest jobb</option>
            </select>

            {!loading && !error && (
              <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                <span style={{ fontSize: 13, color: '#4b5563', fontWeight: 600 }}>{sorted.length} proffs</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {loading ? (
          <p style={{ color: '#4b5563', textAlign: 'center', marginTop: 60 }}>Laddar proffs…</p>
        ) : error ? (
          <p style={{ color: 'var(--accent-red)', textAlign: 'center', marginTop: 60 }}>{error}</p>
        ) : sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 16, color: '#4b5563', marginBottom: 8 }}>
              Inga proffs hittades{selectedRegion !== 'all' ? ` i ${selectedRegion}` : ''}{selectedCategory !== 'all' ? ` inom ${activeCatLabel}` : ''}.
            </p>
            <p style={{ fontSize: 13, color: '#6b7280' }}>
              Är du hantverkare? Logga in och fyll i din profil för att synas här.
            </p>
            <button
              onClick={() => { setSelectedCategory('all'); setSelectedRegion('all'); }}
              style={{ marginTop: 20, padding: '10px 24px', backgroundColor: 'var(--primary-blue)', color: '#fff', border: 'none', borderRadius: 'var(--border-radius)', fontWeight: 700, cursor: 'pointer' }}
            >
              Visa alla regioner
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {sorted.map(pro => (
              <ProCard
                key={pro.id}
                pro={pro}
                highlighted={selectedCategory !== 'all' && pro.categories.includes(selectedCategory)}
                onContact={setContactPro}
              />
            ))}
          </div>
        )}
      </div>

      {contactPro && <ContactModal pro={contactPro} onClose={() => setContactPro(null)} />}
    </main>
  );
}
