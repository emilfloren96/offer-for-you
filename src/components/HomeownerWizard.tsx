import { useState } from 'react';
import { SERVICE_CATEGORIES, REGIONS, URGENCY_OPTIONS, MOCK_PROFESSIONALS } from '../data/marketplace';
import { ProCard } from './ProCard';
import type { Professional } from '../data/marketplace';
import { BACKEND } from './OfferPanel';

interface HomeownerWizardProps {
  onBack: () => void;
  onViewPros: (category: string, region: string) => void;
}

interface StepIndicatorProps {
  current: number;
  total: number;
}

function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <nav aria-label="Steg i guiden" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            aria-current={i + 1 === current ? 'step' : undefined}
            style={{
              width: i + 1 <= current ? 28 : 24,
              height: i + 1 <= current ? 28 : 24,
              borderRadius: '50%',
              backgroundColor: i + 1 < current ? '#004494' : i + 1 === current ? 'var(--primary-blue)' : '#e5e7eb',
              color: i + 1 <= current ? '#fff' : '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            {i + 1 < current ? (
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : i + 1}
          </div>
          {i < total - 1 && (
            <div
              aria-hidden="true"
              style={{
                width: 32,
                height: 2,
                backgroundColor: i + 1 < current ? 'var(--primary-blue)' : '#e5e7eb',
                borderRadius: 99,
                transition: 'background-color 0.2s ease',
              }}
            />
          )}
        </div>
      ))}
    </nav>
  );
}

