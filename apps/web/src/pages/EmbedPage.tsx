import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getSupabaseClient, SupabaseEmbedViewsRepository } from '@minimalblock/data';
import { ModelViewer, ModelViewerPlaceholder } from '@minimalblock/ui';

function trackEmbedView(productId: string | null) {
  if (!productId) return;
  const url = import.meta.env['VITE_SUPABASE_URL'] as string;
  const key = import.meta.env['VITE_SUPABASE_ANON_KEY'] as string;
  if (!url || !key) return;
  const repo = new SupabaseEmbedViewsRepository(getSupabaseClient(url, key));
  repo.track(productId, document.referrer || null).catch(() => null);
}

/**
 * Stripped viewer for embedding in external pages.
 * Reads ?model=<glb-url>&name=<product-name>&pid=<product-id> from the query string.
 * Tracks embed views with referrer domain for analytics.
 */
export function EmbedPage() {
  const [params] = useSearchParams();
  const modelUrl = params.get('model');
  const name = params.get('name') ?? '3D Model';
  const productId = params.get('pid');

  useEffect(() => {
    trackEmbedView(productId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!modelUrl) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <ModelViewerPlaceholder className="w-full h-full" />
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ModelViewer modelUrl={modelUrl} autoRotate />
      </div>
      <div style={{ padding: '8px 16px', background: 'white', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>{name}</span>
        <a
          href="https://minimalblock.app"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '11px', color: '#6b7280', textDecoration: 'none' }}
        >
          Powered by Minimal Block
        </a>
      </div>
    </div>
  );
}
