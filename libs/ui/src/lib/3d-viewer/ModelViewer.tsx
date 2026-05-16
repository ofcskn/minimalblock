import { useRef, useEffect } from 'react';
import type { Hotspot } from '@minimalblock/core';

export type { Hotspot };

export interface ModelViewerProps {
  modelUrl: string;
  className?: string;
  autoRotate?: boolean;
  hotspots?: Hotspot[];
  editMode?: boolean;
  onLoad?: () => void;
  onArOpen?: () => void;
  onRotate?: () => void;
  onSessionEnd?: (durationMs: number) => void;
  onHotspotClick?: (id: string) => void;
  onHotspotAdd?: (position: string, normal: string) => void;
}

type ModelViewerElement = HTMLElement & {
  src?: string;
  positionAndNormalFromPoint?: (x: number, y: number) => { position: { x: number; y: number; z: number }; normal: { x: number; y: number; z: number } } | null;
};

/**
 * Wrapper around <model-viewer> with AR support, hotspot rendering, and session timing.
 * Requires the model-viewer CDN script in index.html.
 */
export function ModelViewer({
  modelUrl,
  className = '',
  autoRotate = true,
  hotspots = [],
  editMode = false,
  onLoad,
  onArOpen,
  onRotate,
  onSessionEnd,
  onHotspotClick,
  onHotspotAdd,
}: ModelViewerProps) {
  const ref = useRef<ModelViewerElement>(null);
  const sessionStart = useRef<number>(0);
  const onSessionEndRef = useRef(onSessionEnd);

  useEffect(() => {
    onSessionEndRef.current = onSessionEnd;
  }, [onSessionEnd]);

  useEffect(() => {
    const el = ref.current;
    if (el) el.src = modelUrl;
  }, [modelUrl]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleLoad = () => {
      sessionStart.current = Date.now();
      onLoad?.();
    };
    const handleArStatus = (e: Event) => {
      const status = (e as CustomEvent).detail?.status;
      if (status === 'session-started') onArOpen?.();
    };
    const handleCameraChange = () => onRotate?.();

    el.addEventListener('load', handleLoad);
    el.addEventListener('ar-status', handleArStatus);
    el.addEventListener('camera-change', handleCameraChange);

    return () => {
      el.removeEventListener('load', handleLoad);
      el.removeEventListener('ar-status', handleArStatus);
      el.removeEventListener('camera-change', handleCameraChange);
    };
  }, [onLoad, onArOpen, onRotate]);

  // Report session duration when the component unmounts or the page unloads.
  useEffect(() => {
    const report = () => {
      if (sessionStart.current === 0) return;
      const ms = Date.now() - sessionStart.current;
      if (ms > 500) onSessionEndRef.current?.(ms);
    };
    window.addEventListener('beforeunload', report);
    return () => {
      report();
      window.removeEventListener('beforeunload', report);
    };
  }, []);

  function handleClick(e: React.MouseEvent<HTMLElement>) {
    if (!editMode || !onHotspotAdd) return;
    const el = ref.current;
    if (!el?.positionAndNormalFromPoint) return;
    const hit = el.positionAndNormalFromPoint(e.clientX, e.clientY);
    if (!hit) return;
    const { position: p, normal: n } = hit;
    onHotspotAdd(
      `${p.x.toFixed(4)} ${p.y.toFixed(4)} ${p.z.toFixed(4)}`,
      `${n.x.toFixed(4)} ${n.y.toFixed(4)} ${n.z.toFixed(4)}`
    );
  }

  return (
    // @ts-expect-error — model-viewer is a custom element registered by the CDN script
    <model-viewer
      ref={ref}
      src={modelUrl}
      camera-controls
      auto-rotate={autoRotate ? '' : undefined}
      shadow-intensity="1"
      ar
      ar-modes="webxr scene-viewer"
      ar-scale="auto"
      style={{ width: '100%', height: '100%', cursor: editMode ? 'crosshair' : 'grab' }}
      class={className}
      onClick={handleClick}
    >
      {hotspots.filter((hs) => hs.position && hs.normal).map((hs) => (
        <button
          key={hs.id}
          slot={`hotspot-${hs.id}`}
          data-position={hs.position}
          data-normal={hs.normal}
          onClick={(e) => { e.stopPropagation(); onHotspotClick?.(hs.id); }}
          style={{
            display: 'block',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: '2px solid white',
            backgroundColor: 'rgba(79,70,229,0.9)',
            cursor: 'pointer',
            position: 'relative',
          }}
          title={hs.label}
        >
          <span style={{
            position: 'absolute',
            left: '50%',
            bottom: '28px',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.75)',
            color: 'white',
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}>
            {hs.label}
          </span>
        </button>
      ))}
    {/* @ts-expect-error custom element closing tag for model-viewer */}
    </model-viewer>
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
