import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Conversion,
  ConversionStatus,
  MediaAsset,
  PRODUCT_CATEGORIES,
  QualityReport,
  generateId,
  type ConversionSnapshot,
  type Hotspot,
  type Product,
  type ProductCategory,
} from '@minimalblock/core';
import { ModelViewer, ModelViewerPlaceholder, StatusBadge, Button, Spinner, Card, Modal } from '@minimalblock/ui';
import { useApp } from '../context/AppContext.js';
import type { SupabaseUser } from '../types.js';

interface ProductDetailPageProps {
  user: SupabaseUser;
}

function categoryLabel(category: ProductCategory): string {
  switch (category) {
    case 'furniture':
      return 'Furniture';
    case 'home-decor':
      return 'Home Decor';
    case 'bags':
      return 'Bags';
    case 'accessories':
      return 'Accessories';
    case 'other':
    default:
      return 'Other';
  }
}

function hydrateConversion(snapshot: ConversionSnapshot): Conversion {
  const sourceAssets = snapshot.sourceAssets.map((asset) => new MediaAsset({
    url: asset.url,
    storageKey: asset.storageKey,
    mimeType: asset.mimeType,
    kind: 'source-image',
    sizeBytes: asset.sizeBytes,
  }));
  const outputAsset = snapshot.outputAsset
    ? new MediaAsset({
        url: snapshot.outputAsset.url,
        storageKey: snapshot.outputAsset.storageKey,
        mimeType: snapshot.outputAsset.mimeType,
        kind: 'generated-model',
        sizeBytes: snapshot.outputAsset.sizeBytes,
      })
    : undefined;

  return new Conversion({
    id: snapshot.id,
    productId: snapshot.productId,
    ownerId: snapshot.ownerId,
    sourceAsset: sourceAssets[0],
    sourceAssets,
    outputAsset,
    status: ConversionStatus.from(snapshot.status),
    errorMessage: snapshot.errorMessage,
    provider: snapshot.provider,
    qualityReport: snapshot.qualityReport ? QualityReport.fromJSON(snapshot.qualityReport) : undefined,
    approvedAt: snapshot.approvedAt ? new Date(snapshot.approvedAt) : undefined,
    rejectionReason: snapshot.rejectionReason,
    createdAt: new Date(snapshot.createdAt),
    updatedAt: new Date(snapshot.updatedAt),
  });
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

function buildEmbedSnippet(modelUrl: string, name: string, productId: string): string {
  const iframeSrc = `${window.location.origin}/embed?model=${encodeURIComponent(modelUrl)}&name=${encodeURIComponent(name)}&pid=${productId}`;
  return `<iframe\n  src="${iframeSrc}"\n  style="width:100%;height:400px;border:none;border-radius:12px"\n  allowfullscreen\n  title="${name} — 3D preview"\n></iframe>`;
}

function buildModelViewerSnippet(modelUrl: string): string {
  return `<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"></script>\n<model-viewer\n  src="${modelUrl}"\n  camera-controls\n  auto-rotate\n  ar\n  ar-modes="webxr scene-viewer"\n  style="width:100%;height:400px;border-radius:12px"\n></model-viewer>`;
}

export function ProductDetailPage({ user }: ProductDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { conversionRepo, productRepo, eventsRepo, apiClient } = useApp();

  const [conversion, setConversion] = useState<Conversion | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMeta, setEditingMeta] = useState(false);
  const [metaForm, setMetaForm] = useState({ name: '', description: '', category: 'other' as ProductCategory });
  const [savingMeta, setSavingMeta] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [savingHotspots, setSavingHotspots] = useState(false);
  const [pendingHotspot, setPendingHotspot] = useState<{ position: string; normal: string } | null>(null);
  const [pendingLabel, setPendingLabel] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [embedType, setEmbedType] = useState<'iframe' | 'snippet'>('iframe');
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const lastRotateEvent = useRef(0);

  const loadRecord = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const found = await conversionRepo.findById(id);
      if (!found || !found.isAccessibleBy(user.id)) {
        throw new Error('Model not found');
      }
      const foundProduct = await productRepo.findById(found.productId);
      if (!foundProduct) {
        throw new Error('Product not found');
      }

      setConversion(found);
      setProduct(foundProduct);
      setHotspots(foundProduct.hotspots);
      setMetaForm({
        name: foundProduct.name,
        description: foundProduct.description,
        category: foundProduct.category,
      });
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [conversionRepo, id, productRepo, user.id]);

  useEffect(() => {
    void loadRecord();
  }, [loadRecord]);

  useEffect(() => {
    if (!conversion || conversion.status.isTerminal()) return;
    const interval = window.setInterval(async () => {
      try {
        const response = await apiClient.getConversion(conversion.id);
        setConversion(hydrateConversion(response.conversion));
      } catch {
        window.clearInterval(interval);
      }
    }, 2500);

    return () => window.clearInterval(interval);
  }, [apiClient, conversion]);

  const productName = product?.name ?? conversion?.sourceAsset.storageKey.split('/').pop() ?? 'Product';
  const publicUrl = product && conversion?.status.isViewable() ? `${window.location.origin}${product.publicUrl}` : null;
  const qualityScore = conversion?.qualityReport?.score();
  const visibleHotspots = useMemo(() => hotspots.filter((hotspot) => hotspot.position && hotspot.normal), [hotspots]);

  async function saveMeta() {
    if (!product) return;
    setSavingMeta(true);
    try {
      const saved = await productRepo.save(product.withUpdatedMeta(metaForm));
      setProduct(saved);
      setEditingMeta(false);
    } finally {
      setSavingMeta(false);
    }
  }

  async function handleDelete() {
    if (!product) return;
    setDeleting(true);
    try {
      await productRepo.delete(product.id);
      navigate('/');
    } finally {
      setDeleting(false);
    }
  }

  const handleHotspotAdd = useCallback((position: string, normal: string) => {
    setPendingHotspot({ position, normal });
    setPendingLabel('');
  }, []);

  function confirmHotspot() {
    if (!pendingHotspot || !pendingLabel.trim()) return;
    const newHotspot: Hotspot = {
      id: generateId(),
      label: pendingLabel.trim(),
      position: pendingHotspot.position,
      normal: pendingHotspot.normal,
      type: 'feature',
    };
    setHotspots((current) => [...current, newHotspot]);
    setPendingHotspot(null);
    setPendingLabel('');
  }

  function removeHotspot(hotspotId: string) {
    setHotspots((current) => current.filter((hotspot) => hotspot.id !== hotspotId));
  }

  async function saveHotspots() {
    if (!product) return;
    setSavingHotspots(true);
    try {
      const saved = await productRepo.save(product.withUpdatedHotspots(hotspots));
      setProduct(saved);
      setHotspots(saved.hotspots);
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
    if (conversion) {
      await eventsRepo.track(conversion.productId, user.id, 'embed_copied');
    }
  }

  async function handleApprove() {
    if (!conversion) return;
    setBusyAction('approve');
    try {
      const response = await apiClient.approveConversion(conversion.id);
      setConversion(hydrateConversion(response.conversion));
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : 'Failed to approve conversion');
    } finally {
      setBusyAction(null);
    }
  }

  async function handleReject() {
    if (!conversion || !rejectReason.trim()) return;
    setBusyAction('reject');
    try {
      const response = await apiClient.rejectConversion(conversion.id, rejectReason.trim());
      setConversion(hydrateConversion(response.conversion));
      setRejectOpen(false);
      setRejectReason('');
    } catch (rejectError) {
      setError(rejectError instanceof Error ? rejectError.message : 'Failed to reject conversion');
    } finally {
      setBusyAction(null);
    }
  }

  async function runAiAction(action: 'analyze' | 'hotspots' | 'description' | 'risk' | 'quality') {
    if (!product) return;
    setBusyAction(action);
    try {
      if (action === 'analyze') await apiClient.analyzeProduct(product.id);
      if (action === 'hotspots') await apiClient.generateHotspots(product.id);
      if (action === 'description') await apiClient.generateDescription(product.id);
      if (action === 'risk') await apiClient.getReturnRisk(product.id);
      if (action === 'quality') await apiClient.getQualityCheck(product.id);
      const refreshed = await productRepo.findById(product.id);
      if (refreshed) {
        setProduct(refreshed);
        setHotspots(refreshed.hotspots);
      }
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'AI action failed');
    } finally {
      setBusyAction(null);
    }
  }

  async function acceptSuggestedHotspot(suggestedHotspotId: string) {
    if (!product) return;
    const saved = await productRepo.save(product.acceptSuggestedHotspot(suggestedHotspotId));
    setProduct(saved);
    setHotspots(saved.hotspots);
    await eventsRepo.track(saved.id, user.id, 'hotspot_suggestion_accepted', { suggested_hotspot_id: suggestedHotspotId });
  }

  async function rejectSuggestedHotspot(suggestedHotspotId: string) {
    if (!product) return;
    const saved = await productRepo.save(product.rejectSuggestedHotspot(suggestedHotspotId));
    setProduct(saved);
  }

  async function applySuggestedDescription() {
    if (!product?.aiAnalysis?.suggestedCopy) return;
    const saved = await productRepo.save(
      product.withUpdatedMeta({ description: product.aiAnalysis.suggestedCopy.description }),
    );
    setProduct(saved);
    setMetaForm((current) => ({ ...current, description: saved.description }));
  }

  async function handleDownload() {
    if (!conversion?.outputAsset) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const filename = conversion.outputAsset.storageKey.split('/').pop() ?? 'model.glb';
      await downloadGlb(conversion.outputAsset.url, filename);
    } catch (downloadIssue) {
      setDownloadError(downloadIssue instanceof Error ? downloadIssue.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" label="Loading product review…" />
      </div>
    );
  }

  if (!conversion || !product) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error ?? 'Model not found'}</div>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/')}>Back to gallery</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-700">← Gallery</button>
        {editingMeta ? (
          <input
            autoFocus
            value={metaForm.name}
            onChange={(event) => setMetaForm((current) => ({ ...current, name: event.target.value }))}
            className="flex-1 rounded-lg border border-indigo-400 px-3 py-1 text-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        ) : (
          <h1 className="truncate text-2xl font-bold text-gray-900">{productName}</h1>
        )}
        <StatusBadge status={conversion.status.value} />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="relative h-[28rem] bg-gray-100">
          {conversion.outputAsset ? (
            <>
              <ModelViewer
                modelUrl={conversion.outputAsset.url}
                className="h-full"
                hotspots={visibleHotspots}
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
                onSessionEnd={(durationMs) => eventsRepo.track(conversion.productId, user.id, 'session_ended', { duration_ms: durationMs }).catch(() => null)}
                onHotspotClick={(hotspotId) => {
                  const hotspot = visibleHotspots.find((item) => item.id === hotspotId);
                  eventsRepo.track(conversion.productId, user.id, 'hotspot_clicked', {
                    hotspot_id: hotspotId,
                    hotspot_label: hotspot?.label,
                  }).catch(() => null);
                }}
              />
              {editMode && (
                <div className="absolute left-3 right-3 top-3 flex items-center justify-between rounded-lg bg-indigo-600/90 px-3 py-2 text-sm text-white backdrop-blur-sm">
                  <span>Click on the model to place a new hotspot</span>
                  <div className="flex gap-2">
                    <button onClick={cancelEdit} className="rounded bg-white/20 px-2 py-1 text-xs hover:bg-white/30">Cancel</button>
                    <button
                      onClick={saveHotspots}
                      disabled={savingHotspots}
                      className="rounded bg-white px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"
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

      <div className="flex flex-wrap gap-2">
        {conversion.outputAsset && (
          <Button onClick={handleDownload} loading={downloading}>Download GLB</Button>
        )}
        {conversion.status.isViewable() && conversion.outputAsset && (
          <Button variant="secondary" onClick={() => setEmbedOpen(true)}>Share / Embed</Button>
        )}
        {publicUrl && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-indigo-600 px-4 py-2 text-base font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            Public page ↗
          </a>
        )}
        {!editMode && conversion.outputAsset && (
          <Button variant="secondary" onClick={() => setEditMode(true)}>
            {hotspots.length > 0 ? `Edit Hotspots (${hotspots.length})` : 'Add Hotspots'}
          </Button>
        )}
        {conversion.status.isAwaitingApproval() && (
          <>
            <Button onClick={handleApprove} loading={busyAction === 'approve'}>Approve & publish</Button>
            <Button variant="danger" onClick={() => setRejectOpen(true)}>Reject</Button>
          </>
        )}
        {conversion.status.isFailed() && (
          <Button variant="secondary" onClick={() => navigate('/upload')}>Regenerate</Button>
        )}
        {downloadError && <p className="self-center text-xs text-red-600">{downloadError}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Merchant review</h2>
              <p className="mt-1 text-xs text-gray-500">This is the seller-facing control center for product metadata, AI output, and publish state.</p>
            </div>
            {editingMeta ? (
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setEditingMeta(false)}>Cancel</Button>
                <Button size="sm" onClick={saveMeta} loading={savingMeta}>Save</Button>
              </div>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => setEditingMeta(true)}>Edit details</Button>
            )}
          </div>

          {editingMeta ? (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
                <textarea
                  rows={4}
                  value={metaForm.description}
                  onChange={(event) => setMetaForm((current) => ({ ...current, description: event.target.value }))}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Category</label>
                <select
                  value={metaForm.category}
                  onChange={(event) => setMetaForm((current) => ({ ...current, category: event.target.value as ProductCategory }))}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {PRODUCT_CATEGORIES.map((value) => (
                    <option key={value} value={value}>{categoryLabel(value)}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                {conversion.sourceAssets.map((asset) => (
                  <div key={asset.storageKey} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
                    <img src={asset.url} alt={asset.storageKey} className="h-16 w-16 rounded-lg border border-gray-200 object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{asset.storageKey.split('/').pop()}</p>
                      <p className="text-xs text-gray-400">{(asset.sizeBytes / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                ))}
              </div>
              {product.description && <p className="text-sm text-gray-600">{product.description}</p>}
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                <span>{categoryLabel(product.category)}</span>
                {conversion.outputAsset && <span>{(conversion.outputAsset.sizeBytes / 1024).toFixed(1)} KB GLB</span>}
                {qualityScore !== undefined && <span>Asset quality score: {qualityScore}/100</span>}
              </div>
              {conversion.errorMessage && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{conversion.errorMessage}</div>
              )}
              {conversion.qualityReport?.geminiQaReport && (() => {
                const qa = conversion.qualityReport.geminiQaReport!;
                const score = conversion.qualityReport.score();
                const isCritical = score < 40;
                return (
                  <div className={`mt-3 rounded-xl p-3 text-sm ${isCritical ? 'bg-red-50 text-red-900' : 'bg-amber-50 text-amber-900'}`}>
                    <p className="font-semibold">
                      Visual QA: {score}/100 —{' '}
                      <span className="font-normal">{qa.status.replace(/_/g, ' ')}</span>
                    </p>
                    <p className="mt-1 text-xs">
                      Category match: {qa.categoryMatch.score}/10 — {qa.categoryMatch.reason}
                    </p>
                    {qa.missingParts.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium">Missing parts:</p>
                        <ul className={`mt-1 space-y-0.5 text-xs ${isCritical ? 'text-red-700' : 'text-amber-700'}`}>
                          {qa.missingParts.map((p) => <li key={p}>• {p}</li>)}
                        </ul>
                      </div>
                    )}
                    {qa.sourceImageIssues.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium">Source image issues:</p>
                        <ul className={`mt-1 space-y-0.5 text-xs ${isCritical ? 'text-red-700' : 'text-amber-700'}`}>
                          {qa.sourceImageIssues.map((issue) => <li key={issue}>• {issue}</li>)}
                        </ul>
                      </div>
                    )}
                    {qa.recommendedActions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium">Recommended actions:</p>
                        <ul className={`mt-1 space-y-0.5 text-xs font-medium ${isCritical ? 'text-red-800' : 'text-amber-800'}`}>
                          {qa.recommendedActions.map((action) => <li key={action}>→ {action}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          <div className="mt-6 border-t border-gray-100 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">AI workflow</h3>
                <p className="mt-1 text-xs text-gray-500">Generate commerce guidance without leaving the review screen.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => runAiAction('analyze')} loading={busyAction === 'analyze'}>
                Analyze product
              </Button>
              <Button size="sm" variant="secondary" onClick={() => runAiAction('hotspots')} loading={busyAction === 'hotspots'}>
                Generate hotspots
              </Button>
              <Button size="sm" variant="secondary" onClick={() => runAiAction('description')} loading={busyAction === 'description'}>
                Generate copy
              </Button>
              <Button size="sm" variant="secondary" onClick={() => runAiAction('risk')} loading={busyAction === 'risk'}>
                Return-risk
              </Button>
              <Button size="sm" variant="secondary" onClick={() => runAiAction('quality')} loading={busyAction === 'quality'}>
                Quality check
              </Button>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-4 flex justify-end">
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => setDeleteOpen(true)}>
              Delete product
            </Button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="text-sm font-semibold text-gray-900">AI analysis</h2>
            {product.aiAnalysis ? (
              <div className="mt-4 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Confidence</p>
                    <p className="text-lg font-semibold text-gray-900">{Math.round(product.aiAnalysis.confidenceScore * 100)}%</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Readiness score</p>
                    <p className="text-lg font-semibold text-gray-900">{product.aiAnalysis.readinessScore ?? '—'}</p>
                  </div>
                </div>

                {product.aiAnalysis.materials.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Materials</p>
                    <div className="flex flex-wrap gap-2">
                      {product.aiAnalysis.materials.map((material) => (
                        <span key={material} className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700">{material}</span>
                      ))}
                    </div>
                  </div>
                )}

                {product.aiAnalysis.missingVisuals.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Missing visuals</p>
                    <ul className="space-y-2">
                      {product.aiAnalysis.missingVisuals.map((item) => (
                        <li key={item} className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.aiAnalysis.returnRiskFactors.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Return-risk factors</p>
                    <ul className="space-y-2">
                      {product.aiAnalysis.returnRiskFactors.map((factor) => (
                        <li key={factor.risk} className="rounded-lg bg-rose-50 p-3">
                          <p className="text-xs font-medium text-rose-900">{factor.risk}</p>
                          <p className="mt-1 text-xs text-rose-700">{factor.fix}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.aiAnalysis.qualityRecommendations.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Quality recommendations</p>
                    <ul className="space-y-2">
                      {product.aiAnalysis.qualityRecommendations.map((item) => (
                        <li key={item} className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-400">Run product analysis to generate merchant guidance.</p>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Suggested hotspots</h2>
              <span className="text-xs text-gray-400">{product.hotspotsSuggested.length} suggestions</span>
            </div>

            {product.hotspotsSuggested.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {product.hotspotsSuggested.map((hotspot) => (
                  <li key={hotspot.id} className="rounded-xl border border-gray-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{hotspot.title}</p>
                        <p className="mt-1 text-xs text-gray-500">{hotspot.description}</p>
                        <p className="mt-2 text-[11px] uppercase tracking-wide text-gray-400">{hotspot.type} · {hotspot.status}</p>
                      </div>
                      {hotspot.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => acceptSuggestedHotspot(hotspot.id)}>Accept</Button>
                          <Button size="sm" variant="secondary" onClick={() => rejectSuggestedHotspot(hotspot.id)}>Reject</Button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-gray-400">No suggestions yet. Run hotspot generation to populate this queue.</p>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Generated copy</h2>
              {product.aiAnalysis?.suggestedCopy && (
                <Button size="sm" variant="secondary" onClick={applySuggestedDescription}>Apply description</Button>
              )}
            </div>
            {product.aiAnalysis?.suggestedCopy ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">SEO title</p>
                  <p className="text-sm font-medium text-gray-900">{product.aiAnalysis.suggestedCopy.seoTitle}</p>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Bullet points</p>
                  <ul className="space-y-2">
                    {product.aiAnalysis.suggestedCopy.bullets.map((bullet) => (
                      <li key={bullet} className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{bullet}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                  {product.aiAnalysis.suggestedCopy.description}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-400">Generate copy to get SEO title, bullets, and PDP description suggestions.</p>
            )}
          </Card>
        </div>
      </div>

      {editMode && hotspots.length > 0 && (
        <Card>
          <p className="mb-3 text-sm font-medium text-gray-700">Hotspots ({hotspots.length})</p>
          <ul className="space-y-2">
            {hotspots.map((hotspot) => (
              <li key={hotspot.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                <div>
                  <span className="text-gray-900">{hotspot.label}</span>
                  {!hotspot.position && <span className="ml-2 text-xs text-amber-600">Needs placement</span>}
                </div>
                <button onClick={() => removeHotspot(hotspot.id)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal open={!!pendingHotspot} onClose={() => setPendingHotspot(null)} title="Name this hotspot">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Add a short label for the point you selected on the model.</p>
          <input
            type="text"
            autoFocus
            value={pendingLabel}
            onChange={(event) => setPendingLabel(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') confirmHotspot(); }}
            placeholder="Hotspot label…"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPendingHotspot(null)}>Cancel</Button>
            <Button size="sm" onClick={confirmHotspot} disabled={!pendingLabel.trim()}>Add</Button>
          </div>
        </div>
      </Modal>

      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject conversion">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Add a short reason so the merchant workflow keeps an audit trail.</p>
          <textarea
            rows={3}
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. geometry distortion around the handle"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} loading={busyAction === 'reject'} disabled={!rejectReason.trim()}>
              Reject conversion
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete product">
        <p className="text-sm text-gray-600">
          This will permanently delete the product, its 3D model, and all interaction history. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)} disabled={deleting}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>Delete</Button>
        </div>
      </Modal>

      <Modal open={embedOpen} onClose={() => { setEmbedOpen(false); setCopied(false); }} title="Share / Embed">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Paste one of these snippets into any webpage to show the interactive 3D viewer.</p>

          <div className="flex gap-2">
            <Button size="sm" variant={embedType === 'iframe' ? 'primary' : 'secondary'} onClick={() => setEmbedType('iframe')}>
              iFrame
            </Button>
            <Button size="sm" variant={embedType === 'snippet' ? 'primary' : 'secondary'} onClick={() => setEmbedType('snippet')}>
              model-viewer
            </Button>
          </div>

          <div className="rounded-xl bg-gray-900 p-4">
            <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-gray-100">
              {embedType === 'iframe'
                ? buildEmbedSnippet(conversion.outputAsset?.url ?? '', productName, product.id)
                : buildModelViewerSnippet(conversion.outputAsset?.url ?? '')}
            </pre>
          </div>

          <div className="flex justify-between">
            <span className="text-xs text-gray-400">{copied ? 'Copied to clipboard' : 'Ready to copy'}</span>
            <Button
              size="sm"
              onClick={() => copySnippet(
                embedType === 'iframe'
                  ? buildEmbedSnippet(conversion.outputAsset?.url ?? '', productName, product.id)
                  : buildModelViewerSnippet(conversion.outputAsset?.url ?? ''),
              )}
            >
              Copy snippet
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
