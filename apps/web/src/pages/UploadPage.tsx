import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  QualityReport,
  validateImageFile,
  validateModelFile,
  type ApiMediaAssetInput,
  type ConversionSnapshot,
  type MediaAsset,
  type ProductCategory,
} from '@minimalblock/core';
import { FileUpload, ModelViewer, ModelViewerPlaceholder, StatusBadge, Button, Spinner, Card } from '@minimalblock/ui';
import { useApp } from '../context/AppContext.js';
import type { SupabaseUser } from '../types.js';

interface UploadPageProps {
  user: SupabaseUser;
}

function toApiAsset(asset: MediaAsset): ApiMediaAssetInput {
  return {
    url: asset.url,
    storageKey: asset.storageKey,
    mimeType: asset.mimeType,
    sizeBytes: asset.sizeBytes,
  };
}

export function UploadPage({ user }: UploadPageProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { imageUploader, apiClient } = useApp();

  const [productDetails, setProductDetails] = useState('');
  const [sourceAssets, setSourceAssets] = useState<MediaAsset[]>([]);
  const [manualModelAsset, setManualModelAsset] = useState<MediaAsset | null>(null);
  const [uploadingSource, setUploadingSource] = useState(false);
  const [uploadingModel, setUploadingModel] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [conversion, setConversion] = useState<ConversionSnapshot | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canStart = sourceAssets.length > 0 && productDetails.trim().length > 0 && !submitting;
  const isPolling = conversion?.status === 'pending' || conversion?.status === 'processing';

  useEffect(() => {
    if (!conversion || !isPolling) return;
    const interval = window.setInterval(async () => {
      try {
        const response = await apiClient.getConversion(conversion.id);
        setConversion(response.conversion);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : 'Failed to refresh conversion.');
        window.clearInterval(interval);
      }
    }, 2500);
    return () => window.clearInterval(interval);
  }, [apiClient, conversion, isPolling]);

  const sortedSourceAssets = useMemo(
    () => [...sourceAssets].sort((a, b) => a.storageKey.localeCompare(b.storageKey)),
    [sourceAssets],
  );

  async function handleSourceFiles(files: File[]) {
    setSubmitError(null);
    setUploadingSource(true);
    try {
      const nextAssets: MediaAsset[] = [];
      for (const file of files) {
        const validation = validateImageFile(file);
        if (!validation.valid) throw new Error(validation.reason ?? 'Invalid source image.');
        const asset = await imageUploader.upload({ file, fileName: file.name, ownerId: user.id });
        nextAssets.push(asset);
      }
      setSourceAssets((current) => [...current, ...nextAssets]);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t('upload.uploadingSource'));
    } finally {
      setUploadingSource(false);
    }
  }

  async function handleManualModel(file: File) {
    setSubmitError(null);
    const validation = validateModelFile(file);
    if (!validation.valid) { setSubmitError(validation.reason ?? 'Invalid model file.'); return; }
    setUploadingModel(true);
    try {
      const asset = await imageUploader.upload({ file, fileName: file.name, ownerId: user.id });
      setManualModelAsset(asset);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Model upload failed.');
    } finally {
      setUploadingModel(false);
    }
  }

  async function startConversion() {
    if (!canStart) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const text = productDetails.trim();
      const firstLine = text.split('\n')[0]?.trim() ?? text;
      const response = await apiClient.createConversion({
        product: { name: firstLine, description: text, category: '' as ProductCategory },
        sourceAssets: sourceAssets.map(toApiAsset),
        manualModelAsset: manualModelAsset ? toApiAsset(manualModelAsset) : undefined,
      });
      const refreshed = await apiClient.getConversion(response.conversionId);
      setConversion(refreshed.conversion);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Conversion failed.');
    } finally {
      setSubmitting(false);
    }
  }

  function removeSourceAsset(storageKey: string) {
    setSourceAssets((current) => current.filter((asset) => asset.storageKey !== storageKey));
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-700">
        {t('upload.backGallery')}
      </button>

      {/* Main two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left — source images */}
        <Card>
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">{t('upload.sourceImages')}</h2>
              <p className="mt-1 text-xs text-gray-500">{t('upload.sourceImagesDesc')}</p>
            </div>
            <FileUpload
              multiple
              accept="image/jpeg,image/png,image/webp"
              helperText={t('upload.sourceHelperText')}
              onFilesSelected={handleSourceFiles}
              disabled={uploadingSource || submitting}
            />
            {uploadingSource && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Spinner size="sm" /> {t('upload.uploadingSource')}
              </div>
            )}
            {sortedSourceAssets.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sortedSourceAssets.map((asset) => (
                  <div key={asset.storageKey} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <img src={asset.url} alt={asset.storageKey} className="h-32 w-full object-cover" />
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-gray-900">{asset.storageKey.split('/').pop()}</p>
                        <p className="text-xs text-gray-400">{(asset.sizeBytes / 1024).toFixed(1)} KB</p>
                      </div>
                      <button onClick={() => removeSourceAsset(asset.storageKey)} className="text-xs text-red-500 hover:text-red-700">
                        {t('upload.remove')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Right — product details */}
        <Card>
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">3D Model Detayı</h2>
              <p className="mt-1 text-xs text-gray-500">
                Ürün adı, kategori ve açıklamayı serbest biçimde yazın. İlk satır ürün adı olarak kullanılır.
              </p>
            </div>

            <textarea
              rows={10}
              value={productDetails}
              onChange={(e) => setProductDetails(e.target.value)}
              placeholder={'Meşe yemek sandalyesi\nMobilya · Ahşap\n\nSağlam meşe gövde, saten çelik ayaklar. Yemek masası ve ofis kullanımına uygundur.'}
              className="block w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm leading-relaxed focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />

            {submitError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{submitError}</div>
            )}

            <Button
              onClick={startConversion}
              disabled={!canStart}
              loading={submitting}
              className="w-full"
            >
              {manualModelAsset ? t('upload.createReviewReady') : t('upload.startConversion')}
            </Button>
          </div>
        </Card>
      </div>

      {/* Manuel GLB — full width below */}
      <Card>
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">{t('upload.manualGlb')}</h2>
            <p className="mt-1 text-xs text-gray-500">{t('upload.manualGlbDesc')}</p>
          </div>
          <FileUpload
            accept=".glb,model/gltf-binary,application/octet-stream"
            helperText={t('upload.glbHelperText')}
            onFileSelected={handleManualModel}
            disabled={uploadingModel || submitting}
          />
          {uploadingModel && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Spinner size="sm" /> {t('upload.uploadingGlb')}
            </div>
          )}
          {manualModelAsset && (
            <div className="rounded-xl border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{manualModelAsset.storageKey.split('/').pop()}</p>
                  <p className="text-xs text-gray-400">{(manualModelAsset.sizeBytes / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={() => setManualModelAsset(null)} className="text-xs text-red-500 hover:text-red-700">
                  {t('upload.remove')}
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Conversion result */}
      {conversion && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{t('upload.conversionStatus')}</h2>
                <p className="mt-1 text-xs text-gray-500">{t('upload.conversionStatusDesc')}</p>
              </div>
              <StatusBadge status={conversion.status} />
            </div>

            <div className="h-80 overflow-hidden rounded-xl bg-gray-100">
              {conversion.outputAsset ? (
                <ModelViewer modelUrl={conversion.outputAsset.url} className="h-full" />
              ) : manualModelAsset ? (
                <ModelViewer modelUrl={manualModelAsset.url} className="h-full" />
              ) : (
                <ModelViewerPlaceholder className="h-full" />
              )}
            </div>

            {isPolling && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Spinner size="sm" /> {t('upload.waitingProcessing')}
              </div>
            )}

            {conversion.qualityReport && (() => {
              const report = new QualityReport(conversion.qualityReport);
              const score = report.score();
              const isCritical = score < 40;
              const qaReport = conversion.qualityReport.geminiQaReport;
              return (
                <div className={`rounded-xl p-3 text-sm ${isCritical ? 'bg-red-50 text-red-900' : 'bg-amber-50 text-amber-900'}`}>
                  <p className="font-medium">
                    {t('upload.assetQuality', { score })}
                    {qaReport && <span className="ml-2 font-normal text-xs">({qaReport.status.replace(/_/g, ' ')})</span>}
                  </p>
                  {qaReport?.categoryMatch && (
                    <p className="mt-1 text-xs">
                      {t('upload.categoryMatch', { score: qaReport.categoryMatch.score, reason: qaReport.categoryMatch.reason })}
                    </p>
                  )}
                  {(conversion.qualityReport.warnings.length > 0 || (qaReport?.missingParts.length ?? 0) > 0) && (
                    <ul className={`mt-2 space-y-1 text-xs ${isCritical ? 'text-red-800' : 'text-amber-800'}`}>
                      {conversion.qualityReport.warnings.map((warning) => (
                        <li key={warning}>• {warning}</li>
                      ))}
                      {qaReport?.missingParts.map((part) => (
                        <li key={part}>• {t('upload.missing', { part })}</li>
                      ))}
                    </ul>
                  )}
                  {qaReport?.recommendedActions && qaReport.recommendedActions.length > 0 && (
                    <ul className={`mt-2 space-y-1 text-xs font-medium ${isCritical ? 'text-red-800' : 'text-amber-800'}`}>
                      {qaReport.recommendedActions.map((action) => (
                        <li key={action}>→ {action}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })()}

            {conversion.errorMessage && !conversion.qualityReport?.geminiQaReport && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{conversion.errorMessage}</div>
            )}

            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="secondary" onClick={() => navigate('/')}>{t('upload.backToGallery')}</Button>
              <Button
                onClick={() => navigate(`/product/${conversion.id}`)}
                variant={conversion.status === 'failed' ? 'secondary' : 'primary'}
              >
                {conversion.status === 'failed' ? t('upload.reviewQa') : t('upload.openMerchantReview')}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
