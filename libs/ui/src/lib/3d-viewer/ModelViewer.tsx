import { useRef, useEffect } from 'react';

export interface ModelViewerProps {
  modelUrl: string;
  className?: string;
  autoRotate?: boolean;
}

/**
 * Lightweight wrapper around the <model-viewer> web component (Google).
 * Add `@google/model-viewer` to the app's index.html via CDN or npm import.
 */
export function ModelViewer({ modelUrl, className = '', autoRotate = true }: ModelViewerProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current as HTMLElement & { src?: string; 'auto-rotate'?: string } | null;
    if (el) {
      el.src = modelUrl;
    }
  }, [modelUrl]);

  return (
    // @ts-expect-error — model-viewer is a custom element registered by the CDN script
    <model-viewer
      ref={ref}
      src={modelUrl}
      camera-controls
      auto-rotate={autoRotate ? '' : undefined}
      shadow-intensity="1"
      style={{ width: '100%', height: '100%' }}
      class={className}
    />
  );
}

export function ModelViewerPlaceholder({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl bg-gray-100 text-gray-400 ${className}`}>
      <svg className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
      <span className="text-sm">No 3D model yet</span>
    </div>
  );
}
