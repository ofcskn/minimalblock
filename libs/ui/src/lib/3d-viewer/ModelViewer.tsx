import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import type { Hotspot } from '@minimalblock/core';

export type { Hotspot };

export interface ModelViewerHandle {
  resetCamera(): void;
}

export interface ModelViewerProps {
  modelUrl: string;
  className?: string;
  autoRotate?: boolean;
  hotspots?: Hotspot[];
  editMode?: boolean;
  failedQa?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  onArOpen?: () => void;
  onRotate?: () => void;
  onSessionEnd?: (durationMs: number) => void;
  onHotspotClick?: (id: string) => void;
  onHotspotAdd?: (position: string, normal: string) => void;
}

type ModelViewerElement = HTMLElement & {
  src?: string;
  resetTurntableRotation?: () => void;
  jumpCameraToGoal?: () => void;
  positionAndNormalFromPoint?: (x: number, y: number) => { position: { x: number; y: number; z: number }; normal: { x: number; y: number; z: number } } | null;
};

type LoadState = 'loading' | 'ready' | 'error';

export const ModelViewer = forwardRef<ModelViewerHandle, ModelViewerProps>(function ModelViewer(
  {
    modelUrl,
    className = '',
    autoRotate = true,
    hotspots = [],
    editMode = false,
    failedQa = false,
    onLoad,
    onError,
    onArOpen,
    onRotate,
    onSessionEnd,
    onHotspotClick,
    onHotspotAdd,
  },
  ref,
) {
  const elRef = useRef<ModelViewerElement>(null);
  const sessionStart = useRef<number>(0);
  const onSessionEndRef = useRef(onSessionEnd);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  useEffect(() => { onSessionEndRef.current = onSessionEnd; }, [onSessionEnd]);

  // Reset load state whenever the URL changes so the spinner shows again.
  useEffect(() => {
    setLoadState('loading');
    const el = elRef.current;
    if (el) el.src = modelUrl;
  }, [modelUrl]);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const handleLoad = () => {
      sessionStart.current = Date.now();
      setLoadState('ready');
      onLoad?.();
    };
    const handleError = () => {
      setLoadState('error');
      onError?.();
    };
    const handleArStatus = (e: Event) => {
      const status = (e as CustomEvent).detail?.status;
      if (status === 'session-started') onArOpen?.();
    };
    const handleCameraChange = () => onRotate?.();

    el.addEventListener('load', handleLoad);
    el.addEventListener('error', handleError);
    el.addEventListener('ar-status', handleArStatus);
    el.addEventListener('camera-change', handleCameraChange);

    return () => {
      el.removeEventListener('load', handleLoad);
      el.removeEventListener('error', handleError);
      el.removeEventListener('ar-status', handleArStatus);
      el.removeEventListener('camera-change', handleCameraChange);
    };
  }, [onLoad, onError, onArOpen, onRotate]);

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

  useImperativeHandle(ref, () => ({
    resetCamera() {
      const el = elRef.current;
      el?.resetTurntableRotation?.();
      el?.jumpCameraToGoal?.();
    },
  }));

  function handleClick(e: React.MouseEvent<HTMLElement>) {
    if (!editMode || !onHotspotAdd) return;
    const el = elRef.current;
    if (!el?.positionAndNormalFromPoint) return;
    const hit = el.positionAndNormalFromPoint(e.clientX, e.clientY);
    if (!hit) return;
    const { position: p, normal: n } = hit;
    onHotspotAdd(
      `${p.x.toFixed(4)} ${p.y.toFixed(4)} ${p.z.toFixed(4)}`,
      `${n.x.toFixed(4)} ${n.y.toFixed(4)} ${n.z.toFixed(4)}`,
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* @ts-expect-error — model-viewer is a custom element registered by the CDN script */}
      <model-viewer
        ref={elRef}
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

      {/* E.5 — Loading overlay */}
      {loadState === 'loading' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(249,250,251,0.85)', gap: '12px',
        }}>
          <svg style={{ width: 32, height: 32, animation: 'spin 1s linear infinite', color: '#6366f1' }} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>Loading 3D model…</span>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* E.6 — Failed-load overlay */}
      {loadState === 'error' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,241,242,0.95)', gap: '10px',
        }}>
          <svg style={{ width: 40, height: 40, color: '#dc2626' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#991b1b' }}>Failed to load 3D model</p>
          <p style={{ fontSize: '12px', color: '#b91c1c', textAlign: 'center', maxWidth: '220px' }}>
            The GLB file could not be rendered. Try uploading a different model or use the manual fallback.
          </p>
        </div>
      )}

      {/* E.8 — Model-ready badge (fades after 3 s) */}
      {loadState === 'ready' && !failedQa && (
        <ModelReadyBadge />
      )}

      {/* E.9 — Model-failed-QA overlay badge */}
      {loadState === 'ready' && failedQa && (
        <div style={{
          position: 'absolute', top: 10, left: 10,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(220,38,38,0.92)', color: 'white',
          borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 600,
        }}>
          <span>⚠</span> Visual QA Failed — publishing blocked
        </div>
      )}
    </div>
  );
});

function ModelReadyBadge() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(t);
  }, []);
  if (!visible) return null;
  return (
    <div style={{
      position: 'absolute', top: 10, left: 10,
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'rgba(5,150,105,0.9)', color: 'white',
      borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 600,
      transition: 'opacity 0.4s',
    }}>
      <span>✓</span> Model ready
    </div>
  );
}

export function ModelViewerPlaceholder({ className = '', message }: { className?: string; message?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl bg-gray-100 text-gray-400 ${className}`}>
      <svg className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
      <span className="text-sm">{message ?? 'No 3D model yet'}</span>
    </div>
  );
}
