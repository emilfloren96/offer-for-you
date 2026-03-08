import { useState } from 'react';
import { BACKEND } from './OfferPanel';

const CATEGORIES = [
  { value: 'roof',       label: 'Tak' },
  { value: 'walls',      label: 'Väggar' },
  { value: 'foundation', label: 'Grund' },
  { value: 'windows',    label: 'Fönster' },
  { value: 'doors',      label: 'Dörrar' },
  { value: 'other',      label: 'Övrigt' },
];

interface QuickPostProps {
  onClose: () => void;
}

export function QuickPost({ onClose }: QuickPostProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'other',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch(`${BACKEND}/api/job-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Kunde inte skicka förfrågan');
      }
      setStatus('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Något gick fel');
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="bg-white shadow-lg p-8 text-center" style={{ borderRadius: 'var(--border-radius)' }}>
        <div className="text-4xl mb-4" aria-hidden="true">✓</div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--primary-blue)' }}>
          Förfrågan skickad!
        </h3>
        <p className="text-sm mb-6" style={{ color: '#4b5563' }}>
          Din jobbförfrågan är nu synlig för hantverkare på vår plattform. Du kommer bli kontaktad direkt.
        </p>
        <button
          onClick={onClose}
          className="px-8 py-3 text-white font-semibold transition hover:opacity-90"
          style={{ backgroundColor: 'var(--primary-blue)', borderRadius: 'var(--border-radius)' }}
        >
          Stäng
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg p-6 sm:p-8" style={{ borderRadius: 'var(--border-radius)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold" style={{ color: 'var(--primary-blue)' }}>
          Snabbpost – Beskriv ditt jobb
        </h3>
        <button
          onClick={onClose}
          aria-label="Stäng"
          className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
        >
          &times;
        </button>
      </div>
      <div className="w-12 h-[3px] mb-4" style={{ backgroundColor: 'var(--accent-red)' }} />
      <p className="text-sm mb-6" style={{ color: '#4b5563' }}>
        Beskriv vad du behöver hjälp med. Hantverkare ser din förfrågan och kontaktar dig direkt – inget krångel.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="qp-title" className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#4b5563' }}>
            Vad behöver du? *
          </label>
          <input
            id="qp-title"
            required
            type="text"
            autoComplete="off"
            placeholder="T.ex. Jag behöver ett nytt tak"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
            style={{ borderRadius: 'var(--border-radius)' }}
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="qp-category" className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#4b5563' }}>
            Kategori
          </label>
          <select
            id="qp-category"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-400"
            style={{ borderRadius: 'var(--border-radius)' }}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="qp-description" className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#4b5563' }}>
            Beskrivning
          </label>
          <textarea
            id="qp-description"
            rows={3}
            placeholder="Beskriv jobbet mer detaljerat om du vill..."
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-blue-400 resize-none"
            style={{ borderRadius: 'var(--border-radius)' }}
          />
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="qp-name" className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#4b5563' }}>
              Namn *
            </label>
            <input
              id="qp-name"
              required
              type="text"
              autoComplete="name"
              placeholder="Ditt namn"
              value={form.contactName}
              onChange={(e) => set('contactName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
              style={{ borderRadius: 'var(--border-radius)' }}
            />
          </div>
          <div>
            <label htmlFor="qp-email" className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#4b5563' }}>
              E-post *
            </label>
            <input
              id="qp-email"
              required
              type="email"
              autoComplete="email"
              placeholder="din@email.se"
              value={form.contactEmail}
              onChange={(e) => set('contactEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
              style={{ borderRadius: 'var(--border-radius)' }}
            />
          </div>
        </div>

        <div>
          <label htmlFor="qp-phone" className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#4b5563' }}>
            Telefon (valfritt)
          </label>
          <input
            id="qp-phone"
            type="tel"
            autoComplete="tel"
            placeholder="070-123 45 67"
            value={form.contactPhone}
            onChange={(e) => set('contactPhone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
            style={{ borderRadius: 'var(--border-radius)' }}
          />
        </div>

        {status === 'error' && (
          <p role="alert" className="text-sm" style={{ color: 'var(--accent-red)' }}>{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full py-3 text-white font-semibold transition hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: 'var(--primary-blue)', borderRadius: 'var(--border-radius)' }}
        >
          {status === 'sending' ? 'Skickar…' : 'Publicera jobbförfrågan'}
        </button>
      </form>
    </div>
  );
}
