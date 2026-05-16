import { useSearchParams } from 'react-router-dom';
import { ModelViewer, ModelViewerPlaceholder } from '@minimalblock/ui';

/**
 * Stripped viewer for embedding in external pages.
 * Reads ?model=<glb-url>&name=<product-name> from the query string.
 * The GLB URL is public (Supabase Storage public bucket), so no auth required.
 */
export function EmbedPage() {
  const [params] = useSearchParams();
  const modelUrl = params.get('model');
  const name = params.get('name') ?? '3D Model';

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
