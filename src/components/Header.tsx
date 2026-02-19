interface HeaderProps {
  onCreateOffer: () => void;
}

export function Header({ onCreateOffer }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
        {/* Logo */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-lg sm:text-2xl font-extrabold tracking-tight" style={{ color: 'var(--primary-blue)' }}>
            Offer
          </span>
          <span className="text-lg sm:text-2xl font-extrabold tracking-tight" style={{ color: 'var(--accent-red)' }}>
            ForYou
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#products" className="text-sm font-semibold hover:opacity-70 transition" style={{ color: 'var(--text-main)' }}>
            Produkter
          </a>
          <a href="#price-list" className="text-sm font-semibold hover:opacity-70 transition" style={{ color: 'var(--text-main)' }}>
            Prislista
          </a>
          <a href="#services" className="text-sm font-semibold hover:opacity-70 transition" style={{ color: 'var(--text-main)' }}>
            Tjänster
          </a>
          <a href="#contact" className="text-sm font-semibold hover:opacity-70 transition" style={{ color: 'var(--text-main)' }}>
            Kontakt
          </a>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4">
          <a href="tel:+46701234567" className="hidden lg:flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-main)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            070-123 45 67
          </a>
          <button
            onClick={onCreateOffer}
            className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: 'var(--primary-blue)', borderRadius: 'var(--border-radius)' }}
          >
            Skapa Offert
          </button>
        </div>
      </div>
    </header>
  );
}
