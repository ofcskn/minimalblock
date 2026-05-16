import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpload, useConversion } from '@minimalblock/features';
import { Product, validateImageFile, generateId } from '@minimalblock/core';
import { FileUpload, ModelViewer, ModelViewerPlaceholder, StatusBadge, Button, Spinner, Card } from '@minimalblock/ui';
import { useApp } from '../context/AppContext.js';
import type { ProductCategory } from '@minimalblock/core';
import type { SupabaseUser } from '../types.js';

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'furniture', label: 'Furniture' },
  { value: 'appliance', label: 'Appliance' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'house', label: 'House / Building' },
  { value: 'other', label: 'Other' },
];

interface UploadPageProps {
  user: SupabaseUser;
}

export function UploadPage({ user }: UploadPageProps) {
  const navigate = useNavigate();
  const { imageUploader, conversionRepo, modelGenerator, productRepo } = useApp();

  const [category, setCategory] = useState<ProductCategory>('other');
  const [productName, setProductName] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);

  const { uploading, asset, error: uploadError, upload, reset } = useUpload(imageUploader, user.id);
  const { conversion, loading: converting, error: convError, startConversion } = useConversion(conversionRepo, modelGenerator);

  async function handleFile(file: File) {
    setFileError(null);
    const validation = validateImageFile(file);
    if (!validation.valid) { setFileError(validation.reason ?? 'Invalid file'); return; }
    await upload(file);
  }

  async function handleConvert() {
    if (!asset) return;
    const name = productName.trim() || 'Untitled product';

    const now = new Date();
    const product = await productRepo.save(
      new Product({ id: generateId(), name, description: '', category, ownerId: user.id, hotspots: [], createdAt: now, updatedAt: now })
    );

    await startConversion(product.id, user.id, asset, category);
  }

  const error = fileError ?? uploadError ?? convError;
  const isProcessing = uploading || converting;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-700">← Gallery</button>
        <h1 className="text-2xl font-bold text-gray-900">New 3D Conversion</h1>
      </div>

      {!asset && !conversion && (
        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product name (optional)</label>
              <input
                type="text"
                value={productName}
                onChange={e => setProductName(e.target.value)}
                placeholder="e.g. Oak dining chair"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ProductCategory)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <FileUpload onFileSelected={handleFile} disabled={isProcessing} />
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Spinner size="sm" /> Uploading image…
              </div>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </Card>
      )}

      {asset && !conversion && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={asset.url} alt="Uploaded product" className="h-20 w-20 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{asset.storageKey.split('/').pop()}</p>
                <p className="text-xs text-gray-500">{(asset.sizeBytes / 1024).toFixed(1)} KB · {asset.mimeType}</p>
              </div>
              <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600">Change</button>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button onClick={handleConvert} loading={converting} className="w-full justify-center">
              {converting ? 'Generating 3D model…' : 'Generate 3D model'}
            </Button>
          </div>
        </Card>
      )}

      {conversion && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Conversion result</h2>
              <StatusBadge status={conversion.status.value} />
            </div>

            {converting && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Spinner size="sm" /> Generating 3D model — this takes 10–20 seconds…
              </div>
            )}

            {conversion.status.isCompleted() && conversion.outputAsset ? (
              <div className="h-80 rounded-xl overflow-hidden">
                <ModelViewer modelUrl={conversion.outputAsset.url} className="h-full" />
              </div>
            ) : conversion.status.isFailed() ? (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {conversion.errorMessage ?? 'Conversion failed. Please try again.'}
              </div>
            ) : (
              <ModelViewerPlaceholder className="h-64" />
            )}

            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => navigate('/')}>Back to gallery</Button>
              {(conversion.status.isFailed() || conversion.status.isCompleted()) && (
                <Button onClick={() => { reset(); }}>Try another</Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
