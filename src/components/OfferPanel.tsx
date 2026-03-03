import { useState } from 'react';
import {
  CATEGORY_LABELS_SV,
  UNIT_LABEL,
  type SelectedMaterial,
  type CustomerInfo,
} from '../data/materials';

const BACKEND = 'http://localhost:3001';

interface OfferPanelProps {
  selections: Record<string, SelectedMaterial>;
  totalPrice: number;
  shape: string;
  floors: number;
  onSubmit: (customer: CustomerInfo) => Promise<void>;
  onClose: () => void;
}

export function OfferPanel({
  selections,
  totalPrice,
  onSubmit,
  onClose,
}: OfferPanelProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const items = Object.values(selections);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit({ name, email, phone, message });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Okänt fel');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-white shadow-lg p-8 text-center" style={{ borderRadius: 'var(--border-radius)' }}>
        <div className="text-5xl mb-4" style={{ color: 'var(--primary-blue)' }}>&#10003;</div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--primary-blue)' }}>
          Tack för din offert!
        </h3>
        <p className="mb-6" style={{ opacity: 0.7 }}>
          Vi har tagit emot din offertförfrågan och återkommer inom kort.
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2 text-white font-semibold transition hover:opacity-90"
          style={{ backgroundColor: 'var(--primary-blue)', borderRadius: 'var(--border-radius)' }}
        >
          Stäng
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg p-6 sm:p-8" style={{ borderRadius: 'var(--border-radius)' }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold" style={{ color: 'var(--primary-blue)' }}>Offertförfrågan</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
          &times;
        </button>
      </div>
      <div className="w-12 h-[3px] mb-5" style={{ backgroundColor: 'var(--accent-red)' }} />

      {/* No selections warning */}
      {items.length === 0 && (
        <div className="mb-6 p-4 border rounded text-sm" style={{ borderRadius: 'var(--border-radius)', borderColor: '#fca5a5', backgroundColor: '#fef2f2', color: '#b91c1c' }}>
          Du har inte valt något material ännu. Gå tillbaka till modellen, klicka på en byggdel och välj ett material — sedan kan du skicka offerten.
        </div>
      )}

      {/* Order summary */}
      {items.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50" style={{ borderRadius: 'var(--border-radius)' }}>
          <h4 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ opacity: 0.5 }}>
            Ditt val
          </h4>
          <div className="space-y-1.5">
            {items.map((sel) => (
              <div key={sel.category} className="flex justify-between text-sm">
                <span>
                  {CATEGORY_LABELS_SV[sel.category]}:{' '}
                  <span style={{ opacity: 0.65 }}>
                    {sel.material.name} · {sel.quantity} {UNIT_LABEL[sel.material.unit]}
                  </span>
                </span>
                <span className="font-semibold ml-4 shrink-0">
                  {sel.lineTotal.toLocaleString('sv-SE')} kr
                </span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold">
              <span>Totalt</span>
              <span style={{ color: 'var(--primary-blue)' }}>
                {totalPrice.toLocaleString('sv-SE')} kr
              </span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Namn</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none"
            style={{ borderRadius: 'var(--border-radius)' }}
            placeholder="Ditt namn"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">E-post</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none"
            style={{ borderRadius: 'var(--border-radius)' }}
            placeholder="din@email.se"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Telefon</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none"
            style={{ borderRadius: 'var(--border-radius)' }}
            placeholder="070-123 45 67"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Meddelande</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none"
            style={{ borderRadius: 'var(--border-radius)' }}
            placeholder="Beskriv vad du behöver hjälp med..."
          />
        </div>
        {error && (
          <p className="text-sm" style={{ color: 'var(--accent-red)' }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || items.length === 0}
          className="w-full py-3 text-white font-semibold transition hover:opacity-90"
          style={{
            backgroundColor: 'var(--primary-blue)',
            borderRadius: 'var(--border-radius)',
            opacity: items.length === 0 ? 0.4 : undefined,
            cursor: items.length === 0 ? 'not-allowed' : undefined,
          }}
        >
          {loading ? 'Skickar…' : 'Skicka offertförfrågan'}
        </button>
      </form>
    </div>
  );
}

// Keep BACKEND exported so it can be used by parent
export { BACKEND };
