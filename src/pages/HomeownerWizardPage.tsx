import { Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';

const HomeownerWizard = lazy(() =>
  import('../components/HomeownerWizard').then((m) => ({ default: m.HomeownerWizard }))
);

export const HomeownerWizardPage = () => {
  const navigate = useNavigate();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-white)' }} />
      }
    >
      <HomeownerWizard
        onBack={() => navigate('/')}
        onViewPros={(category, region) =>
          navigate(`/professionals?category=${category}&region=${region}`)
        }
      />
    </Suspense>
  );
};
