import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Conversion, generateId } from '@minimalblock/core';
import type { Hotspot, Product, AiInsight } from '@minimalblock/core';
import { ModelViewer, ModelViewerPlaceholder, StatusBadge, Button, Spinner, Card, Modal } from '@minimalblock/ui';
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

function buildEmbedSnippet(modelUrl: string, name: string): string {
  const iframeSrc = `${window.location.origin}/embed?model=${encodeURIComponent(modelUrl)}&name=${encodeURIComponent(name)}`;
  return `<iframe\n  src="${iframeSrc}"\n  style="width:100%;height:400px;border:none;border-radius:12px"\n  allowfullscreen\n  title="${name} — 3D preview"\n></iframe>`;
}

function buildModelViewerSnippet(modelUrl: string): string {
  return `<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"></script>\n<model-viewer\n  src="${modelUrl}"\n  camera-controls\n  auto-rotate\n  ar\n  ar-modes="webxr scene-viewer"\n  style="width:100%;height:400px;border-radius:12px"\n></model-viewer>`;
}

export function ProductDetailPage({ user }: ProductDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { conversionRepo, productRepo, riskAnalyzer, eventsRepo } = useApp();

  const [conversion, setConversion] = useState<Conversion | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Hotspot editor state
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [pendingHotspot, setPendingHotspot] = useState<{ position: string; normal: string } | null>(null);
  const [pendingLabel, setPendingLabel] = useState('');
  const [savingHotspots, setSavingHotspots] = useState(false);

  const lastRotateEvent = useRef(0);

  // Confidence Analysis state
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [analysingRisk, setAnalysingRisk] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Embed modal state
  const [embedOpen, setEmbedOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [embedType, setEmbedType] = useState<'iframe' | 'snippet'>('iframe');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    conversionRepo.findById(id).then(async (found) => {
      if (!found || !found.isAccessibleBy(user.id)) {
        setError('Model not found');
        setLoading(false);
        return;
      }
      setConversion(found);
      const prod = await productRepo.findById(found.productId);
      if (prod) {
        setProduct(prod);
        setHotspots(prod.hotspots);
        if (prod.aiInsights.length > 0) setInsights(prod.aiInsights);
      }
      setLoading(false);
    }).catch(err => {
      setError(err instanceof Error ? err.message : 'Failed to load');
      setLoading(false);
    });
  }, [id, conversionRepo, productRepo, user.id]);

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

  const handleHotspotAdd = useCallback((position: string, normal: string) => {
    setPendingHotspot({ position, normal });
    setPendingLabel('');
  }, []);

  function confirmHotspot() {
    if (!pendingHotspot || !pendingLabel.trim()) return;
    const newHs: Hotspot = {
      id: generateId(),
      label: pendingLabel.trim(),
      position: pendingHotspot.position,
      normal: pendingHotspot.normal,
    };
    setHotspots(prev => [...prev, newHs]);
    setPendingHotspot(null);
    setPendingLabel('');
  }

  function removeHotspot(hsId: string) {
    setHotspots(prev => prev.filter(h => h.id !== hsId));
  }

  async function saveHotspots() {
    if (!product) return;
    setSavingHotspots(true);
    try {
      const updated = product.withUpdatedHotspots(hotspots);
      const saved = await productRepo.save(updated);
      setProduct(saved);
      setEditMode(false);
    } finally {
      setSavingHotspots(false);
    }
  }

  function cancelEdit() {
    setHotspots(product?.hotspots ?? []);
    setPendingHotspot(null);
    setEditMode(false);
  }

  async function copySnippet(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (conversion) eventsRepo.track(conversion.productId, user.id, 'embed_copied').catch(() => null);
  }

  async function runAnalysis() {
    if (!product) return;
    setAnalysingRisk(true);
    setAnalysisError(null);
    try {
      const result = await riskAnalyzer.analyze({
        name: product.name,
        category: product.category,
        description: product.description,
        hotspotCount: hotspots.length,
      });
      setInsights(result);
      const updated = product.withAiInsights(result);
      const saved = await productRepo.save(updated);
      setProduct(saved);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalysingRisk(false);
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
  const productName = product?.name ?? filename;
  const createdAt = conversion.createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const modelUrl = conversion.outputAsset?.url ?? '';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-700">← Gallery</button>
        <h1 className="text-2xl font-bold text-gray-900 truncate">{productName}</h1>
        <StatusBadge status={conversion.status.value} />
      </div>

      {/* 3D Viewer */}
      <Card className="overflow-hidden p-0">
        <div className="h-96 bg-gray-100 relative">
          {conversion.status.isCompleted() && conversion.outputAsset ? (
            <>
              <ModelViewer
                modelUrl={conversion.outputAsset.url}
                className="h-full"
                hotspots={hotspots}
                editMode={editMode}
                onHotspotAdd={handleHotspotAdd}
                onLoad={() => eventsRepo.track(conversion.productId, user.id, 'viewer_loaded').catch(() => null)}
                onArOpen={() => eventsRepo.track(conversion.productId, user.id, 'ar_opened').catch(() => null)}
                onRotate={() => {
                  const now = Date.now();
                  if (now - lastRotateEvent.current < 10_000) return;
                  lastRotateEvent.current = now;
                  eventsRepo.track(conversion.productId, user.id, 'model_rotated').catch(() => null);
                }}
                onHotspotClick={() => eventsRepo.track(conversion.productId, user.id, 'hotspot_clicked').catch(() => null)}
              />
              {editMode && (
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between rounded-lg bg-indigo-600/90 px-3 py-2 text-white text-sm backdrop-blur-sm">
                  <span>Click anywhere on the model to place a hotspot</span>
                  <div className="flex gap-2">
                    <button onClick={cancelEdit} className="rounded px-2 py-1 text-xs bg-white/20 hover:bg-white/30">Cancel</button>
                    <button
                      onClick={saveHotspots}
                      disabled={savingHotspots}
                      className="rounded px-2 py-1 text-xs bg-white text-indigo-700 font-medium hover:bg-indigo-50 disabled:opacity-60"
                    >
                      {savingHotspots ? 'Saving…' : 'Save hotspots'}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <ModelViewerPlaceholder className="h-full" />
          )}
        </div>
      </Card>

      {/* Actions row */}
      {conversion.status.isCompleted() && conversion.outputAsset && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleDownload} loading={downloading}>
            Download GLB
          </Button>
          <Button variant="secondary" onClick={() => setEmbedOpen(true)}>
            Share / Embed
          </Button>
          {!editMode && (
            <Button variant="secondary" onClick={() => setEditMode(true)}>
              {hotspots.length > 0 ? `Edit Hotspots (${hotspots.length})` : 'Add Hotspots'}
            </Button>
          )}
          {downloadError && <p className="text-xs text-red-600 self-center">{downloadError}</p>}
        </div>
      )}

      {/* Hotspot label dialog */}
      <Modal
        open={!!pendingHotspot}
        onClose={() => setPendingHotspot(null)}
        title="Name this hotspot"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Enter a short label for this point on the model (e.g. "Seat material", "Width: 60cm").</p>
          <input
            type="text"
            autoFocus
            value={pendingLabel}
            onChange={e => setPendingLabel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') confirmHotspot(); }}
            placeholder="Hotspot label…"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPendingHotspot(null)}>Cancel</Button>
            <Button size="sm" onClick={confirmHotspot} disabled={!pendingLabel.trim()}>Add</Button>
          </div>
        </div>
      </Modal>

      {/* Hotspot list (edit mode) */}
      {editMode && hotspots.length > 0 && (
        <Card>
          <p className="text-sm font-medium text-gray-700 mb-3">Hotspots ({hotspots.length}/5)</p>
          <ul className="space-y-2">
            {hotspots.map(hs => (
              <li key={hs.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                <span className="text-gray-900">{hs.label}</span>
                <button onClick={() => removeHotspot(hs.id)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Info row */}
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

        {(conversion.status.isPending() || conversion.status.isProcessing()) && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Spinner size="sm" />
            Generating 3D model…
          </div>
        )}

        {conversion.status.isCompleted() && conversion.outputAsset && (
          <p className="text-xs text-gray-400 self-end">
            {(conversion.outputAsset.sizeBytes / 1024).toFixed(1)} KB GLB
          </p>
        )}
      </div>

      {/* Confidence Analysis card */}
      {conversion.status.isCompleted() && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Buyer Confidence Analysis</h2>
              <p className="text-xs text-gray-500 mt-0.5">AI-generated recommendations to reduce returns</p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={runAnalysis}
              loading={analysingRisk}
            >
              {insights.length > 0 ? 'Re-analyse' : 'Analyse'}
            </Button>
          </div>

          {analysisError && (
            <p className="text-xs text-red-600 mb-3">{analysisError}</p>
          )}

          {insights.length > 0 ? (
            <ul className="space-y-3">
              {insights.map((insight, i) => (
                <li key={i} className="rounded-lg bg-amber-50 border border-amber-100 p-3">
                  <p className="text-xs font-medium text-amber-800 mb-1">{insight.risk}</p>
                  <p className="text-xs text-amber-700">→ {insight.recommendation}</p>
                </li>
              ))}
            </ul>
          ) : !analysingRisk ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Click "Analyse" to get AI-powered recommendations for this product.
            </p>
          ) : null}
        </Card>
      )}

      {/* Embed modal */}
      <Modal open={embedOpen} onClose={() => { setEmbedOpen(false); setCopied(false); }} title="Share / Embed">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Paste one of these snippets into any webpage to show the interactive 3D viewer.
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setEmbedType('iframe')}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${embedType === 'iframe' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              iframe
            </button>
            <button
              onClick={() => setEmbedType('snippet')}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${embedType === 'snippet' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              model-viewer tag
            </button>
          </div>

          <pre className="rounded-lg bg-gray-900 text-gray-100 text-xs p-4 overflow-x-auto whitespace-pre-wrap break-all">
            {embedType === 'iframe'
              ? buildEmbedSnippet(modelUrl, productName)
              : buildModelViewerSnippet(modelUrl)}
          </pre>

          <Button
            className="w-full justify-center"
            onClick={() => copySnippet(embedType === 'iframe' ? buildEmbedSnippet(modelUrl, productName) : buildModelViewerSnippet(modelUrl))}
          >
            {copied ? '✓ Copied!' : 'Copy snippet'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
