import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { CompanyAuth } from '../components/CompanyAuth';

const CompanyDashboard = lazy(() =>
  import('../components/CompanyDashboard').then((m) => ({ default: m.CompanyDashboard }))
);

export const CompanyPage = () => {
  const navigate = useNavigate();
  const { token, companyName, login, logout } = useAuthStore();

  const handleAuth = (newToken: string, name: string) => {
    login(newToken, name);
  };

  const handleLogout = () => {
    logout();
  };

  const handleBack = () => {
    navigate('/');
  };

  if (!token) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-white)' }}>
        <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
            <button
              onClick={handleBack}
              className="text-sm font-medium hover:opacity-70 transition"
              style={{ color: 'var(--primary-blue)' }}
            >
              ← Tillbaka
            </button>
            <span className="text-gray-300">|</span>
            <span className="font-bold" style={{ color: 'var(--primary-blue)' }}>
              Företagspanel
            </span>
          </div>
        </div>
        <main>
          <CompanyAuth onAuth={handleAuth} />
        </main>
      </div>
    );
  }

  return (
    <main>
      <Suspense
        fallback={
          <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-white)' }} />
        }
      >
        <CompanyDashboard
          token={token}
          companyName={companyName}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      </Suspense>
    </main>
  );
};
