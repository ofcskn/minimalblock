import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTrendyolPublish } from '../lib/trendyol/use-trendyol-publish.js';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Conversion,
  ConversionStatus,
  MediaAsset,
  PRODUCT_CATEGORIES,
  ProductWorkflowStatus,
  QualityReport,
  generateId,
  type ConversionSnapshot,
  type Hotspot,
  type Product,
  type ProductCategory,
} from '@minimalblock/core';
import { ModelViewer, ModelViewerPlaceholder, StatusBadge, WorkflowStatusBadge, Button, Spinner, Card, Modal } from '@minimalblock/ui';
import { useApp } from '../context/AppContext.js';
import type { SupabaseUser } from '../types.js';

interface ProductDetailPageProps {
  user: SupabaseUser;
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
  const { t } = useTranslation();
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
  const [trendyolOpen, setTrendyolOpen] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [approvingProduct, setApprovingProduct] = useState(false);
  const trendyolPublish = useTrendyolPublish(apiClient);

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

  async function handleApproveProduct(reason?: string) {
    if (!product) return;
    setApprovingProduct(true);
    try {
      const saved = await productRepo.save(product.withWorkflowStatus('approved'));
      setProduct(saved);
      setOverrideOpen(false);
      setOverrideReason('');
      if (reason) {
        await eventsRepo.track(product.id, user.id, 'product_approved_with_override', { reason });
      } else {
        await eventsRepo.track(product.id, user.id, 'product_approved');
      }
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : 'Failed to approve product');
    } finally {
      setApprovingProduct(false);
    }
  }

  async function handlePublishProduct() {
    if (!product) return;
    setApprovingProduct(true);
    try {
      const saved = await productRepo.save(product.withWorkflowStatus('published'));
      setProduct(saved);
      await eventsRepo.track(product.id, user.id, 'product_published');
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Failed to publish product');
    } finally {
      setApprovingProduct(false);
    }
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
        <Spinner size="lg" label={t('product.loading')} />
      </div>
    );
  }

  if (!conversion || !product) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error ?? t('product.notFound')}</div>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/')}>{t('product.backGallery')}</Button>
      </div>
    );
  }

  // WorkflowStatus is the authoritative gate for all publish/export/approval decisions.
  // ConversionStatus only controls the 3D pipeline display (pending → processing → done).
  const workflowStatus = ProductWorkflowStatus.from(product.workflowStatus);
  const isBlocked = workflowStatus.isBlocked();          // failed_qa — hard block
  const isNeedsFix = workflowStatus.value === 'needs_fix';
  const isReadyForReview = workflowStatus.value === 'ready_for_review';
  const isApproved = workflowStatus.value === 'approved';
  const isPublished = workflowStatus.value === 'published';
  const canPublish = workflowStatus.isPublishable();     // approved | published
  const canEmbed = workflowStatus.canExport();
  const isAwaitingApproval = conversion.status.isAwaitingApproval(); // 3D pipeline state
  const isFailed = conversion.status.value === 'failed' || conversion.status.value === 'rejected'; // 3D pipeline
  const qaScore = conversion.qualityReport?.score();
  const publicUrl = canPublish ? `${window.location.origin}${product.publicUrl}` : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-700">{t('product.backGallery')}</button>
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
        <WorkflowStatusBadge status={product.workflowStatus} />
        <StatusBadge status={conversion.status.value} />
      </div>

      {/* Status banners — seller decision guide driven by workflow status */}
      {isBlocked && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold">✕</div>
          <div>
            <p className="text-sm font-semibold text-red-900">Visual QA Failed — Publishing blocked</p>
            <p className="mt-1 text-xs text-red-700">
              AI analysis found critical issues that prevent listing. Readiness score is below 40. Re-upload with better images (at least 3 angles, plain background) to try again.
            </p>
          </div>
        </div>
      )}
      {isNeedsFix && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">!</div>
          <div>
            <p className="text-sm font-semibold text-amber-900">Needs Fix — Quality issues detected</p>
            <p className="mt-1 text-xs text-amber-700">
              Readiness score is 40–69. Review the AI diagnosis below and fix the flagged issues before approving, or provide an override reason to approve anyway.
            </p>
          </div>
        </div>
      )}
      {isReadyForReview && (
        <div className="flex items-start gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">→</div>
          <div>
            <p className="text-sm font-semibold text-indigo-900">Ready for Merchant Review</p>
            <p className="mt-1 text-xs text-indigo-700">AI quality check passed. Review the 3D model and AI diagnosis, then approve to unlock publishing.</p>
          </div>
        </div>
      )}
      {isApproved && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">✓</div>
          <div>
            <p className="text-sm font-semibold text-emerald-900">Approved — Ready to publish</p>
            <p className="mt-1 text-xs text-emerald-700">You have reviewed and approved this product. Click Publish to make it live, or use Embed / Public Page to share.</p>
          </div>
        </div>
      )}
      {isPublished && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">✓</div>
          <div>
            <p className="text-sm font-semibold text-green-900">Published</p>
            <p className="mt-1 text-xs text-green-700">This product is live. It can be embedded, shared via public page, or exported to Trendyol.</p>
          </div>
        </div>
      )}

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
                      {savingHotspots ? '…' : t('product.saveHotspots')}
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
        {/* Download always available when output exists */}
        {conversion.outputAsset && (
          <Button onClick={handleDownload} loading={downloading}>{t('product.download')}</Button>
        )}

        {/* Embed — requires approved or published */}
        {conversion.outputAsset && (
          canEmbed ? (
            <Button variant="secondary" onClick={() => setEmbedOpen(true)}>{t('product.embed')}</Button>
          ) : (
            <Button variant="secondary" disabled title={`Embedding is locked until the product is approved. Current status: ${product.workflowStatus.replace(/_/g, ' ')}.`}>
              {t('product.embed')}
            </Button>
          )
        )}

        {/* Public page link — requires approved or published */}
        {publicUrl && canPublish ? (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-4 py-2 text-base font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            {t('product.sharePublicPage')} ↗
          </a>
        ) : !canPublish && conversion.outputAsset && (
          <button
            disabled
            title={`Public page is locked until the product is approved. Current status: ${product.workflowStatus.replace(/_/g, ' ')}.`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-base font-medium text-gray-400 cursor-not-allowed"
          >
            {t('product.sharePublicPage')} ↗
          </button>
        )}

        {/* Hotspot editing — available when output exists */}
        {!editMode && conversion.outputAsset && (
          <Button variant="secondary" onClick={() => setEditMode(true)}>
            {hotspots.length > 0 ? t('product.editHotspots') : t('product.addHotspot')}
          </Button>
        )}

        {/* Product approval gate — driven by workflow status, not conversion status */}
        {isReadyForReview && (
          <Button onClick={() => handleApproveProduct()} loading={approvingProduct}>
            Approve Product
          </Button>
        )}
        {isNeedsFix && (
          <Button variant="secondary" onClick={() => setOverrideOpen(true)}>
            Approve Anyway…
          </Button>
        )}
        {isApproved && (
          <Button onClick={handlePublishProduct} loading={approvingProduct}>
            Publish
          </Button>
        )}

        {/* 3D pipeline approval — keep for awaiting_approval conversion state */}
        {isAwaitingApproval && (
          <>
            <Button onClick={handleApprove} loading={busyAction === 'approve'}>{t('product.approve')}</Button>
            <Button variant="danger" onClick={() => setRejectOpen(true)}>{t('product.reject')}</Button>
          </>
        )}

        {/* Fix path for blocked products */}
        {(isBlocked || isFailed) && (
          <Button variant="secondary" onClick={() => navigate('/upload')}>Re-upload with better images</Button>
        )}

        {/* Export to Trendyol — requires published */}
        {isPublished ? (
          <Button
            variant="secondary"
            onClick={() => {
              trendyolPublish.reset();
              setTrendyolOpen(true);
              if (trendyolPublish.phase === 'idle') {
                void trendyolPublish.generateListing(product.id);
              }
            }}
          >
            {t('product.publishTrendyol')}
          </Button>
        ) : canPublish ? (
          <Button
            variant="secondary"
            title="Trendyol export requires the product to be published first."
            onClick={() => {
              trendyolPublish.reset();
              setTrendyolOpen(true);
              if (trendyolPublish.phase === 'idle') {
                void trendyolPublish.generateListing(product.id);
              }
            }}
          >
            {t('product.publishTrendyol')}
          </Button>
        ) : (
          <Button
            variant="secondary"
            disabled
            title={`Trendyol export is locked until the product is approved and published. Current status: ${product.workflowStatus.replace(/_/g, ' ')}.`}
          >
            {t('product.publishTrendyol')}
          </Button>
        )}

        {downloadError && <p className="self-center text-xs text-red-600">{downloadError}</p>}
      </div>

      {/* Marketplace readiness + export package status */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* QA Score */}
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('product.qaScoreLabel')}</p>
          {qaScore !== undefined ? (
            <div className="mt-2 flex items-end gap-2">
              <p className={`text-3xl font-bold ${qaScore >= 70 ? 'text-emerald-600' : qaScore >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                {qaScore}<span className="text-base font-normal text-gray-400">/100</span>
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-400">Not scored yet</p>
          )}
          {qaScore !== undefined && (
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full ${qaScore >= 70 ? 'bg-emerald-500' : qaScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${qaScore}%` }}
              />
            </div>
          )}
        </Card>

        {/* Marketplace readiness */}
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('product.marketplaceReadiness')}</p>
          <div className="mt-2">
            {canPublish ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {t('product.readinessApproved')}
              </span>
            ) : isBlocked ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Visual QA Failed
              </span>
            ) : isNeedsFix ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Needs Fix
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                {t('product.readinessPending')}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {canPublish ? 'Trendyol · Shopify · Amazon' : 'Listing blocked until approved'}
          </p>
        </Card>

        {/* Export package */}
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('product.exportPackage')}</p>
          <div className="mt-2">
            {canEmbed ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {t('product.exportPackageReady')}
              </span>
            ) : isBlocked ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                {t('product.exportPackageBlocked')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-600">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                {t('product.exportPackagePending')}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {canEmbed ? 'GLB · preview · catalog metadata' : 'Available after approval'}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Seller review</h2>
              <p className="mt-1 text-xs text-gray-500">AI quality diagnosis, source images, and product metadata. Approve to unlock publish — or block to request a fix.</p>
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
                    <option key={value} value={value}>{t(`category.${value}`)}</option>
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
                <span>{t(`category.${product.category}`)}</span>
                {conversion.outputAsset && <span>{(conversion.outputAsset.sizeBytes / 1024).toFixed(1)} KB GLB</span>}
                {qaScore !== undefined && <span>QA score: {qaScore}/100</span>}
              </div>
              {conversion.errorMessage && !conversion.qualityReport?.geminiQaReport && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <p className="font-semibold">AI diagnosis failed</p>
                  <p className="mt-1 text-xs">{conversion.errorMessage}</p>
                </div>
              )}
              {conversion.qualityReport?.geminiQaReport && (() => {
                const qa = conversion.qualityReport.geminiQaReport!;
                const score = conversion.qualityReport.score();
                const isCritical = score < 40;
                const isWarning = score >= 40 && score < 70;
                return (
                  <div className={`mt-3 rounded-xl border p-4 ${isCritical ? 'border-red-200 bg-red-50' : isWarning ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-semibold ${isCritical ? 'text-red-900' : isWarning ? 'text-amber-900' : 'text-emerald-900'}`}>
                        AI Visual QA Diagnosis
                      </p>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${isCritical ? 'bg-red-600 text-white' : isWarning ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'}`}>
                        {score}/100
                      </span>
                    </div>
                    <p className={`mt-1 text-xs capitalize ${isCritical ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {qa.status.replace(/_/g, ' ')} · Category match: {qa.categoryMatch.score}/10 — {qa.categoryMatch.reason}
                    </p>

                    {qa.missingParts.length > 0 && (
                      <div className="mt-3">
                        <p className={`text-xs font-semibold uppercase tracking-wide ${isCritical ? 'text-red-800' : 'text-amber-800'}`}>Missing from 3D model</p>
                        <ul className={`mt-1.5 space-y-1 text-xs ${isCritical ? 'text-red-700' : 'text-amber-700'}`}>
                          {qa.missingParts.map((p) => <li key={p} className="flex items-start gap-1.5"><span className="mt-0.5 font-bold">✕</span>{p}</li>)}
                        </ul>
                      </div>
                    )}

                    {qa.sourceImageIssues.length > 0 && (
                      <div className="mt-3">
                        <p className={`text-xs font-semibold uppercase tracking-wide ${isCritical ? 'text-red-800' : 'text-amber-800'}`}>Source image issues</p>
                        <ul className={`mt-1.5 space-y-1 text-xs ${isCritical ? 'text-red-700' : 'text-amber-700'}`}>
                          {qa.sourceImageIssues.map((issue) => <li key={issue} className="flex items-start gap-1.5"><span className="mt-0.5">⚠</span>{issue}</li>)}
                        </ul>
                      </div>
                    )}

                    {qa.recommendedActions.length > 0 && (
                      <div className="mt-3">
                        <p className={`text-xs font-semibold uppercase tracking-wide ${isCritical ? 'text-red-800' : isWarning ? 'text-amber-800' : 'text-emerald-800'}`}>Recommended next actions</p>
                        <ul className={`mt-1.5 space-y-1 text-xs font-medium ${isCritical ? 'text-red-900' : isWarning ? 'text-amber-900' : 'text-emerald-900'}`}>
                          {qa.recommendedActions.map((action) => <li key={action} className="flex items-start gap-1.5"><span className="mt-0.5">→</span>{action}</li>)}
                        </ul>
                      </div>
                    )}

                    {isCritical && (
                      <div className="mt-4 rounded-lg bg-red-600 px-3 py-2">
                        <p className="text-xs font-semibold text-white">Next action: Re-upload with more image angles</p>
                        <p className="mt-0.5 text-[11px] text-red-100">Use at least 3 photos showing front, back, and side. Avoid busy backgrounds.</p>
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
              {t('product.deleteProduct')}
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

      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title={t('product.rejectModal.title')}>
        <div className="space-y-4">
          <textarea
            rows={3}
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder={t('product.rejectModal.placeholder')}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRejectOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={handleReject} loading={busyAction === 'reject'} disabled={!rejectReason.trim()}>
              {t('product.rejectModal.confirmBtn')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title={t('product.deleteProduct')}>
        <p className="text-sm text-gray-600">{t('product.deleteModal.description')}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)} disabled={deleting}>{t('common.cancel')}</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>{t('common.delete')}</Button>
        </div>
      </Modal>

      <Modal
        open={trendyolOpen}
        onClose={() => {
          if (trendyolPublish.phase !== 'publishing' && trendyolPublish.phase !== 'polling') {
            setTrendyolOpen(false);
          }
        }}
        title={t('product.trendyolModal.title')}
      >
        {trendyolPublish.phase === 'generating' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Spinner size="lg" label={t('product.trendyolModal.generatingLabel')} />
            <p className="text-sm text-gray-400 text-center">{t('product.trendyolModal.generatingTime')}</p>
          </div>
        )}

        {trendyolPublish.phase === 'reviewing' && trendyolPublish.draft && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{t('product.trendyolModal.reviewDesc')}</p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('product.trendyolModal.titleLabel')}</label>
              <input
                type="text"
                value={trendyolPublish.draft.title}
                onChange={(e) => trendyolPublish.updateDraft({ title: e.target.value })}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('product.trendyolModal.descriptionLabel')}</label>
              <textarea
                rows={3}
                value={trendyolPublish.draft.description}
                onChange={(e) => trendyolPublish.updateDraft({ description: e.target.value })}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('product.trendyolModal.listPrice')}</label>
                <input
                  type="number"
                  value={trendyolPublish.draft.listPrice}
                  onChange={(e) => trendyolPublish.updateDraft({ listPrice: Number(e.target.value) })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('product.trendyolModal.salePrice')}</label>
                <input
                  type="number"
                  value={trendyolPublish.draft.salePrice}
                  onChange={(e) => trendyolPublish.updateDraft({ salePrice: Number(e.target.value) })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('product.trendyolModal.brand')}</label>
              <input
                type="text"
                value={trendyolPublish.draft.brandName}
                onChange={(e) => trendyolPublish.updateDraft({ brandName: e.target.value })}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            {trendyolPublish.draft.attributes.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">{t('product.trendyolModal.aiAttributes')}</p>
                <div className="flex flex-wrap gap-2">
                  {trendyolPublish.draft.attributes.map((attr) => (
                    <span key={attr.name} className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700">
                      {attr.name}: {attr.value}
                    </span>
                  ))}
                </div>
                <p className="mt-1 text-[10px] text-gray-400">{t('product.trendyolModal.aiAttributesNote')}</p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setTrendyolOpen(false)}>{t('product.trendyolModal.cancelBtn')}</Button>
              <Button
                size="sm"
                onClick={() => {
                  if (!trendyolPublish.draft || !conversion.sourceAssets[0]) return;
                  const barcode = `MB-${product.id.slice(0, 8).toUpperCase()}`;
                  void trendyolPublish.publish(trendyolPublish.draft, conversion.sourceAssets[0].url, barcode);
                }}
              >
                {t('product.trendyolModal.publishBtn')}
              </Button>
            </div>
          </div>
        )}

        {(trendyolPublish.phase === 'publishing' || trendyolPublish.phase === 'polling') && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Spinner size="lg" label={trendyolPublish.phase === 'publishing' ? t('product.trendyolModal.submitting') : t('product.trendyolModal.polling')} />
            {trendyolPublish.batchRequestId && (
              <p className="text-xs text-gray-400">{t('product.trendyolModal.batchId')} {trendyolPublish.batchRequestId}</p>
            )}
          </div>
        )}

        {trendyolPublish.phase === 'done' && (
          <div className="space-y-4 py-4 text-center">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${trendyolPublish.batchStatus === 'FAILED' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {trendyolPublish.batchStatus === 'FAILED' ? t('product.trendyolModal.submittedFailed') : trendyolPublish.batchStatus === 'IN_PROGRESS' ? t('product.trendyolModal.submittedInProgress') : t('product.trendyolModal.submittedSuccess')}
            </div>
            <p className="text-sm text-gray-500">
              {trendyolPublish.batchStatus === 'DONE'
                ? t('product.trendyolModal.doneSuccess')
                : trendyolPublish.batchStatus === 'IN_PROGRESS'
                  ? t('product.trendyolModal.doneInProgress')
                  : t('product.trendyolModal.doneFailed')}
            </p>
            <Button size="sm" onClick={() => setTrendyolOpen(false)}>{t('product.trendyolModal.closeBtn')}</Button>
          </div>
        )}

        {trendyolPublish.phase === 'error' && (
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{trendyolPublish.error}</div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setTrendyolOpen(false)}>{t('product.trendyolModal.closeBtn')}</Button>
              <Button
                size="sm"
                onClick={() => {
                  trendyolPublish.reset();
                  void trendyolPublish.generateListing(product.id);
                }}
              >
                {t('product.trendyolModal.retryBtn')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={overrideOpen} onClose={() => setOverrideOpen(false)} title="Approve with Override">
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            This product has quality issues (score 40–69). You are overriding the AI recommendation. Provide a reason to continue.
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Override reason (required)</label>
            <textarea
              autoFocus
              rows={3}
              value={overrideReason}
              onChange={(event) => setOverrideReason(event.target.value)}
              placeholder="e.g. Images already optimised for this category; risk accepted by seller."
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setOverrideOpen(false); setOverrideReason(''); }}>Cancel</Button>
            <Button
              onClick={() => handleApproveProduct(overrideReason.trim())}
              loading={approvingProduct}
              disabled={!overrideReason.trim()}
            >
              Approve Anyway
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={embedOpen} onClose={() => { setEmbedOpen(false); setCopied(false); }} title={t('product.embedModal.title')}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">{t('product.embedModal.description')}</p>

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
            <span className="text-xs text-gray-400">{copied ? t('product.embedModal.copied') : t('product.embedModal.ready')}</span>
            <Button
              size="sm"
              onClick={() => copySnippet(
                embedType === 'iframe'
                  ? buildEmbedSnippet(conversion.outputAsset?.url ?? '', productName, product.id)
                  : buildModelViewerSnippet(conversion.outputAsset?.url ?? ''),
              )}
            >
              {t('product.embedModal.copyBtn')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
