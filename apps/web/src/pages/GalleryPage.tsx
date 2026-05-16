import { useNavigate } from 'react-router-dom';
import { useGallery } from '@minimalblock/features';
import { ModelViewer, ModelViewerPlaceholder, StatusBadge, Button, Spinner, Card } from '@minimalblock/ui';
import { useApp } from '../context/AppContext.js';
import type { SupabaseUser } from '../types.js';

interface GalleryPageProps {
  user: SupabaseUser;
}

export function GalleryPage({ user }: GalleryPageProps) {
  const { conversionRepo } = useApp();
  const { conversions, loading, error, remove } = useGallery(conversionRepo, user.id);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" label="Loading gallery…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
    );
  }

  if (conversions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 rounded-full bg-indigo-50 p-6">
          <svg className="h-10 w-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">No 3D models yet</h2>
        <p className="mt-2 text-sm text-gray-500">Upload a product photo to generate your first 3D model.</p>
        <Button className="mt-6" onClick={() => navigate('/upload')}>Upload product photo</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My 3D Models</h1>
        <Button onClick={() => navigate('/upload')}>+ New conversion</Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {conversions.map(conversion => (
          <Card key={conversion.id} className="overflow-hidden p-0">
            <div className="h-56 bg-gray-100">
              {conversion.status.isCompleted() && conversion.outputAsset ? (
                <ModelViewer modelUrl={conversion.outputAsset.url} className="h-full" />
              ) : (
                <ModelViewerPlaceholder className="h-full" />
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <p className="truncate text-sm font-medium text-gray-900">
                  {conversion.sourceAsset.storageKey.split('/').pop() ?? 'Product'}
                </p>
                <StatusBadge status={conversion.status.value} />
              </div>
              {conversion.status.isFailed() && conversion.errorMessage && (
                <p className="mt-1 text-xs text-red-600">{conversion.errorMessage}</p>
              )}
              <div className="mt-3 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(conversion.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
