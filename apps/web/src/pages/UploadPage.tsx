import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PRODUCT_CATEGORIES,
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
  const { imageUploader, apiClient } = useApp();

  const [category, setCategory] = useState<ProductCategory>('furniture');
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [sourceAssets, setSourceAssets] = useState<MediaAsset[]>([]);
  const [manualModelAsset, setManualModelAsset] = useState<MediaAsset | null>(null);
  const [uploadingSource, setUploadingSource] = useState(false);
  const [uploadingModel, setUploadingModel] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [conversion, setConversion] = useState<ConversionSnapshot | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canStart = sourceAssets.length > 0 && productName.trim().length > 0 && !submitting;
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
        if (!validation.valid) {
          throw new Error(validation.reason ?? 'Invalid source image.');
        }
        const asset = await imageUploader.upload({ file, fileName: file.name, ownerId: user.id });
        nextAssets.push(asset);
      }
      setSourceAssets((current) => [...current, ...nextAssets]);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setUploadingSource(false);
    }
  }

  async function handleManualModel(file: File) {
    setSubmitError(null);
    const validation = validateModelFile(file);
    if (!validation.valid) {
      setSubmitError(validation.reason ?? 'Invalid model file.');
      return;
    }

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
      const response = await apiClient.createConversion({
        product: {
          name: productName.trim(),
          description: description.trim(),
          category,
        },
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
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-700">← Gallery</button>
        <h1 className="text-2xl font-bold text-gray-900">New Product Conversion</h1>
      </div>

      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Product name</label>
            <input
              type="text"
              value={productName}
              onChange={(event) => setProductName(event.target.value)}
              placeholder="e.g. Oak dining chair"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as ProductCategory)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {PRODUCT_CATEGORIES.map((value) => (
                <option key={value} value={value}>{categoryLabel(value)}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional merchant notes or PDP description"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Source images</h2>
            <p className="mt-1 text-xs text-gray-500">Upload multiple product angles. The API will use these as the source of truth for Gemini analysis and 3D generation.</p>
          </div>
          <FileUpload
            multiple
            accept="image/jpeg,image/png,image/webp"
            helperText="JPEG, PNG, WebP — upload as many angles as you have"
            onFilesSelected={handleSourceFiles}
            disabled={uploadingSource || submitting}
          />
          {uploadingSource && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Spinner size="sm" /> Uploading source images…
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
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Manual GLB fallback</h2>
            <p className="mt-1 text-xs text-gray-500">Optional. Upload a fallback GLB if you want to skip generation risk and go straight to merchant review.</p>
          </div>
          <FileUpload
            accept=".glb,model/gltf-binary,application/octet-stream"
            helperText="GLB — optional fallback model for demo reliability"
            onFileSelected={handleManualModel}
            disabled={uploadingModel || submitting}
          />
          {uploadingModel && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Spinner size="sm" /> Uploading fallback GLB…
            </div>
          )}
          {manualModelAsset && (
            <div className="rounded-xl border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{manualModelAsset.storageKey.split('/').pop()}</p>
                  <p className="text-xs text-gray-400">{(manualModelAsset.sizeBytes / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={() => setManualModelAsset(null)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {submitError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{submitError}</div>
      )}

      {!conversion ? (
        <div className="flex justify-end">
          <Button onClick={startConversion} disabled={!canStart} loading={submitting}>
            {manualModelAsset ? 'Create review-ready product' : 'Start Gemini conversion'}
          </Button>
        </div>
      ) : (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Conversion status</h2>
                <p className="mt-1 text-xs text-gray-500">This product is now being managed by the API workflow.</p>
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
                <Spinner size="sm" /> Waiting for API processing…
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
                    Asset quality score: {score}/100
                    {qaReport && <span className="ml-2 font-normal text-xs">({qaReport.status.replace(/_/g, ' ')})</span>}
                  </p>
                  {qaReport?.categoryMatch && (
                    <p className="mt-1 text-xs">
                      Category match: {qaReport.categoryMatch.score}/10 — {qaReport.categoryMatch.reason}
                    </p>
                  )}
                  {(conversion.qualityReport.warnings.length > 0 || (qaReport?.missingParts.length ?? 0) > 0) && (
                    <ul className={`mt-2 space-y-1 text-xs ${isCritical ? 'text-red-800' : 'text-amber-800'}`}>
                      {conversion.qualityReport.warnings.map((warning) => (
                        <li key={warning}>• {warning}</li>
                      ))}
                      {qaReport?.missingParts.map((part) => (
                        <li key={part}>• Missing: {part}</li>
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

            {conversion.errorMessage && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{conversion.errorMessage}</div>
            )}

            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="secondary" onClick={() => navigate('/')}>Back to gallery</Button>
              <Button
                onClick={() => navigate(`/product/${conversion.id}`)}
                variant={conversion.status === 'failed' ? 'secondary' : 'primary'}
              >
                {conversion.status === 'failed' ? 'Review QA report' : 'Open merchant review'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
