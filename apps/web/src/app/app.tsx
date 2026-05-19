import { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@minimalblock/features';
import { Spinner } from '@minimalblock/ui';
import { ErrorBoundary } from '../components/ErrorBoundary.js';
import { AppProvider, useApp } from '../context/AppContext.js';
import { AppChrome } from './AppChrome.js';

const AuthPage = lazy(() => import('../pages/AuthPage.js').then((m) => ({ default: m.AuthPage })));
const GalleryPage = lazy(() => import('../pages/GalleryPage.js').then((m) => ({ default: m.GalleryPage })));
const UploadPage = lazy(() => import('../pages/UploadPage.js').then((m) => ({ default: m.UploadPage })));
const ProductDetailPage = lazy(() =>
  import('../pages/ProductDetailPage.js').then((m) => ({ default: m.ProductDetailPage }))
);
const PublicProductPage = lazy(() =>
  import('../pages/PublicProductPage.js').then((m) => ({ default: m.PublicProductPage }))
);
const BrandPage = lazy(() => import('../pages/BrandPage.js').then((m) => ({ default: m.BrandPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
    },
  },
});

const PageFallback = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Spinner size="lg" />
  </div>
);

function AppRoutes() {
  const { supabase } = useApp();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user, loading, signOut } = useAuth(supabase as any);

  if (loading) {
    return <PageFallback />;
  }

  if (!user) {
    return (
      <Suspense fallback={<PageFallback />}>
        <AuthPage />
      </Suspense>
    );
  }

  return (
    <AppChrome onSignOut={signOut}>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<GalleryPage user={user} />} />
          <Route path="/upload" element={<UploadPage user={user} />} />
          <Route path="/product/:id" element={<ProductDetailPage user={user} />} />
          <Route path="/brand" element={<BrandPage user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppChrome>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Routes>
          <Route
            path="/p/:idOrSlug"
            element={
              <Suspense fallback={<PageFallback />}>
                <PublicProductPage />
              </Suspense>
            }
          />
          <Route
            path="/*"
            element={
              <AppProvider>
                <AppRoutes />
              </AppProvider>
            }
          />
        </Routes>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
