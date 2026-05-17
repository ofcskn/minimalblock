import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '@minimalblock/features';
import { Spinner } from '@minimalblock/ui';
import { AuthPage } from '../pages/AuthPage.js';
import { GalleryPage } from '../pages/GalleryPage.js';
import { UploadPage } from '../pages/UploadPage.js';
import { ProductDetailPage } from '../pages/ProductDetailPage.js';
import { PublicProductPage } from '../pages/PublicProductPage.js';
import { BrandPage } from '../pages/BrandPage.js';
import { ErrorBoundary } from '../components/ErrorBoundary.js';
import { AppProvider, useApp } from '../context/AppContext.js';
import { AppChrome } from './AppChrome.js';

function AppRoutes() {
  const { supabase } = useApp();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user, loading, signOut } = useAuth(supabase as any);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <AppChrome onSignOut={signOut}>
      <Routes>
        <Route path="/" element={<GalleryPage user={user} />} />
        <Route path="/upload" element={<UploadPage user={user} />} />
        <Route path="/product/:id" element={<ProductDetailPage user={user} />} />
        <Route path="/brand" element={<BrandPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppChrome>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/p/:idOrSlug" element={<PublicProductPage />} />
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
  );
}

export default App;
