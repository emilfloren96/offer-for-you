import { useState, useEffect } from 'react';
import { CATEGORY_LABELS_SV, UNIT_LABEL } from '../data/materials';
import { SERVICE_CATEGORIES, REGIONS } from '../data/marketplace';
import { BACKEND } from './OfferPanel';

interface OfferLineItem {
  category: string;
  materialId: string;
  materialName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface OfferRecord {
  id: number;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  message: string;
  shape: string;
  floors: number;
  total_price: number;
  items_json: string;
}

interface JobRequest {
  id: number;
  created_at: string;
  title: string;
  description: string;
  category: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  status: string;
  interest_count: number;
  my_interest: number; // 1 = already expressed interest, 0 = not yet
}

interface CompanyDashboardProps {
  token: string;
  companyName: string;
  onBack: () => void;
  onLogout: () => void;
}

const shapeLabel: Record<string, string> = {
  rectangular: 'Rektangulär',
  't-shaped':  'T-formad',
  'l-shaped':  'L-formad',
  'u-shaped':  'U-formad',
};

const JOB_CATEGORIES = [
  { value: 'all',        label: 'Alla' },
  { value: 'roof',       label: 'Tak' },
  { value: 'walls',      label: 'Väggar' },
  { value: 'foundation', label: 'Grund' },
  { value: 'windows',    label: 'Fönster' },
  { value: 'doors',      label: 'Dörrar' },
  { value: 'other',      label: 'Övrigt' },
];

type Tab = 'jobs' | 'offers' | 'profile';

export function CompanyDashboard({ token, companyName, onBack, onLogout }: CompanyDashboardProps) {
  const [tab, setTab] = useState<Tab>('jobs');

  // ── Job Board state ──────────────────────────────────────────────────────
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);

  const [interestingJobId, setInterestingJobId] = useState<number | null>(null);

  // ── Offers state ─────────────────────────────────────────────────────────
  const [offers, setOffers] = useState<OfferRecord[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersError, setOffersError] = useState<string | null>(null);
  const [expandedOfferId, setExpandedOfferId] = useState<number | null>(null);

