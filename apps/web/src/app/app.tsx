import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '@minimalblock/features';
import { AppShell, Spinner } from '@minimalblock/ui';
import { AuthPage } from '../pages/AuthPage.js';
import { GalleryPage } from '../pages/GalleryPage.js';
import { UploadPage } from '../pages/UploadPage.js';
import { ProductDetailPage } from '../pages/ProductDetailPage.js';
import { EmbedPage } from '../pages/EmbedPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { PublicProductPage } from '../pages/PublicProductPage.js';
import { ErrorBoundary } from '../components/ErrorBoundary.js';
import { AppProvider, useApp } from '../context/AppContext.js';

function Header({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <span className="text-lg font-bold tracking-tight text-gray-900">Minimal Block</span>
      <div className="flex items-center gap-4">
        <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">Dashboard</a>
        <button onClick={onSignOut} className="text-sm text-gray-500 hover:text-gray-700">Sign out</button>
      </div>
    </div>
  );
}

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
    <AppShell header={<Header onSignOut={signOut} />}>
      <Routes>
        <Route path="/" element={<GalleryPage user={user} />} />
        <Route path="/upload" element={<UploadPage user={user} />} />
        <Route path="/product/:id" element={<ProductDetailPage user={user} />} />
        <Route path="/dashboard" element={<DashboardPage user={user} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public routes — no auth required */}
        <Route path="/embed" element={<EmbedPage />} />
        <Route path="/p/:idOrSlug" element={<PublicProductPage />} />

        {/* Authenticated app shell */}
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
