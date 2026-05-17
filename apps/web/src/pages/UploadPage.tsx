import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QualityReport,
  validateImageFile,
  validateModelFile,
  type ApiMediaAssetInput,
  type ConversionSnapshot,
  type MediaAsset,
  type ProductCategory,
} from '@minimalblock/core';
import { ModelViewer, ModelViewerPlaceholder, StatusBadge, Spinner } from '@minimalblock/ui';
import { useApp } from '../context/AppContext.js';
import type { SupabaseUser } from '../types.js';

interface UploadPageProps {
  user: SupabaseUser;
}

function toApiAsset(asset: MediaAsset): ApiMediaAssetInput {
  return { url: asset.url, storageKey: asset.storageKey, mimeType: asset.mimeType, sizeBytes: asset.sizeBytes };
}

type Mode = '3d' | 'glb';

export function UploadPage({ user }: UploadPageProps) {
  const navigate = useNavigate();
  const { imageUploader, apiClient } = useApp();

  const [mode, setMode] = useState<Mode>('3d');
  const [productDetails, setProductDetails] = useState('');
  const [sourceAssets, setSourceAssets] = useState<MediaAsset[]>([]);
  const [glbAsset, setGlbAsset] = useState<MediaAsset | null>(null);
  const [uploadingSource, setUploadingSource] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [conversion, setConversion] = useState<ConversionSnapshot | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const glbInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canStart = (mode === '3d' ? sourceAssets.length > 0 : !!glbAsset) && productDetails.trim().length > 0 && !submitting;
  const isPolling = conversion?.status === 'pending' || conversion?.status === 'processing';
  const isProcessing = submitting || isPolling;
  const hasOutput = (conversion?.status === 'completed' || conversion?.status === 'approved') && !!conversion.outputAsset;

  useEffect(() => {
    if (!conversion || !isPolling) return;
    const interval = window.setInterval(async () => {
      try {
        const response = await apiClient.getConversion(conversion.id);
        setConversion(response.conversion);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : 'Failed to refresh.');
        window.clearInterval(interval);
      }
    }, 2500);
    return () => window.clearInterval(interval);
  }, [apiClient, conversion, isPolling]);

  const sortedSourceAssets = useMemo(
    () => [...sourceAssets].sort((a, b) => a.storageKey.localeCompare(b.storageKey)),
    [sourceAssets],
  );

  function newChat() {
    setProductDetails('');
    setSourceAssets([]);
    setGlbAsset(null);
    setConversion(null);
    setSubmitError(null);
    textareaRef.current?.focus();
  }

  async function handleImageFiles(files: File[]) {
    setSubmitError(null);
    setUploadingSource(true);
    try {
      const next: MediaAsset[] = [];
      for (const file of files) {
        const v = validateImageFile(file);
        if (!v.valid) throw new Error(v.reason ?? 'Invalid image.');
        const asset = await imageUploader.upload({ file, fileName: file.name, ownerId: user.id });
        next.push(asset);
      }
      setSourceAssets((p) => [...p, ...next]);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setUploadingSource(false);
    }
  }

  async function handleGlbFile(file: File) {
    setSubmitError(null);
    const v = validateModelFile(file);
    if (!v.valid) { setSubmitError(v.reason ?? 'Invalid GLB file.'); return; }
    setUploadingSource(true);
    try {
      const asset = await imageUploader.upload({ file, fileName: file.name, ownerId: user.id });
      setGlbAsset(asset);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setUploadingSource(false);
    }
  }

  async function startConversion() {
    if (!canStart) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const text = productDetails.trim();
      const firstLine = text.split('\n')[0]?.trim() ?? text;
      const res = await apiClient.createConversion({
        product: { name: firstLine, description: text, category: '' as ProductCategory },
        sourceAssets: mode === '3d' ? sourceAssets.map(toApiAsset) : [],
        manualModelAsset: mode === 'glb' && glbAsset ? toApiAsset(glbAsset) : undefined,
      });
      const refreshed = await apiClient.getConversion(res.conversionId);
      setConversion(refreshed.conversion);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Conversion failed.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); startConversion(); }
  }

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  const currentFile = mode === '3d' ? sortedSourceAssets : (glbAsset ? [glbAsset] : []);

  return (
    <div
      className="-mx-4 -my-5 sm:-mx-6 sm:-my-5 lg:-mx-6 lg:-my-6 flex flex-col overflow-hidden bg-white text-gray-900"
      style={{ height: 'calc(100dvh - 56px)' }}
    >
      {/* Top bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 px-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
          3D Oluştur
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={newChat}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Yeni sohbet
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Sohbet geçmişi
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex min-h-0 flex-1">
        {/* Canvas */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {/* Empty state */}
          {!conversion && currentFile.length === 0 && !isProcessing && (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">
                  {mode === '3d' ? 'Referans görsel ekle ve ürün detaylarını yaz' : 'GLB dosyası ekle ve ürün detaylarını yaz'}
                </p>
              </div>
            </div>
          )}

          {/* Source images grid */}
          {!conversion && mode === '3d' && sortedSourceAssets.length > 0 && !isProcessing && (
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {sortedSourceAssets.map((asset) => (
                  <div key={asset.storageKey} className="group relative overflow-hidden rounded-xl border border-gray-200">
                    <img src={asset.url} alt="" className="h-48 w-full object-cover" />
                    <button
                      onClick={() => setSourceAssets((p) => p.filter((a) => a.storageKey !== asset.storageKey))}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-gray-600 opacity-0 shadow transition-opacity hover:bg-white group-hover:opacity-100"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GLB file preview */}
          {!conversion && mode === 'glb' && glbAsset && !isProcessing && (
            <div className="p-6">
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <svg className="h-8 w-8 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{glbAsset.storageKey.split('/').pop()}</p>
                  <p className="text-xs text-gray-400">{(glbAsset.sizeBytes / 1024).toFixed(1)} KB · GLB</p>
                </div>
                <button onClick={() => setGlbAsset(null)} className="text-gray-400 hover:text-red-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Processing */}
          {isProcessing && (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-4 text-sm text-gray-400">3D model oluşturuluyor…</p>
              </div>
            </div>
          )}

          {/* Result */}
          {conversion && !isProcessing && (
            <div className="flex flex-1 flex-col p-6">
              <div className="overflow-hidden rounded-2xl bg-gray-100" style={{ height: '55vh' }}>
                {hasOutput ? (
                  <ModelViewer modelUrl={conversion.outputAsset!.url} className="h-full w-full" autoRotate />
                ) : (
                  <ModelViewerPlaceholder className="h-full" />
                )}
              </div>

              {conversion.qualityReport && (() => {
                const report = new QualityReport(conversion.qualityReport);
                const score = report.score();
                const isCritical = score < 40;
                const qa = conversion.qualityReport.geminiQaReport;
                return (
                  <div className={`mt-4 rounded-xl p-3 text-sm ${isCritical ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                    <p className="font-medium">Kalite puanı: {score}/100</p>
                    {qa?.categoryMatch && <p className="mt-1 text-xs opacity-80">Kategori: {qa.categoryMatch.score}/10 — {qa.categoryMatch.reason}</p>}
                    {(conversion.qualityReport.warnings.length > 0 || (qa?.missingParts.length ?? 0) > 0) && (
                      <ul className="mt-2 space-y-0.5 text-xs opacity-70">
                        {conversion.qualityReport.warnings.map((w) => <li key={w}>• {w}</li>)}
                        {qa?.missingParts.map((p) => <li key={p}>• Eksik: {p}</li>)}
                      </ul>
                    )}
                  </div>
                );
              })()}

              <div className="mt-4 flex justify-end gap-3">
                <button onClick={newChat} className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                  Yeni sohbet
                </button>
                <button
                  onClick={() => navigate(`/product/${conversion.id}`)}
                  className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  {conversion.status === 'failed' ? 'QA Raporunu İncele' : 'Ürünü İncele'}
                </button>
              </div>
            </div>
          )}

          {submitError && (
            <div className="mx-6 mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{submitError}</div>
          )}
        </div>

        {/* Right panel */}
        {(productDetails || conversion) && (
          <div className="hidden w-52 shrink-0 border-l border-gray-100 p-4 lg:block">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Şimdi</p>
            {productDetails && (
              <p className="text-xs leading-relaxed text-gray-600">{productDetails}</p>
            )}
            {currentFile.length > 0 && (
              <p className="mt-2 text-[11px] text-gray-400">{currentFile.length} dosya</p>
            )}
            {conversion && (
              <div className="mt-3">
                <StatusBadge status={conversion.status} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom input bar */}
      <div className="shrink-0 border-t border-gray-100 px-4 pb-4 pt-3">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
          {/* File thumbnails */}
          {currentFile.length > 0 && (
            <div className="mb-3 flex gap-2 overflow-x-auto">
              {mode === '3d' ? sortedSourceAssets.map((asset) => (
                <div key={asset.storageKey} className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-200">
                  <img src={asset.url} alt="" className="h-full w-full object-cover" />
                  <button
                    onClick={() => setSourceAssets((p) => p.filter((a) => a.storageKey !== asset.storageKey))}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )) : glbAsset ? (
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5">
                  <svg className="h-4 w-4 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                  </svg>
                  <span className="max-w-[120px] truncate text-xs text-gray-600">{glbAsset.storageKey.split('/').pop()}</span>
                  <button onClick={() => setGlbAsset(null)} className="text-gray-400 hover:text-red-500">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {/* Textarea */}
          <div className="flex items-end gap-3">
            <textarea
              ref={textareaRef}
              value={productDetails}
              onChange={(e) => { setProductDetails(e.target.value); autoResize(e.target); }}
              onKeyDown={handleKeyDown}
              placeholder="Oluştur veya düzenle..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              style={{ maxHeight: '120px' }}
            />
            <button
              onClick={startConversion}
              disabled={!canStart}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white transition-opacity disabled:opacity-25 hover:bg-gray-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
              </svg>
            </button>
          </div>

          {/* Referans button */}
          <div className="mt-2.5">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => { if (e.target.files) handleImageFiles(Array.from(e.target.files)); e.target.value = ''; }}
            />
            <input
              ref={glbInputRef}
              type="file"
              accept=".glb,model/gltf-binary"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleGlbFile(e.target.files[0]); e.target.value = ''; }}
            />
            <button
              onClick={() => mode === '3d' ? imageInputRef.current?.click() : glbInputRef.current?.click()}
              disabled={uploadingSource}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              {uploadingSource ? (
                <svg className="h-3 w-3 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
              ) : (
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                </svg>
              )}
              Referans
            </button>
          </div>
        </div>

        {/* Meta bar */}
        <div className="mt-2 flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            {/* Mode toggle */}
            <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
              <button
                onClick={() => setMode('3d')}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${mode === '3d' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                3D Model
              </button>
              <button
                onClick={() => setMode('glb')}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${mode === 'glb' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                GLB
              </button>
            </div>
            <span className="text-xs text-gray-400">Gemini Image Generation</span>
          </div>
          <button className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-[11px] text-gray-400 hover:bg-gray-50">
            ?
          </button>
        </div>
      </div>
    </div>
  );
}
