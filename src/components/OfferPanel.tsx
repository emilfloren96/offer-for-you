import { useState } from 'react';

const PART_INFO: Record<string, { title: string; description: string }> = {
  roof: {
    title: 'Tak',
    description: 'Takläggning, isolering, takpannor, plåttak eller andra takmaterial.',
  },
  walls: {
    title: 'Väggar',
    description: 'Ytter- och innerväggar, isolering, gipsskivor och konstruktion.',
  },
  windows: {
    title: 'Fönster',
    description: 'Fönsterinstallation, byte av fönster, energiglas och fönsterbågar.',
  },
  doors: {
    title: 'Dörrar',
    description: 'Ytterdörrar, innerdörrar, skjutdörrar och dörrtillbehör.',
  },
  foundation: {
    title: 'Grund',
    description: 'Grundläggning, betongplatta, krypgrund eller källare.',
  },
  terrace: {
    title: 'Terrass',
    description: 'Altan, terrass, trädäck och utemiljö.',
  },
  interior: {
    title: 'Interiör',
    description: 'Kök, badrum, golv, inredning och invändiga renoveringar.',
  },
};

interface OfferPanelProps {
  partId: string;
  onClose: () => void;
}

export function OfferPanel({ partId, onClose }: OfferPanelProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const info = PART_INFO[partId];

  if (!info) return null;

  if (submitted) {
    return (
      <div className="bg-white shadow-lg p-8 text-center" style={{ borderRadius: 'var(--border-radius)' }}>
        <div className="text-4xl mb-4">&#10003;</div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--primary-blue)' }}>
          Tack för din förfrågan!
        </h3>
        <p className="mb-6" style={{ opacity: 0.7 }}>
          Vi har tagit emot din offertförfrågan för <strong>{info.title}</strong> och återkommer inom kort.
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
    <div className="bg-white shadow-lg p-8" style={{ borderRadius: 'var(--border-radius)' }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold" style={{ color: 'var(--primary-blue)' }}>{info.title}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
        >
          &times;
        </button>
      </div>
      <div className="w-12 h-[3px] mb-4" style={{ backgroundColor: 'var(--accent-red)' }} />
      <p className="mb-6" style={{ opacity: 0.7 }}>{info.description}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-semibold mb-1">Namn</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2"
            style={{ borderRadius: 'var(--border-radius)', '--tw-ring-color': 'var(--primary-blue)' } as React.CSSProperties}
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
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2"
            style={{ borderRadius: 'var(--border-radius)', '--tw-ring-color': 'var(--primary-blue)' } as React.CSSProperties}
            placeholder="din@email.se"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Telefon</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2"
            style={{ borderRadius: 'var(--border-radius)', '--tw-ring-color': 'var(--primary-blue)' } as React.CSSProperties}
            placeholder="070-123 45 67"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Meddelande</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2"
            style={{ borderRadius: 'var(--border-radius)', '--tw-ring-color': 'var(--primary-blue)' } as React.CSSProperties}
            placeholder="Beskriv vad du behöver hjälp med..."
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 text-white font-semibold transition hover:opacity-90"
          style={{ backgroundColor: 'var(--primary-blue)', borderRadius: 'var(--border-radius)' }}
        >
          Skicka offertförfrågan
        </button>
      </form>
    </div>
  );
}
