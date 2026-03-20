import { lazy, Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { CostSummary } from '../components/CostSummary';
import { OfferPanel } from '../components/OfferPanel';
import { useHouseConfigurator } from '../hooks/useHouseConfigurator';

const ModelViewer = lazy(() =>
  import('../components/ModelViewer').then((m) => ({ default: m.ModelViewer }))
);
const MaterialPanel = lazy(() =>
  import('../components/MaterialPanel').then((m) => ({ default: m.MaterialPanel }))
);
const QuickPost = lazy(() =>
  import('../components/QuickPost').then((m) => ({ default: m.QuickPost }))
);

const ContactItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5" style={{ color: 'var(--primary-blue)' }}>
      {icon}
    </div>
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#4b5563' }}>
        {label}
      </div>
      <div className="font-medium">{value}</div>
    </div>
  </div>
);

const MapPinIcon = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MailIcon = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export const ConfiguratorPage = () => {
  const navigate = useNavigate();
  const [quickPostOpen, setQuickPostOpen] = useState(false);

  const {
    selectedPart,
    setSelectedPart,
    selectedShape,
    selectedFloors,
    selectedWindows,
    meshAreas,
    selections,
    offerFormOpen,
    cartModalOpen,
    offerRef,
    runningTotal,
    categoryColours,
    hasSelections,
    handleAreasCalculated,
    handleSelectShape,
    handleSelectFloors,
    handleSelectWindows,
    handleSelectMaterial,
    handleCartAddMore,
    handleCartSubmit,
    handleOpenOfferForm,
    handleCloseOfferForm,
    dismissOfferForm,
    handleSubmitOffer,
  } = useHouseConfigurator();

  const scrollToOffer = () => {
    offerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--bg-white)',
        color: 'var(--text-main)',
        paddingBottom: hasSelections ? '80px' : undefined,
      }}
    >
      <a href="#main-content" className="skip-link">
        Hoppa till innehåll
      </a>
      <Header onCreateOffer={scrollToOffer} onCompany={() => navigate('/company')} />

      {/* Cart Modal */}
      {cartModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-modal-title"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        >
          <div
            className="bg-white p-6 sm:p-8 max-w-sm w-full shadow-2xl"
            style={{ borderRadius: 'var(--border-radius)' }}
          >
            <div className="text-center mb-1">
              <span className="text-3xl" aria-hidden="true">
                ✓
              </span>
            </div>
            <h3
              id="cart-modal-title"
              className="text-lg font-bold text-center mb-1"
              style={{ color: 'var(--primary-blue)' }}
            >
              Material tillagt!
            </h3>
            <div
              className="w-10 h-[3px] mx-auto mb-4"
              style={{ backgroundColor: 'var(--accent-red)' }}
            />
            <p className="text-sm text-center mb-6" style={{ color: '#4b5563' }}>
              Vill du lägga till fler produkter, eller är du klar?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleCartAddMore}
                className="w-full py-3 font-semibold text-sm border-2 transition hover:opacity-80"
                style={{
                  borderColor: 'var(--primary-blue)',
                  color: 'var(--primary-blue)',
                  borderRadius: 'var(--border-radius)',
                  backgroundColor: 'transparent',
                }}
              >
                Lägg till fler produkter
              </button>
              <button
                onClick={handleCartSubmit}
                className="w-full py-3 text-white font-semibold text-sm transition hover:opacity-90"
                style={{
                  backgroundColor: 'var(--primary-blue)',
                  borderRadius: 'var(--border-radius)',
                }}
              >
                Jag är klar – skicka offert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Post Modal */}
      {quickPostOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Snabbpost"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)', overflowY: 'auto' }}
        >
          <div className="max-w-lg w-full my-8">
            <Suspense fallback={null}>
              <QuickPost onClose={() => setQuickPostOpen(false)} />
            </Suspense>
          </div>
        </div>
      )}

      <main id="main-content">
        {/* Hero */}
        <section
          className="py-10 sm:py-16 text-center"
          style={{ backgroundColor: 'var(--bg-light-grey)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h1
              className="text-2xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4"
              style={{ color: 'var(--primary-blue)' }}
            >
              Skapa Din Offert
            </h1>
            <div
              className="w-16 sm:w-24 h-[3px] mx-auto mb-4 sm:mb-6"
              style={{ backgroundColor: 'var(--accent-red)' }}
            />
            <p className="text-sm sm:text-lg max-w-2xl mx-auto mb-4" style={{ color: '#4b5563' }}>
              Välj husform, klicka på en byggdel och få en skräddarsydd offert direkt.
            </p>
            <button
              onClick={() => setQuickPostOpen(true)}
              className="text-sm font-medium underline transition hover:opacity-70"
              style={{ color: 'var(--primary-blue)' }}
            >
              Vill du hellre beskriva jobbet med ord? Snabbpost →
            </button>
          </div>
        </section>

        {/* Two-Column Grid */}
        <section className="py-8 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-12">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: 'var(--primary-blue)' }}>
                  Välkommen
                </h2>
                <div
                  className="w-12 h-[3px] mb-3 sm:mb-4"
                  style={{ backgroundColor: 'var(--accent-red)' }}
                />
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#4b5563' }}>
                  Vi hjälper dig att räkna ut kostnaden för ditt byggprojekt. Välj en husform, klicka
                  på den del du vill ha offert på, och fyll i formuläret.
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <ContactItem icon={<MapPinIcon />} label="Adress" value="Byggvägen 12, 123 45 Stockholm" />
                <ContactItem icon={<PhoneIcon />} label="Telefon" value="070-123 45 67" />
                <ContactItem icon={<MailIcon />} label="E-post" value="info@offerforyou.se" />
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
              <Suspense
                fallback={
                  <div
                    className="w-full h-[300px] sm:h-[500px] flex items-center justify-center text-gray-400 text-sm"
                    style={{ background: '#1a2030', borderRadius: 'var(--border-radius)' }}
                  >
                    Laddar 3D-modell…
                  </div>
                }
              >
                <ModelViewer
                  selectedPart={selectedPart}
                  onSelectPart={(part) => {
                    setSelectedPart(part);
                    dismissOfferForm();
                  }}
                  selectedShape={selectedShape}
                  onSelectShape={handleSelectShape}
                  selectedFloors={selectedFloors}
                  onSelectFloors={handleSelectFloors}
                  categoryColours={categoryColours}
                  onAreasCalculated={handleAreasCalculated}
                />
              </Suspense>
            </div>
          </div>
        </section>

        {/* Side panel area */}
        {(selectedPart || offerFormOpen) && (
          <section className="pb-8 sm:pb-16">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
              <Suspense fallback={null}>
                {selectedPart && !offerFormOpen && (
                  <MaterialPanel
                    category={selectedPart}
                    area={meshAreas[selectedPart] ?? 0}
                    currentSelection={selections[selectedPart] ?? null}
                    onSelectMaterial={(mat) => handleSelectMaterial(selectedPart, mat)}
                    windowCount={selectedWindows}
                    onChangeWindowCount={handleSelectWindows}
                    onOpenOfferForm={handleOpenOfferForm}
                    onClose={() => setSelectedPart(null)}
                  />
                )}

                {offerFormOpen && (
                  <OfferPanel
                    selections={selections}
                    totalPrice={runningTotal}
                    shape={selectedShape}
                    floors={selectedFloors}
                    onSubmit={handleSubmitOffer}
                    onClose={handleCloseOfferForm}
                  />
                )}
              </Suspense>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-gray-200" style={{ padding: '12px 24px' }}>
          <div
            className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
            style={{ color: '#4b5563' }}
          >
            <span>&copy; 2026 Offer For You. Alla rättigheter förbehållna.</span>
            <span>info@offerforyou.se · 070-123 45 67</span>
          </div>
        </footer>
      </main>

      {/* Cost summary bar */}
      {!offerFormOpen && (
        <CostSummary
          selections={selections}
          total={runningTotal}
          onOpenOfferForm={handleOpenOfferForm}
        />
      )}
    </div>
  );
};
