import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSupabaseClient, SupabaseProductRepository, SupabaseConversionRepository, SupabaseEmbedViewsRepository } from '@minimalblock/data';
import type { Product } from '@minimalblock/core';
import type { Conversion } from '@minimalblock/core';
import { ModelViewer, ModelViewerPlaceholder, StatusBadge, Spinner, QrCode } from '@minimalblock/ui';

function getAnonClient() {
  const url = import.meta.env['VITE_SUPABASE_URL'] as string;
  const key = import.meta.env['VITE_SUPABASE_ANON_KEY'] as string;
  return getSupabaseClient(url, key);
}

function setOgMeta(title: string, description: string) {
  document.title = `${title} — Minimal Block`;
  const set = (prop: string, content: string) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[property="${prop}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
    el.setAttribute('content', content);
  };
  set('og:title', title);
  set('og:description', description || 'Interactive 3D model viewer');
  set('og:type', 'website');
  set('og:url', window.location.href);
}

export function PublicProductPage() {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [conversion, setConversion] = useState<Conversion | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(() => {
    if (!idOrSlug) return;

    const supabase = getAnonClient();
    const productRepo = new SupabaseProductRepository(supabase);
    const conversionRepo = new SupabaseConversionRepository(supabase);
    const embedViewsRepo = new SupabaseEmbedViewsRepository(supabase);

    productRepo.findBySlugOrId(idOrSlug).then(async prod => {
      if (!prod) { setNotFound(true); setLoading(false); return; }
      setProduct(prod);
      setOgMeta(prod.name, prod.description);

      const convs = await conversionRepo.findByProductId(prod.id);
      const completed = convs.find(c => c.status.isCompleted() && !!c.outputAsset) ?? convs[0] ?? null;
      setConversion(completed ?? null);
      setLoading(false);

      embedViewsRepo.track(prod.id, document.referrer || null).catch(() => null);
    }).catch(() => { setNotFound(true); setLoading(false); });
  }, [idOrSlug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-6">
        <p className="text-lg font-semibold text-gray-900">Product not found</p>
        <p className="text-sm text-gray-500">This product may have been deleted or the link is incorrect.</p>
        <a href="/" className="text-sm text-indigo-600 hover:underline">Go to Minimal Block</a>
      </div>
    );
  }

  const publicUrl = window.location.href;
  const hasGlb = conversion?.status.isCompleted() && !!conversion.outputAsset;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">{product.name}</h1>
          {product.category && (
            <p className="text-xs text-gray-400 capitalize mt-0.5">{product.category}</p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setQrOpen(q => !q)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            title="Show QR code"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="3" height="3" />
              <rect x="18" y="18" width="3" height="3" />
            </svg>
            QR
          </button>
          <a href="https://minimalblock.app" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-gray-600">
            Minimal Block
          </a>
        </div>
      </div>

      {/* QR code panel */}
      {qrOpen && (
        <div className="bg-white border-b border-gray-100 px-6 py-5 flex flex-col items-center gap-3">
          <p className="text-sm text-gray-500">Scan to open on mobile / AR</p>
          <QrCode value={publicUrl} size={180} />
          <p className="text-xs text-gray-400 break-all max-w-sm text-center">{publicUrl}</p>
        </div>
      )}

      {/* 3D Viewer */}
      <div className="h-[60vh] bg-gray-100">
        {hasGlb ? (
          <ModelViewer
            modelUrl={conversion!.outputAsset!.url}
            className="h-full w-full"
            hotspots={product.hotspots}
            autoRotate
          />
        ) : (
          <ModelViewerPlaceholder className="h-full" />
        )}
      </div>

      {/* Info section */}
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-4">
        {conversion && (
          <div className="flex items-center gap-2">
            <StatusBadge status={conversion.status.value} />
            {hasGlb && conversion.outputAsset && (
              <span className="text-xs text-gray-400">
                {(conversion.outputAsset.sizeBytes / 1024).toFixed(1)} KB GLB · AR enabled
              </span>
            )}
          </div>
        )}

        {product.description && (
          <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
        )}

        {product.hotspots.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Annotations</p>
            <div className="flex flex-wrap gap-2">
              {product.hotspots.map(hs => (
                <span key={hs.id} className="rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs text-indigo-700">
                  {hs.label}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            3D model powered by{' '}
            <a href="https://minimalblock.app" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
              Minimal Block
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
