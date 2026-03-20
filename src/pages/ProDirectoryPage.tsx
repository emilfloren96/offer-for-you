import { Suspense, lazy } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ProDirectory = lazy(() =>
  import('../components/ProDirectory').then((m) => ({ default: m.ProDirectory }))
);

export const ProDirectoryPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const category = searchParams.get('category') ?? 'all';
  const region = searchParams.get('region') ?? 'all';

  return (
    <Suspense
      fallback={
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-white)' }} />
      }
    >
      <ProDirectory
        initialCategory={category}
        initialRegion={region}
        onBack={() => navigate('/')}
      />
    </Suspense>
  );
};
