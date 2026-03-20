import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const LandingPage = lazy(() =>
  import('./pages/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const ConfiguratorPage = lazy(() =>
  import('./pages/ConfiguratorPage').then((m) => ({ default: m.ConfiguratorPage }))
);
const CompanyPage = lazy(() =>
  import('./pages/CompanyPage').then((m) => ({ default: m.CompanyPage }))
);
const ProDirectoryPage = lazy(() =>
  import('./pages/ProDirectoryPage').then((m) => ({ default: m.ProDirectoryPage }))
);
const HomeownerWizardPage = lazy(() =>
  import('./pages/HomeownerWizardPage').then((m) => ({ default: m.HomeownerWizardPage }))
);

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<div />}>
            <LandingPage />
          </Suspense>
        }
      />
      <Route
        path="/configurator"
        element={
          <Suspense fallback={<div />}>
            <ConfiguratorPage />
          </Suspense>
        }
      />
      <Route
        path="/wizard"
        element={
          <Suspense fallback={<div />}>
            <HomeownerWizardPage />
          </Suspense>
        }
      />
      <Route
        path="/professionals"
        element={
          <Suspense fallback={<div />}>
            <ProDirectoryPage />
          </Suspense>
        }
      />
      <Route
        path="/company"
        element={
          <Suspense fallback={<div />}>
            <CompanyPage />
          </Suspense>
        }
      />
    </Routes>
  </BrowserRouter>
);

export default App;