  // ── Profile state ────────────────────────────────────────────────────────
  const [profileRegion, setProfileRegion] = useState('');
  const [profileCategories, setProfileCategories] = useState<string[]>([]);
  const [profileBio, setProfileBio] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Fetch jobs
  useEffect(() => {
    const url = categoryFilter === 'all'
      ? `${BACKEND}/api/job-requests`
      : `${BACKEND}/api/job-requests?category=${categoryFilter}`;

    setJobsLoading(true);
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('Kunde inte hämta jobbförfrågningar');
        return res.json();
      })
      .then(setJobs)
      .catch((err) => setJobsError(err.message))
      .finally(() => setJobsLoading(false));
  }, [token, categoryFilter]);

  // Fetch offers (only when tab is active)
  useEffect(() => {
    if (tab !== 'offers') return;
    setOffersLoading(true);
    fetch(`${BACKEND}/api/offers`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('Kunde inte hämta offerter');
        return res.json();
      })
      .then(setOffers)
      .catch((err) => setOffersError(err.message))
      .finally(() => setOffersLoading(false));
  }, [token, tab]);

  // Fetch own profile when profile tab is active
  useEffect(() => {
    if (tab !== 'profile') return;
    setProfileLoading(true);
    fetch(`${BACKEND}/api/professionals/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data) {
          setProfileRegion(data.region ?? '');
          setProfileCategories(data.categories ?? []);
          setProfileBio(data.bio ?? '');
          setProfilePhone(data.phone ?? '');
        }
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, [token, tab]);

  async function handleSaveProfile() {
    setProfileSaving(true);
    setProfileError(null);
    setProfileSaved(false);
    try {
      const res = await fetch(`${BACKEND}/api/professionals/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ region: profileRegion, categories: profileCategories, bio: profileBio, phone: profilePhone }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error ?? 'Fel vid sparande'); }
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Okänt fel');
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleExpressInterest(jobId: number) {
    setInterestingJobId(jobId);
    try {
      const res = await fetch(`${BACKEND}/api/job-requests/${jobId}/interest`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setJobs(prev => prev.map(j =>
        j.id === jobId ? { ...j, my_interest: 1, interest_count: data.interest_count } : j
      ));
    } catch {
      // silently ignore — state stays as-is
    } finally {
      setInterestingJobId(null);
    }
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min sedan`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} h sedan`;
    const days = Math.floor(hours / 24);
    return `${days} d sedan`;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-white)' }}>
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-sm font-medium hover:opacity-70 transition" style={{ color: 'var(--primary-blue)' }}>
              ← Tillbaka
            </button>
            <span className="text-gray-300">|</span>
            <h1 className="font-bold" style={{ color: 'var(--primary-blue)' }}>Företagspanel</h1>
            <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full bg-gray-100 font-medium" style={{ color: "#4b5563" }}>
              {companyName}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="text-sm font-medium hover:opacity-70 transition"
            style={{ color: 'var(--accent-red)' }}
          >
            Logga ut
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-0 border-t border-gray-100">
          <button
            onClick={() => setTab('jobs')}
            className="px-5 py-3 text-sm font-semibold border-b-2 transition"
            style={{
              borderColor: tab === 'jobs' ? 'var(--primary-blue)' : 'transparent',
              color: tab === 'jobs' ? 'var(--primary-blue)' : '#4b5563',
            }}
          >
            Hitta jobb
            {!jobsLoading && !jobsError && (
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-blue-50" style={{ color: 'var(--primary-blue)' }}>
                {jobs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('offers')}
            className="px-5 py-3 text-sm font-semibold border-b-2 transition"
            style={{
              borderColor: tab === 'offers' ? 'var(--primary-blue)' : 'transparent',
              color: tab === 'offers' ? 'var(--primary-blue)' : '#4b5563',
            }}
          >
            Inkomna offerter
            {!offersLoading && !offersError && tab === 'offers' && (
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-blue-50" style={{ color: 'var(--primary-blue)' }}>
                {offers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('profile')}
            className="px-5 py-3 text-sm font-semibold border-b-2 transition"
            style={{
              borderColor: tab === 'profile' ? 'var(--primary-blue)' : 'transparent',
              color: tab === 'profile' ? 'var(--primary-blue)' : '#4b5563',
            }}
          >
            Min profil
          </button>
        </div>
      </div>

      <div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* ── JOB BOARD TAB ── */}
        {tab === 'jobs' && (
          <div>
            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {JOB_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-full border transition"
                  style={{
                    borderColor: categoryFilter === cat.value ? 'var(--primary-blue)' : '#e5e7eb',
                    backgroundColor: categoryFilter === cat.value ? 'var(--primary-blue)' : 'white',
                    color: categoryFilter === cat.value ? 'white' : 'var(--text-main)',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {jobsLoading ? (
              <p className="text-center mt-20" style={{ color: "#4b5563" }}>Laddar jobbförfrågningar…</p>
            ) : jobsError ? (
              <p className="text-center mt-20 text-sm" style={{ color: 'var(--accent-red)' }}>{jobsError}</p>
            ) : jobs.length === 0 ? (
              <div className="text-center mt-20">
                <p style={{ color: "#4b5563" }}>Inga öppna jobbförfrågningar{categoryFilter !== 'all' ? ' i denna kategori' : ''} just nu.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => {
                  const isOpen = expandedJobId === job.id;
                  const catLabel = CATEGORY_LABELS_SV[job.category] ?? job.category;
                  return (
                    <div
                      key={job.id}
                      className="border border-gray-200 bg-white shadow-sm"
                      style={{ borderRadius: 'var(--border-radius)' }}
                    >
                      <button
                        className="w-full text-left px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                        onClick={() => setExpandedJobId(isOpen ? null : job.id)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          {/* Category badge */}
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full w-fit"
                            style={{ backgroundColor: '#e8f0fb', color: 'var(--primary-blue)' }}
                          >
                            {catLabel}
                          </span>
                          <span className="font-bold">{job.title}</span>
                          <span className="text-xs" style={{ color: "#4b5563" }}>{timeAgo(job.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium" style={{ color: "#4b5563" }}>{job.contact_name}</span>
                          {job.interest_count > 0 && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                              {job.interest_count} intresserade
                            </span>
                          )}
                          <span aria-hidden="true" style={{ color: "#9ca3af" }}>{isOpen ? "▲" : "▼"}</span>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-gray-100 px-5 py-4">
                          {job.description && (
                            <p className="text-sm mb-4 leading-relaxed" style={{ color: "#4b5563" }}>
                              {job.description}
                            </p>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#4b5563" }}>Namn</div>
                              <div className="font-medium">{job.contact_name}</div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#4b5563" }}>E-post</div>
                              <a
                                href={`mailto:${job.contact_email}`}
                                className="font-medium hover:underline"
                                style={{ color: 'var(--primary-blue)' }}
                              >
                                {job.contact_email}
                              </a>
                            </div>
                            {job.contact_phone && (
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#4b5563" }}>Telefon</div>
                                <a
                                  href={`tel:${job.contact_phone}`}
                                  className="font-medium hover:underline"
                                  style={{ color: 'var(--primary-blue)' }}
                                >
                                  {job.contact_phone}
                                </a>
                              </div>
                            )}
                          </div>
                          <div className="mt-4 flex flex-wrap gap-3">
                            <button
                              onClick={() => handleExpressInterest(job.id)}
                              disabled={!!job.my_interest || interestingJobId === job.id}
                              className="px-5 py-2 text-sm font-semibold transition"
                              style={{
                                backgroundColor: job.my_interest ? '#f0fdf4' : 'var(--primary-blue)',
                                color: job.my_interest ? '#16a34a' : '#fff',
                                border: job.my_interest ? '1px solid #bbf7d0' : 'none',
                                borderRadius: 'var(--border-radius)',
                                cursor: job.my_interest || interestingJobId === job.id ? 'default' : 'pointer',
                                opacity: interestingJobId === job.id ? 0.6 : 1,
                              }}
                            >
                              {job.my_interest ? '✓ Intresse anmält' : interestingJobId === job.id ? 'Skickar…' : 'Anmäl intresse'}
                            </button>
                            <a
                              href={`mailto:${job.contact_email}?subject=Svar på din jobbförfrågan: ${encodeURIComponent(job.title)}`}
                              className="inline-block px-5 py-2 text-sm font-semibold transition hover:opacity-90"
                              style={{ backgroundColor: '#f3f4f6', color: 'var(--text-main)', borderRadius: 'var(--border-radius)' }}
                            >
                              Kontakta kunden →
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── OFFERS TAB ── */}
        {tab === 'offers' && (
          <div>
            {offersLoading ? (
              <p className="text-center mt-20" style={{ color: "#4b5563" }}>Laddar offerter…</p>
            ) : offersError ? (
              <p className="text-center mt-20 text-sm" style={{ color: 'var(--accent-red)' }}>{offersError}</p>
            ) : offers.length === 0 ? (
              <p className="text-center mt-20" style={{ color: "#4b5563" }}>Inga offerter inkomna ännu.</p>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--primary-blue)' }}>
                  Inkomna offerter
                </h2>
                {offers.map((offer) => {
                  const items: OfferLineItem[] = JSON.parse(offer.items_json);
                  const isOpen = expandedOfferId === offer.id;
                  const date = new Date(offer.created_at).toLocaleDateString('sv-SE', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  });

                  return (
                    <div
                      key={offer.id}
                      className="border border-gray-200 bg-white shadow-sm"
                      style={{ borderRadius: 'var(--border-radius)' }}
                    >
                      <button
                        className="w-full text-left px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                        onClick={() => setExpandedOfferId(isOpen ? null : offer.id)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#4b5563" }}>
                            #{offer.id} · {date}
                          </span>
                          <span className="font-bold">{offer.customer_name}</span>
                          <span className="text-sm" style={{ color: "#4b5563" }}>{offer.customer_email}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full border border-gray-200" style={{ color: "#4b5563" }}>
                            {shapeLabel[offer.shape] ?? offer.shape} · {offer.floors} vån
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold" style={{ color: 'var(--primary-blue)' }}>
                            {offer.total_price.toLocaleString('sv-SE')} kr
                          </span>
                          <span aria-hidden="true" style={{ color: "#9ca3af" }}>{isOpen ? "▲" : "▼"}</span>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-gray-100 px-5 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-sm">
                            {offer.customer_phone && (
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#4b5563" }}>Telefon</div>
                                <div>{offer.customer_phone}</div>
                              </div>
                            )}
                            {offer.message && (
                              <div className="sm:col-span-2">
                                <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#4b5563" }}>Meddelande</div>
                                <div>{offer.message}</div>
                              </div>
                            )}
                          </div>

                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#4b5563" }}>
                                <th className="pb-2">Del</th>
                                <th className="pb-2">Material</th>
                                <th className="pb-2 text-right">Mängd</th>
                                <th className="pb-2 text-right">á-pris</th>
                                <th className="pb-2 text-right">Summa</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((item, i) => (
                                <tr key={i} className="border-t border-gray-100">
                                  <td className="py-2">{CATEGORY_LABELS_SV[item.category] ?? item.category}</td>
                                  <td className="py-2">{item.materialName}</td>
                                  <td className="py-2 text-right">{item.quantity} {UNIT_LABEL[item.unit as keyof typeof UNIT_LABEL] ?? item.unit}</td>
                                  <td className="py-2 text-right">{item.unitPrice.toLocaleString('sv-SE')} kr</td>
                                  <td className="py-2 text-right font-semibold">{item.lineTotal.toLocaleString('sv-SE')} kr</td>
                                </tr>
                              ))}
                              <tr className="border-t-2 border-gray-300">
                                <td colSpan={4} className="py-2 font-bold">Totalt</td>
                                <td className="py-2 text-right font-extrabold" style={{ color: 'var(--primary-blue)' }}>
                                  {offer.total_price.toLocaleString('sv-SE')} kr
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {tab === 'profile' && (
          <div style={{ maxWidth: 560 }}>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--primary-blue)' }}>
              Din profil i katalogen
            </h2>
            <p className="text-sm mb-6" style={{ color: '#4b5563' }}>
              Fyll i din profil för att synas i vår proffs-katalog. Husägare söker och filtrerar efter region och tjänst.
            </p>

            {profileLoading ? (
              <p style={{ color: '#4b5563' }}>Laddar profil…</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Region */}
                <div>
                  <label htmlFor="prof-region" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                    Region <span style={{ color: 'var(--accent-red)' }}>*</span>
                  </label>
                  <select
                    id="prof-region"
                    value={profileRegion}
                    onChange={e => setProfileRegion(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 'var(--border-radius)', fontSize: 14 }}
                  >
                    <option value="">Välj region…</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* Categories */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>Tjänster du erbjuder</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {SERVICE_CATEGORIES.map(cat => {
                      const active = profileCategories.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setProfileCategories(prev =>
                            active ? prev.filter(c => c !== cat.id) : [...prev, cat.id]
                          )}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 99,
                            border: active ? '2px solid var(--primary-blue)' : '1px solid #e5e7eb',
                            backgroundColor: active ? '#e8f0fb' : '#fff',
                            color: active ? 'var(--primary-blue)' : 'var(--text-main)',
                            fontWeight: active ? 700 : 400,
                            fontSize: 13,
                            cursor: 'pointer',
                          }}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="prof-bio" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                    Om företaget <span style={{ color: 'var(--accent-red)' }}>*</span>
                  </label>
                  <textarea
                    id="prof-bio"
                    rows={4}
                    value={profileBio}
                    onChange={e => setProfileBio(e.target.value)}
                    placeholder="Berätta kort om ditt företag, erfarenhet och vad ni specialiserar er på…"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 'var(--border-radius)', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="prof-phone" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                    Telefon
                  </label>
                  <input
                    id="prof-phone"
                    type="tel"
                    value={profilePhone}
                    onChange={e => setProfilePhone(e.target.value)}
                    placeholder="070-123 45 67"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 'var(--border-radius)', fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>

                {profileError && <p role="alert" style={{ color: 'var(--accent-red)', fontSize: 13 }}>{profileError}</p>}
                {profileSaved && <p style={{ color: '#16a34a', fontSize: 13, fontWeight: 600 }}>Profil sparad! Du syns nu i katalogen.</p>}

                <button
                  onClick={handleSaveProfile}
                  disabled={!profileRegion || !profileBio || profileSaving}
                  style={{
                    padding: '11px 0',
                    backgroundColor: 'var(--primary-blue)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--border-radius)',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: profileRegion && profileBio && !profileSaving ? 'pointer' : 'not-allowed',
                    opacity: profileRegion && profileBio && !profileSaving ? 1 : 0.5,
                  }}
                >
                  {profileSaving ? 'Sparar…' : 'Spara profil'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
