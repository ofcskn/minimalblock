import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '@minimalblock/features';
import { AppShell, Spinner } from '@minimalblock/ui';
import { AuthPage } from '../pages/AuthPage.js';
import { GalleryPage } from '../pages/GalleryPage.js';
import { UploadPage } from '../pages/UploadPage.js';
import { AppProvider, useApp } from '../context/AppContext.js';

function Header({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <span className="text-lg font-bold tracking-tight text-gray-900">Minimal Block</span>
      <button
        onClick={onSignOut}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Sign out
      </button>
    </div>
  );
}

function AppRoutes() {
  const { supabase } = useApp();
  const { user, loading, signOut } = useAuth(supabase);

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
    <AppShell
      header={<Header onSignOut={signOut} />}
    >
      <Routes>
        <Route path="/" element={<GalleryPage user={user} />} />
        <Route path="/upload" element={<UploadPage user={user} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;
