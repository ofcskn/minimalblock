import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Conversion } from '@minimalblock/core';
import { ModelViewer, ModelViewerPlaceholder, StatusBadge, Button, Spinner, Card } from '@minimalblock/ui';
import { useApp } from '../context/AppContext.js';
import type { SupabaseUser } from '../types.js';

interface ProductDetailPageProps {
  user: SupabaseUser;
}

async function downloadGlb(url: string, filename: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Download failed');
  const blob = await response.blob();
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

export function ProductDetailPage({ user }: ProductDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { conversionRepo } = useApp();

  const [conversion, setConversion] = useState<Conversion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    conversionRepo.findById(id).then(found => {
      if (!found || !found.isAccessibleBy(user.id)) {
        setError('Model not found');
      } else {
        setConversion(found);
      }
      setLoading(false);
    }).catch(err => {
      setError(err instanceof Error ? err.message : 'Failed to load');
      setLoading(false);
    });
  }, [id, conversionRepo, user.id]);

  async function handleDownload() {
    if (!conversion?.outputAsset) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const filename = conversion.outputAsset.storageKey.split('/').pop() ?? 'model.glb';
      await downloadGlb(conversion.outputAsset.url, filename);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" label="Loading model…" />
      </div>
    );
  }

  if (error || !conversion) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error ?? 'Model not found'}</div>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/')}>Back to gallery</Button>
      </div>
    );
  }

  const filename = conversion.sourceAsset.storageKey.split('/').pop() ?? 'Product';
  const createdAt = conversion.createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-700">← Gallery</button>
        <h1 className="text-2xl font-bold text-gray-900 truncate">{filename}</h1>
        <StatusBadge status={conversion.status.value} />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="h-96 bg-gray-100">
          {conversion.status.isCompleted() && conversion.outputAsset ? (
            <ModelViewer modelUrl={conversion.outputAsset.url} className="h-full" />
          ) : (
            <ModelViewerPlaceholder className="h-full" />
          )}
        </div>
      </Card>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <img
              src={conversion.sourceAsset.url}
              alt="Source image"
              className="h-16 w-16 rounded-lg object-cover border border-gray-200"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">{filename}</p>
              <p className="text-xs text-gray-500">Uploaded {createdAt}</p>
              <p className="text-xs text-gray-400">{(conversion.sourceAsset.sizeBytes / 1024).toFixed(1)} KB · {conversion.sourceAsset.mimeType}</p>
            </div>
          </div>

          {conversion.status.isFailed() && conversion.errorMessage && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{conversion.errorMessage}</div>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          {conversion.status.isCompleted() && conversion.outputAsset && (
            <>
              <Button onClick={handleDownload} loading={downloading}>
                Download GLB
              </Button>
              {downloadError && <p className="text-xs text-red-600">{downloadError}</p>}
              <p className="text-xs text-gray-400">
                {(conversion.outputAsset.sizeBytes / 1024).toFixed(1)} KB
              </p>
            </>
          )}
          {conversion.status.isPending() || conversion.status.isProcessing() ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Spinner size="sm" />
              Generating 3D model…
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
