import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-white)', color: 'var(--text-main)' }}>
      <a href="#main-content" className="skip-link">
        Hoppa till innehåll
      </a>
      <Header
        onCreateOffer={() => navigate('/configurator')}
        onCompany={() => navigate('/company')}
      />
      <main id="main-content">
        {/* Hero */}
        <section className="py-20 sm:py-32 text-center" style={{ backgroundColor: 'var(--bg-light-grey)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="inline-block mb-6">
              <span
                className="px-3 py-1 text-xs font-semibold uppercase tracking-widest rounded-full"
                style={{ backgroundColor: '#e8f0fb', color: 'var(--primary-blue)' }}
              >
                Sveriges byggmarknadsplats
              </span>
            </div>

            <h1
              className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight"
              style={{ color: 'var(--primary-blue)' }}
            >
              Vi kopplar husägare
              <br />
              med proffs.
            </h1>

            <div className="w-20 h-[3px] mx-auto mb-6" style={{ backgroundColor: 'var(--accent-red)' }} />

            <p
              className="text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed"
              style={{ color: '#4b5563' }}
            >
              Hitta rätt hantverkare för ditt projekt – eller hitta ditt nästa uppdrag. Enkelt, snabbt
              och utan mellanhänder.
            </p>

            {/* Dual CTA */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
              <div
                className="flex-1 max-w-xs mx-auto sm:mx-0 p-6 text-left bg-white shadow-md"
                style={{ borderRadius: 'var(--border-radius)' }}
              >
                <div className="text-2xl mb-2" aria-hidden="true">
                  🏠
                </div>
                <h2 className="font-bold text-base mb-1" style={{ color: 'var(--primary-blue)' }}>
                  Jag är husägare
                </h2>
                <p className="text-xs mb-4" style={{ color: '#4b5563' }}>
                  Beskriv ditt jobb eller använd vår 3D-kalkylator för ett exakt pris.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate('/wizard')}
                    className="w-full py-2 text-white text-sm font-semibold transition hover:opacity-90"
                    style={{
                      backgroundColor: 'var(--primary-blue)',
                      borderRadius: 'var(--border-radius)',
                    }}
                  >
                    Starta ett projekt →
                  </button>
                  <button
                    onClick={() => navigate('/configurator')}
                    className="w-full py-2 text-sm font-semibold border transition hover:opacity-80"
                    style={{
                      borderColor: 'var(--primary-blue)',
                      color: 'var(--primary-blue)',
                      borderRadius: 'var(--border-radius)',
                      backgroundColor: 'transparent',
                    }}
                  >
                    3D-kalkylator →
                  </button>
                </div>
              </div>

              <div
                className="flex-1 max-w-xs mx-auto sm:mx-0 p-6 text-left bg-white shadow-md"
                style={{ borderRadius: 'var(--border-radius)' }}
              >
                <div className="text-2xl mb-2" aria-hidden="true">
                  🔨
                </div>
                <h2 className="font-bold text-base mb-1" style={{ color: 'var(--primary-blue)' }}>
                  Jag är hantverkare
                </h2>
                <p className="text-xs mb-4" style={{ color: '#4b5563' }}>
                  Bläddra bland öppna jobb från husägare i din bransch och ta kontakt direkt.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate('/professionals')}
                    className="w-full py-2 text-white text-sm font-semibold transition hover:opacity-90"
                    style={{
                      backgroundColor: 'var(--accent-red)',
                      borderRadius: 'var(--border-radius)',
                    }}
                  >
                    Bläddra bland proffs →
                  </button>
                  <button
                    onClick={() => navigate('/company')}
                    className="w-full py-2 text-sm font-semibold border transition hover:opacity-80"
                    style={{
                      borderColor: 'var(--accent-red)',
                      color: 'var(--accent-red)',
                      borderRadius: 'var(--border-radius)',
                      backgroundColor: 'transparent',
                    }}
                  >
                    Logga in / Registrera →
                  </button>
                </div>
              </div>
            </div>

            {/* Feature chips */}
            <div className="flex flex-wrap justify-center gap-3">
              {['Interaktiv 3D-modell', 'Öppna jobbförfrågningar', 'Direkt kontakt'].map((f) => (
                <span
                  key={f}
                  className="px-4 py-1.5 text-sm font-medium border rounded-full"
                  style={{ borderColor: '#d1d5db', color: 'var(--text-main)' }}
                >
                  ✓ {f}
                </span>
              ))}
            </div>

            <p className="mt-6 text-xs" style={{ color: '#4b5563' }}>
              Gratis · Ingen registrering krävs för husägare
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};
