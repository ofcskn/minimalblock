import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSupabaseClient, SupabaseProductRepository, SupabaseConversionRepository, SupabaseEmbedViewsRepository } from '@minimalblock/data';
import type { Product } from '@minimalblock/core';
import type { Conversion } from '@minimalblock/core';
import { ModelViewer, ModelViewerPlaceholder, Spinner, QrCode } from '@minimalblock/ui';

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
      const completed = convs.find(c => c.status.isViewable() && !!c.outputAsset) ?? convs[0] ?? null;
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
        <p className="text-lg font-semibold text-gray-900">Product not available</p>
        <p className="text-sm text-gray-500">This product preview is not available. It may not have been published yet.</p>
      </div>
    );
  }

  const publicUrl = window.location.href;
  const isApproved = conversion?.status.value === 'approved';
  const hasGlb = isApproved && !!conversion?.outputAsset;

  if (!isApproved && !conversion) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-6">
        <p className="text-lg font-semibold text-gray-900">Product not available</p>
        <p className="text-sm text-gray-500">This product is not yet available for public preview.</p>
      </div>
    );
  }

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
        </div>
      </div>

      {/* QR code panel */}
      {qrOpen && (
        <div className="bg-white border-b border-gray-100 px-6 py-5 flex flex-col items-center gap-3">
          <p className="text-sm text-gray-500">Scan to open on any device</p>
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

      {/* Trust badge */}
      {isApproved && (
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-emerald-700">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            Accuracy verified · AI quality-checked product experience
          </span>
        </div>
      )}

      {/* Info section */}
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-5">
        {product.description && (
          <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
        )}

        {product.hotspots.filter(hs => hs.position && hs.normal).length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Product features</p>
            <div className="flex flex-wrap gap-2">
              {product.hotspots.filter(hs => hs.position && hs.normal).map(hs => (
                <span key={hs.id} className="rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs text-indigo-700">
                  {hs.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {hasGlb && conversion?.outputAsset && (
          <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-900">Interact with this product</p>
            <p className="mt-1 text-xs text-gray-500">Rotate the 3D model above to explore every angle. Tap hotspots to learn about features.</p>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Verified 3D product experience powered by{' '}
            <a href="https://minimalblock.app" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
              Minimal Block
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
