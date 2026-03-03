import { useState } from 'react';
import { BACKEND } from './OfferPanel';

interface CompanyAuthProps {
  onAuth: (token: string, companyName: string) => void;
}

export function CompanyAuth({ onAuth }: CompanyAuthProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Inloggning misslyckades');
      onAuth(data.token, data.companyName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Okänt fel');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: regName, email: regEmail, password: regPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Registrering misslyckades');
      onAuth(data.token, data.companyName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Okänt fel');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16 px-4">
      <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: 'var(--primary-blue)' }}>
        Företagspanel
      </h2>
      <div className="w-12 h-[3px] mx-auto mb-8" style={{ backgroundColor: 'var(--accent-red)' }} />

      {/* Tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        {(['login', 'register'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(null); }}
            className="flex-1 pb-3 text-sm font-semibold transition"
            style={{
              borderBottom: tab === t ? '2px solid var(--primary-blue)' : '2px solid transparent',
              color: tab === t ? 'var(--primary-blue)' : undefined,
              opacity: tab === t ? 1 : 0.45,
              marginBottom: -1,
            }}
          >
            {t === 'login' ? 'Logga in' : 'Registrera'}
          </button>
        ))}
      </div>

      {tab === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">E-post</label>
            <input
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none"
              style={{ borderRadius: 'var(--border-radius)' }}
              placeholder="foretag@email.se"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Lösenord</label>
            <div className="relative">
              <input
                type={showLoginPw ? 'text' : 'password'}
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 focus:outline-none"
                style={{ borderRadius: 'var(--border-radius)' }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowLoginPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                tabIndex={-1}
              >
                <EyeIcon open={showLoginPw} />
              </button>
            </div>
          </div>
          {error && <p className="text-sm" style={{ color: 'var(--accent-red)' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white font-semibold transition hover:opacity-90"
            style={{ backgroundColor: 'var(--primary-blue)', borderRadius: 'var(--border-radius)' }}
          >
            {loading ? 'Loggar in…' : 'Logga in'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Företagsnamn</label>
            <input
              type="text"
              required
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none"
              style={{ borderRadius: 'var(--border-radius)' }}
              placeholder="Ditt företag AB"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">E-post</label>
            <input
              type="email"
              required
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none"
              style={{ borderRadius: 'var(--border-radius)' }}
              placeholder="foretag@email.se"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Lösenord</label>
            <div className="relative">
              <input
                type={showRegPw ? 'text' : 'password'}
                required
                minLength={6}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 focus:outline-none"
                style={{ borderRadius: 'var(--border-radius)' }}
                placeholder="Minst 6 tecken"
              />
              <button
                type="button"
                onClick={() => setShowRegPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                tabIndex={-1}
              >
                <EyeIcon open={showRegPw} />
              </button>
            </div>
          </div>
          {error && <p className="text-sm" style={{ color: 'var(--accent-red)' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white font-semibold transition hover:opacity-90"
            style={{ backgroundColor: 'var(--primary-blue)', borderRadius: 'var(--border-radius)' }}
          >
            {loading ? 'Skapar konto…' : 'Skapa konto'}
          </button>
        </form>
      )}
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
