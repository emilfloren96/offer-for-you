import { useState, useRef } from 'react';
import { Header } from './components/Header';
import { ModelViewer } from './components/ModelViewer';
import { OfferPanel } from './components/OfferPanel';

function App() {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [selectedShape, setSelectedShape] = useState('rectangular');
  const offerRef = useRef<HTMLDivElement>(null);

  const scrollToOffer = () => {
    offerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-white)', color: 'var(--text-main)' }}>
      <Header onCreateOffer={scrollToOffer} />

      {/* Hero Section */}
      <section className="py-10 sm:py-16 text-center" style={{ backgroundColor: 'var(--bg-light-grey)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4" style={{ color: 'var(--primary-blue)' }}>
            Skapa Din Offert
          </h1>
          <div className="w-16 sm:w-24 h-[3px] mx-auto mb-4 sm:mb-6" style={{ backgroundColor: 'var(--accent-red)' }} />
          <p className="text-sm sm:text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-main)', opacity: 0.7 }}>
            Välj husform, klicka på en byggdel och få en skräddarsydd offert direkt.
          </p>
        </div>
      </section>

      {/* Two-Column Grid */}
      <section className="py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-12">
          {/* Left Column — Info */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: 'var(--primary-blue)' }}>
                Välkommen
              </h2>
              <div className="w-12 h-[3px] mb-3 sm:mb-4" style={{ backgroundColor: 'var(--accent-red)' }} />
              <p className="text-sm sm:text-base leading-relaxed" style={{ opacity: 0.8 }}>
                Vi hjälper dig att räkna ut kostnaden för ditt byggprojekt. Välj en husform, klicka på den del du vill ha offert på, och fyll i formuläret.
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <ContactItem
                icon={<MapPinIcon />}
                label="Adress"
                value="Byggvägen 12, 123 45 Stockholm"
              />
              <ContactItem
                icon={<PhoneIcon />}
                label="Telefon"
                value="070-123 45 67"
              />
              <ContactItem
                icon={<MailIcon />}
                label="E-post"
                value="info@offerforyou.se"
              />
            </div>

            <button
              onClick={scrollToOffer}
              className="w-full sm:w-auto px-8 py-3 text-white font-semibold transition hover:opacity-90"
              style={{ backgroundColor: 'var(--primary-blue)', borderRadius: 'var(--border-radius)' }}
            >
              Skapa Offert
            </button>
          </div>

          {/* Right Column — 3D Viewer */}
          <div className="lg:col-span-3" ref={offerRef}>
            <ModelViewer
              selectedPart={selectedPart}
              onSelectPart={setSelectedPart}
              selectedShape={selectedShape}
              onSelectShape={setSelectedShape}
            />
          </div>
        </div>
      </section>

      {/* Offer Panel */}
      {selectedPart && (
        <section className="pb-8 sm:pb-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <OfferPanel
              partId={selectedPart}
              onClose={() => setSelectedPart(null)}
            />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-6 sm:py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs sm:text-sm" style={{ opacity: 0.5 }}>
          &copy; 2026 Offer For You. Alla rättigheter förbehållna.
        </div>
      </footer>
    </div>
  );
}

function ContactItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5" style={{ color: 'var(--primary-blue)' }}>
        {icon}
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide" style={{ opacity: 0.5 }}>{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}

function MapPinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

export default App;
