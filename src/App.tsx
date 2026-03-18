import { useState, useRef, useCallback, lazy, Suspense } from "react";
import { Header } from "./components/Header";
import { CostSummary } from "./components/CostSummary";
import { OfferPanel, BACKEND } from "./components/OfferPanel";
import { CompanyAuth } from "./components/CompanyAuth";
import {
  deriveQuantity,
  type Material,
  type SelectedMaterial,
  type CustomerInfo,
  type OfferLineItem,
} from "./data/materials";

const ModelViewer = lazy(() => import("./components/ModelViewer").then(m => ({ default: m.ModelViewer })));
const MaterialPanel = lazy(() => import("./components/MaterialPanel").then(m => ({ default: m.MaterialPanel })));
const CompanyDashboard = lazy(() => import("./components/CompanyDashboard").then(m => ({ default: m.CompanyDashboard })));
const QuickPost = lazy(() => import("./components/QuickPost").then(m => ({ default: m.QuickPost })));

type View = "configurator" | "company" | "homeowner-wizard" | "pro-directory";

function App() {
  // ── Routing ──────────────────────────────────────────────────────────────
  const [view, setView] = useState<View>("configurator");
  const [proCategory, setProCategory] = useState('all');
  const [proRegion, setProRegion] = useState('all');

  // ── Company auth ──────────────────────────────────────────────────────────
  const [companyToken, setCompanyToken] = useState<string | null>(
    () => localStorage.getItem("company_token")
  );
  const [companyName, setCompanyName] = useState<string>(
    () => localStorage.getItem("company_name") ?? ""
  );

  function handleCompanyAuth(token: string, name: string) {
    localStorage.setItem("company_token", token);
    localStorage.setItem("company_name", name);
    setCompanyToken(token);
    setCompanyName(name);
  }

  function handleCompanyLogout() {
    localStorage.removeItem("company_token");
    localStorage.removeItem("company_name");
    setCompanyToken(null);
    setCompanyName("");
  }

  // ── Landing ──────────────────────────────────────────────────────────────
  const [landingVisible, setLandingVisible] = useState(true);
  const [landingMounted, setLandingMounted] = useState(true);
  const [quickPostOpen, setQuickPostOpen] = useState(false);
  const offerRef = useRef<HTMLDivElement>(null);

  const scrollToOffer = () => {
    offerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const dismissLanding = () => {
    setLandingVisible(false);
    setTimeout(() => setLandingMounted(false), 500);
  };

  // ── Configurator state ────────────────────────────────────────────────────
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [selectedShape, setSelectedShape] = useState("rectangular");
  const [selectedFloors, setSelectedFloors] = useState(1);
  const [selectedWindows, setSelectedWindows] = useState(4);
  const [meshAreas, setMeshAreas] = useState<Record<string, number>>({});
  const [selections, setSelections] = useState<Record<string, SelectedMaterial>>({});
  const [offerFormOpen, setOfferFormOpen] = useState(false);

  // ── Cart modal ────────────────────────────────────────────────────────────
  const [cartModalOpen, setCartModalOpen] = useState(false);

  // ── Derived values ────────────────────────────────────────────────────────
  const runningTotal =
    Math.round(
      Object.values(selections).reduce((sum, sel) => sum + sel.lineTotal, 0) * 100
    ) / 100;

  const categoryColours: Record<string, number> = Object.fromEntries(
    Object.entries(selections).map(([cat, sel]) => [cat, sel.material.colour])
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAreasCalculated = useCallback((areas: Record<string, number>) => {
    setMeshAreas(areas);
  }, []);

  function handleSelectShape(shape: string) {
    setSelectedShape(shape);
    setMeshAreas({});
    setSelections({});
    setSelectedPart(null);
    setOfferFormOpen(false);
  }

  function handleSelectFloors(floors: number) {
    setSelectedFloors(floors);
    setMeshAreas({});
    setSelections({});
    setSelectedPart(null);
    setOfferFormOpen(false);
  }

  function handleSelectWindows(count: number) {
    setSelectedWindows(count);
    setSelections((prev) => {
      if (!prev["windows"]) return prev;
      const sel = prev["windows"];
      const lineTotal = Math.round(sel.material.price * count * 100) / 100;
      return { ...prev, windows: { ...sel, quantity: count, lineTotal } };
    });
  }

  function handleSelectMaterial(category: string, material: Material) {
    const area = meshAreas[category] ?? 0;
    const quantity = category === "windows" ? selectedWindows : deriveQuantity(material.unit, area);
    const lineTotal = Math.round(material.price * quantity * 100) / 100;
    setSelections((prev) => ({
      ...prev,
      [category]: { category, material, quantity, lineTotal },
    }));
    // Show cart confirmation modal after selection
    setCartModalOpen(true);
  }

  function handleCartAddMore() {
    setCartModalOpen(false);
    setSelectedPart(null); // let user pick another part from the model
  }

  function handleCartSubmit() {
    setCartModalOpen(false);
    setSelectedPart(null);
    setOfferFormOpen(true);
    setTimeout(() => offerRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  function handleOpenOfferForm() {
    setOfferFormOpen(true);
    setTimeout(() => offerRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  function handleCloseOfferForm() {
    setOfferFormOpen(false);
    setSelectedPart(null);
    setSelections({});
  }

  async function handleSubmitOffer(customer: CustomerInfo): Promise<void> {
    const items: OfferLineItem[] = Object.values(selections).map((sel) => ({
      category: sel.category,
      materialId: sel.material.id,
      materialName: sel.material.name,
      unit: sel.material.unit,
      quantity: sel.quantity,
      unitPrice: sel.material.price,
      lineTotal: sel.lineTotal,
    }));

    const res = await fetch(`${BACKEND}/api/offers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer,
        shape: selectedShape,
        floors: selectedFloors,
        totalPrice: runningTotal,
        items,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Kunde inte skicka offert");
    }
  }

  // ── Homeowner Wizard ─────────────────────────────────────────────────────
  if (view === "homeowner-wizard") {
    return (
      <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: "var(--bg-white)" }} />}>
        <HomeownerWizard
          onBack={() => setView("configurator")}
          onViewPros={(cat, reg) => { setProCategory(cat); setProRegion(reg); setView("pro-directory"); }}
        />
      </Suspense>
    );
  }

  // ── Pro Directory ────────────────────────────────────────────────────────
  if (view === "pro-directory") {
    return (
      <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: "var(--bg-white)" }} />}>
        <ProDirectory
          initialCategory={proCategory}
          initialRegion={proRegion}
          onBack={() => setView("configurator")}
        />
      </Suspense>
    );
  }

  // ── Company dashboard (full-page) ─────────────────────────────────────────
  if (view === "company") {
    if (!companyToken) {
      return (
        <div className="min-h-screen" style={{ backgroundColor: "var(--bg-white)" }}>
          <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
              <button
                onClick={() => setView("configurator")}
                className="text-sm font-medium hover:opacity-70 transition"
                style={{ color: "var(--primary-blue)" }}
              >
                ← Tillbaka
              </button>
              <span className="text-gray-300">|</span>
              <span className="font-bold" style={{ color: "var(--primary-blue)" }}>Företagspanel</span>
            </div>
          </div>
          <main><CompanyAuth onAuth={handleCompanyAuth} /></main>
        </div>
      );
    }
    return (
      <main>
      <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: "var(--bg-white)" }} />}>
      <CompanyDashboard
        token={companyToken}
        companyName={companyName}
        onBack={() => setView("configurator")}
        onLogout={handleCompanyLogout}
      />
      </Suspense>
      </main>
    );
  }

  // ── Configurator ──────────────────────────────────────────────────────────
  const hasSelections = Object.keys(selections).length > 0;

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--bg-white)",
        color: "var(--text-main)",
        paddingBottom: hasSelections ? "80px" : undefined,
      }}
    >
      <a
        href="#main-content"
        className="skip-link"
      >
        Hoppa till innehåll
      </a>
      <Header
        onCreateOffer={landingMounted ? dismissLanding : scrollToOffer}
        onCompany={() => setView("company")}
      />

      {/* ── Cart Modal ── */}
      {cartModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-modal-title"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          <div
            className="bg-white p-6 sm:p-8 max-w-sm w-full shadow-2xl"
            style={{ borderRadius: "var(--border-radius)" }}
          >
            <div className="text-center mb-1">
              <span className="text-3xl" aria-hidden="true">✓</span>
            </div>
            <h3 id="cart-modal-title" className="text-lg font-bold text-center mb-1" style={{ color: "var(--primary-blue)" }}>
              Material tillagt!
            </h3>
            <div className="w-10 h-[3px] mx-auto mb-4" style={{ backgroundColor: "var(--accent-red)" }} />
            <p className="text-sm text-center mb-6" style={{ color: '#4b5563' }}>
              Vill du lägga till fler produkter, eller är du klar?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleCartAddMore}
                className="w-full py-3 font-semibold text-sm border-2 transition hover:opacity-80"
                style={{
                  borderColor: "var(--primary-blue)",
                  color: "var(--primary-blue)",
                  borderRadius: "var(--border-radius)",
                  backgroundColor: "transparent",
                }}
              >
                Lägg till fler produkter
              </button>
              <button
                onClick={handleCartSubmit}
                className="w-full py-3 text-white font-semibold text-sm transition hover:opacity-90"
                style={{ backgroundColor: "var(--primary-blue)", borderRadius: "var(--border-radius)" }}
              >
                Jag är klar – skicka offert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Post Modal ── */}
      {quickPostOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Snabbpost"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", overflowY: "auto" }}
        >
          <div className="max-w-lg w-full my-8">
            <Suspense fallback={null}><QuickPost onClose={() => setQuickPostOpen(false)} /></Suspense>
          </div>
        </div>
      )}

      {/* ── Landing Page ── */}
      {landingMounted && (
      <main id="main-content">
        <div
          style={{
            transition: "opacity 0.5s ease, transform 0.5s ease",
            opacity: landingVisible ? 1 : 0,
            transform: landingVisible ? "translateY(0)" : "translateY(-24px)",
            pointerEvents: landingVisible ? "auto" : "none",
          }}
        >
          {/* Hero */}
          <section
            className="py-20 sm:py-32 text-center"
            style={{ backgroundColor: "var(--bg-light-grey)" }}
          >
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
              <div className="inline-block mb-6">
                <span
                  className="px-3 py-1 text-xs font-semibold uppercase tracking-widest rounded-full"
                  style={{ backgroundColor: "#e8f0fb", color: "var(--primary-blue)" }}
                >
                  Sveriges byggmarknadsplats
                </span>
              </div>

              <h1
                className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight"
                style={{ color: "var(--primary-blue)" }}
              >
                Vi kopplar husägare
                <br />
                med proffs.
              </h1>

              <div className="w-20 h-[3px] mx-auto mb-6" style={{ backgroundColor: "var(--accent-red)" }} />

              <p className="text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: '#4b5563' }}>
                Hitta rätt hantverkare för ditt projekt – eller hitta ditt nästa uppdrag. Enkelt, snabbt och utan mellanhänder.
              </p>

              {/* Dual CTA */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
                <div
                  className="flex-1 max-w-xs mx-auto sm:mx-0 p-6 text-left bg-white shadow-md"
                  style={{ borderRadius: "var(--border-radius)" }}
                >
                  <div className="text-2xl mb-2" aria-hidden="true">🏠</div>
                  <h2 className="font-bold text-base mb-1" style={{ color: "var(--primary-blue)" }}>
                    Jag är husägare
                  </h2>
                  <p className="text-xs mb-4" style={{ color: '#4b5563' }}>
                    Beskriv ditt jobb eller använd vår 3D-kalkylator för ett exakt pris.
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setView("homeowner-wizard")}
                      className="w-full py-2 text-white text-sm font-semibold transition hover:opacity-90"
                      style={{ backgroundColor: "var(--primary-blue)", borderRadius: "var(--border-radius)" }}
                    >
                      Starta ett projekt →
                    </button>
                    <button
                      onClick={dismissLanding}
                      className="w-full py-2 text-sm font-semibold border transition hover:opacity-80"
                      style={{
                        borderColor: "var(--primary-blue)",
                        color: "var(--primary-blue)",
                        borderRadius: "var(--border-radius)",
                        backgroundColor: "transparent",
                      }}
                    >
                      3D-kalkylator →
                    </button>
                  </div>
                </div>

                <div
                  className="flex-1 max-w-xs mx-auto sm:mx-0 p-6 text-left bg-white shadow-md"
                  style={{ borderRadius: "var(--border-radius)" }}
                >
                  <div className="text-2xl mb-2" aria-hidden="true">🔨</div>
                  <h2 className="font-bold text-base mb-1" style={{ color: "var(--primary-blue)" }}>
                    Jag är hantverkare
                  </h2>
                  <p className="text-xs mb-4" style={{ color: '#4b5563' }}>
                    Bläddra bland öppna jobb från husägare i din bransch och ta kontakt direkt.
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => { setProCategory("all"); setProRegion("all"); setView("pro-directory"); }}
                      className="w-full py-2 text-white text-sm font-semibold transition hover:opacity-90"
                      style={{ backgroundColor: "var(--accent-red)", borderRadius: "var(--border-radius)" }}
                    >
                      Bläddra bland proffs →
                    </button>
                    <button
                      onClick={() => setView("company")}
                      className="w-full py-2 text-sm font-semibold border transition hover:opacity-80"
                      style={{ borderColor: "var(--accent-red)", color: "var(--accent-red)", borderRadius: "var(--border-radius)", backgroundColor: "transparent" }}
                    >
                      Logga in / Registrera →
                    </button>
                  </div>
                </div>
              </div>

              {/* Feature chips */}
              <div className="flex flex-wrap justify-center gap-3">
                {["Interaktiv 3D-modell", "Öppna jobbförfrågningar", "Direkt kontakt"].map((f) => (
                  <span
                    key={f}
                    className="px-4 py-1.5 text-sm font-medium border rounded-full"
                    style={{ borderColor: "#d1d5db", color: "var(--text-main)" }}
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
        </div>
      </main>
      )}

      {/* ── Main app (only rendered after landing is dismissed) ── */}
      {!landingMounted && (
        <main id="main-content">
          {/* Hero */}
          <section
            className="py-10 sm:py-16 text-center"
            style={{ backgroundColor: "var(--bg-light-grey)" }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <h1
                className="text-2xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4"
                style={{ color: "var(--primary-blue)" }}
              >
                Skapa Din Offert
              </h1>
              <div
                className="w-16 sm:w-24 h-[3px] mx-auto mb-4 sm:mb-6"
                style={{ backgroundColor: "var(--accent-red)" }}
              />
              <p
                className="text-sm sm:text-lg max-w-2xl mx-auto mb-4"
                style={{ color: '#4b5563' }}
              >
                Välj husform, klicka på en byggdel och få en skräddarsydd offert direkt.
              </p>
              <button
                onClick={() => setQuickPostOpen(true)}
                className="text-sm font-medium underline transition hover:opacity-70"
                style={{ color: "var(--primary-blue)" }}
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
                  <h2
                    className="text-xl sm:text-2xl font-bold mb-2"
                    style={{ color: "var(--primary-blue)" }}
                  >
                    Välkommen
                  </h2>
                  <div className="w-12 h-[3px] mb-3 sm:mb-4" style={{ backgroundColor: "var(--accent-red)" }} />
                  <p className="text-sm sm:text-base leading-relaxed" style={{ color: "#4b5563" }}>
                    Vi hjälper dig att räkna ut kostnaden för ditt byggprojekt. Välj en husform, klicka på den del du vill ha offert på, och fyll i formuläret.
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
                  style={{ backgroundColor: "var(--primary-blue)", borderRadius: "var(--border-radius)" }}
                >
                  Skapa Offert
                </button>
              </div>

              {/* Right Column — 3D Viewer */}
              <div className="lg:col-span-3" ref={offerRef}>
                <Suspense fallback={<div className="w-full h-[300px] sm:h-[500px] flex items-center justify-center text-gray-400 text-sm" style={{background:"#1a2030",borderRadius:"var(--border-radius)"}}>Laddar 3D-modell…</div>}>
                <ModelViewer
                  selectedPart={selectedPart}
                  onSelectPart={(part) => {
                    setSelectedPart(part);
                    setOfferFormOpen(false);
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

          {/* ── Side panel area ── */}
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

          {/* Compact Footer */}
          <footer className="border-t border-gray-200" style={{ padding: "12px 24px" }}>
            <div
              className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
              style={{ color: '#4b5563' }}
            >
              <span>&copy; 2026 Offer For You. Alla rättigheter förbehållna.</span>
              <span>info@offerforyou.se · 070-123 45 67</span>
            </div>
          </footer>
        </main>
      )}

      {/* Cost summary bar (always present when selections exist) */}
      {!offerFormOpen && (
        <CostSummary
          selections={selections}
          total={runningTotal}
          onOpenOfferForm={handleOpenOfferForm}
        />
      )}
    </div>
  );
}

function ContactItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5" style={{ color: "var(--primary-blue)" }}>
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
}

function MapPinIcon() {
  return (
    <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

export default App;