export function HomeownerWizard({ onBack, onViewPros }: HomeownerWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [contactPro, setContactPro] = useState<Professional | null>(null);

  const selectedCat = SERVICE_CATEGORIES.find((c) => c.id === selectedCategory);

  // Matched pros: same category, then same region, sorted by score desc
  const matchedPros = MOCK_PROFESSIONALS
    .filter((p) => selectedCategory && p.categories.includes(selectedCategory))
    .filter((p) => !selectedRegion || p.region === selectedRegion)
    .sort((a, b) => {
      if (a.premium !== b.premium) return a.premium ? -1 : 1;
      return b.score - a.score;
    })
    .slice(0, 3);

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${BACKEND}/api/job-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || `${selectedCat?.label ?? 'Projekt'} i ${selectedRegion}`,
          description,
          category: selectedCategory,
          contact_name: name,
          contact_email: email,
          contact_phone: phone,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Kunde inte skicka förfrågan');
      }
      setStep(4);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Okänt fel');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-white)' }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '0 24px',
        }}
      >
        <div
          style={{
            maxWidth: 800,
            margin: '0 auto',
            height: 56,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <button
            onClick={step > 1 && step < 4 ? () => setStep((s) => s - 1) : onBack}
            style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: 0 }}
          >
            ← {step > 1 && step < 4 ? 'Föregående' : 'Tillbaka'}
          </button>
          <span style={{ color: '#d1d5db' }}>|</span>
          <span style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>Starta ett projekt</span>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        {/* ── Step 1: Category ── */}
        {step === 1 && (
          <section aria-labelledby="step1-heading">
            <StepIndicator current={1} total={3} />
            <h1 id="step1-heading" style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary-blue)', marginBottom: 8 }}>
              Vad behöver du hjälp med?
            </h1>
            <p style={{ fontSize: 15, color: '#4b5563', marginBottom: 28 }}>
              Välj den tjänst som bäst beskriver ditt projekt.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: 12,
              }}
            >
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setStep(2); }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    padding: '20px 12px',
                    border: selectedCategory === cat.id ? '2px solid var(--primary-blue)' : '1px solid #e5e7eb',
                    borderRadius: 'var(--border-radius)',
                    backgroundColor: selectedCategory === cat.id ? '#e8f0fb' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'center',
                  }}
                >
                  <span aria-hidden="true" style={{ fontSize: 28 }}>{cat.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-main)' }}>{cat.label}</span>
                  <span style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.3 }}>{cat.description}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Step 2: Region + Urgency ── */}
        {step === 2 && (
          <section aria-labelledby="step2-heading">
            <StepIndicator current={2} total={3} />
            <h1 id="step2-heading" style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary-blue)', marginBottom: 8 }}>
              Var och när?
            </h1>
            {selectedCat && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24, padding: '4px 12px', backgroundColor: '#e8f0fb', borderRadius: 99 }}>
                <span aria-hidden="true">{selectedCat.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-blue)' }}>{selectedCat.label}</span>
              </div>
            )}

            <div style={{ marginBottom: 28 }}>
              <label
                htmlFor="region-select"
                style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}
              >
                Din region
              </label>
              <select
                id="region-select"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: 360,
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: 'var(--border-radius)',
                  fontSize: 14,
                  color: 'var(--text-main)',
                  backgroundColor: '#fff',
                }}
              >
                <option value="">Välj region…</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 12 }}>
                Hur bråttom är det?
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360 }}>
                {URGENCY_OPTIONS.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUrgency(u.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      border: selectedUrgency === u.id ? '2px solid var(--primary-blue)' : '1px solid #e5e7eb',
                      borderRadius: 'var(--border-radius)',
                      backgroundColor: selectedUrgency === u.id ? '#e8f0fb' : '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>{u.label}</span>
                    <span style={{ fontSize: 12, color: '#4b5563' }}>{u.sublabel}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              disabled={!selectedRegion || !selectedUrgency}
              style={{
                padding: '12px 36px',
                backgroundColor: 'var(--primary-blue)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                fontWeight: 700,
                fontSize: 15,
                cursor: selectedRegion && selectedUrgency ? 'pointer' : 'not-allowed',
                opacity: selectedRegion && selectedUrgency ? 1 : 0.5,
              }}
            >
              Fortsätt →
            </button>
          </section>
        )}

        {/* ── Step 3: Details + contact ── */}
        {step === 3 && (
          <section aria-labelledby="step3-heading">
            <StepIndicator current={3} total={3} />
            <h1 id="step3-heading" style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary-blue)', marginBottom: 8 }}>
              Beskriv projektet
            </h1>
            <p style={{ fontSize: 15, color: '#4b5563', marginBottom: 28 }}>
              Ju mer du berättar, desto bättre matchning får du.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 560 }}>
              <div>
                <label htmlFor="proj-title" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                  Titel (valfritt)
                </label>
                <input
                  id="proj-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`T.ex. "Takbyte på villa i ${selectedRegion}"`}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: 'var(--border-radius)',
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label htmlFor="proj-desc" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                  Beskriv jobbet <span style={{ color: 'var(--accent-red)' }}>*</span>
                </label>
                <textarea
                  id="proj-desc"
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Berätta vad du behöver hjälp med, ungefärlig storlek, material du föredrar, etc."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: 'var(--border-radius)',
                    fontSize: 14,
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div
                style={{
                  backgroundColor: 'var(--bg-light-grey)',
                  borderRadius: 'var(--border-radius)',
                  padding: '16px',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 14 }}>
                  Dina kontaktuppgifter
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label htmlFor="contact-name" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 4 }}>
                      Namn <span style={{ color: 'var(--accent-red)' }}>*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ditt namn"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: 'var(--border-radius)',
                        fontSize: 14,
                        boxSizing: 'border-box',
                        backgroundColor: '#fff',
                      }}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 4 }}>
                      E-post <span style={{ color: 'var(--accent-red)' }}>*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="din@email.se"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: 'var(--border-radius)',
                        fontSize: 14,
                        boxSizing: 'border-box',
                        backgroundColor: '#fff',
                      }}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-phone" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 4 }}>
                      Telefon
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="070-123 45 67"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: 'var(--border-radius)',
                        fontSize: 14,
                        boxSizing: 'border-box',
                        backgroundColor: '#fff',
                      }}
                    />
                  </div>
                </div>
              </div>

              {submitError && (
                <p role="alert" style={{ color: 'var(--accent-red)', fontSize: 13 }}>{submitError}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={!description || !name || !email || submitting}
                style={{
                  padding: '13px 0',
                  backgroundColor: 'var(--primary-blue)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--border-radius)',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: description && name && email && !submitting ? 'pointer' : 'not-allowed',
                  opacity: description && name && email && !submitting ? 1 : 0.5,
                }}
              >
                {submitting ? 'Skickar…' : 'Skicka förfrågan & se matchande proffs →'}
              </button>
            </div>
          </section>
        )}

        {/* ── Step 4: Success + matched pros ── */}
        {step === 4 && (
          <section aria-labelledby="step4-heading">
            {/* Success banner */}
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: 'var(--border-radius)',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 36,
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                ✓
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#15803d' }}>Förfrågan skickad!</div>
                <div style={{ fontSize: 13, color: '#166534' }}>
                  Vi har tagit emot din förfrågan. Nedan ser du proffs som matchar ditt projekt.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <h1 id="step4-heading" style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary-blue)', margin: 0 }}>
                {matchedPros.length > 0
                  ? `${matchedPros.length} proffs matchar ditt projekt`
                  : 'Inga matchande proffs hittades'}
              </h1>
              <button
                onClick={() => onViewPros(selectedCategory, selectedRegion)}
                style={{
                  padding: '8px 18px',
                  border: '2px solid var(--primary-blue)',
                  borderRadius: 'var(--border-radius)',
                  backgroundColor: 'transparent',
                  color: 'var(--primary-blue)',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Se alla proffs →
              </button>
            </div>

            {matchedPros.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {matchedPros.map((pro) => (
                  <ProCard
                    key={pro.id}
                    pro={pro}
                    highlighted
                    onContact={setContactPro}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <p style={{ color: '#4b5563', marginBottom: 16 }}>
                  Vi hittade inga proffs för just denna kombination just nu.
                </p>
                <button
                  onClick={() => onViewPros('all', 'all')}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: 'var(--primary-blue)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--border-radius)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Bläddra bland alla proffs
                </button>
              </div>
            )}

            {/* Contact modal */}
            {contactPro && (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="contact-wizard-title"
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
                    padding: '28px',
                    maxWidth: 380,
                    width: '100%',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                  }}
                >
                  <h2
                    id="contact-wizard-title"
                    style={{ fontWeight: 700, fontSize: 17, color: 'var(--primary-blue)', marginBottom: 4 }}
                  >
                    {contactPro.name}
                  </h2>
                  <div style={{ fontSize: 13, color: '#4b5563', marginBottom: 20 }}>{contactPro.company}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                    <a
                      href={`tel:${contactPro.phone.replace(/[^0-9+]/g, '')}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', border: '1px solid #e5e7eb', borderRadius: 'var(--border-radius)', color: 'var(--text-main)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
                    >
                      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      {contactPro.phone}
                    </a>
                    <a
                      href={`mailto:${contactPro.email}?subject=Projektförfrågan via Offer For You`}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', backgroundColor: 'var(--primary-blue)', borderRadius: 'var(--border-radius)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
                    >
                      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      Skicka e-post
                    </a>
                  </div>
                  <button
                    onClick={() => setContactPro(null)}
                    style={{ width: '100%', padding: '10px 0', border: '1px solid #e5e7eb', borderRadius: 'var(--border-radius)', background: '#fff', color: '#4b5563', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Stäng
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
