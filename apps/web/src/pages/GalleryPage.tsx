import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGallery } from '@minimalblock/features';
import type { Product, ProductCategory } from '@minimalblock/core';
import { ModelViewer, ModelViewerPlaceholder, StatusBadge, Button, Spinner, Card, Modal } from '@minimalblock/ui';
import { useApp } from '../context/AppContext.js';
import type { SupabaseUser } from '../types.js';

interface GalleryPageProps {
  user: SupabaseUser;
}

const PAGE_SIZE = 12;

const CATEGORY_TABS: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'home-decor', label: 'Home Decor' },
  { value: 'bags', label: 'Bags' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'other', label: 'Other' },
];

export function GalleryPage({ user }: GalleryPageProps) {
  const { conversionRepo, productRepo } = useApp();
  const { conversions, loading, error, removeProduct } = useGallery(conversionRepo, productRepo, user.id);
  const navigate = useNavigate();

  const [products, setProducts] = useState<Map<string, Product>>(new Map());
  const [category, setCategory] = useState<ProductCategory | 'all'>('all');
  const [page, setPage] = useState(PAGE_SIZE);
  const [pendingDeleteProductId, setPendingDeleteProductId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    productRepo.findByOwnerId(user.id).then(list => {
      setProducts(new Map(list.map(p => [p.id, p])));
    });
  }, [productRepo, user.id, conversions]);

  async function confirmDelete() {
    if (!pendingDeleteProductId) return;
    setDeleting(true);
    await removeProduct(pendingDeleteProductId);
    setDeleting(false);
    setPendingDeleteProductId(null);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" label="Loading gallery…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
    );
  }

  if (conversions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 rounded-full bg-indigo-50 p-6">
          <svg className="h-10 w-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">No 3D models yet</h2>
        <p className="mt-2 text-sm text-gray-500">Upload a product photo to generate your first 3D model.</p>
        <Button className="mt-6" onClick={() => navigate('/upload')}>Upload product photo</Button>
      </div>
    );
  }

  const filtered = conversions.filter(c =>
    category === 'all' || products.get(c.productId)?.category === category
  );
  const visible = filtered.slice(0, page);
  const hasMore = filtered.length > page;

  return (
    <>
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My 3D Models</h1>
          <Button onClick={() => navigate('/upload')}>+ New conversion</Button>
        </div>

        {/* Category filter tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => { setCategory(tab.value); setPage(PAGE_SIZE); }}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                category === tab.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            No models in this category yet.
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map(conversion => {
                const product = products.get(conversion.productId);
                const hotspotCount = product?.hotspots.length ?? 0;
                const hasGlb = conversion.status.isViewable() && !!conversion.outputAsset;

                return (
                  <Card
                    key={conversion.id}
                    className="overflow-hidden p-0 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/product/${conversion.id}`)}
                  >
                    <div className="h-56 bg-gray-100 relative">
                      {hasGlb ? (
                        <ModelViewer modelUrl={conversion.outputAsset!.url} className="h-full" />
                      ) : (
                        <ModelViewerPlaceholder className="h-full" />
                      )}

                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex gap-1.5">
                        {hasGlb && (
                          <span className="rounded-full bg-indigo-600/90 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                            AR
                          </span>
                        )}
                        {hotspotCount > 0 && (
                          <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-gray-700 backdrop-blur-sm">
                            {hotspotCount} {hotspotCount === 1 ? 'hotspot' : 'hotspots'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {product?.name ?? conversion.sourceAsset.storageKey.split('/').pop() ?? 'Product'}
                        </p>
                        <StatusBadge status={conversion.status.value} />
                      </div>

                      {product?.category && (
                        <p className="mt-0.5 text-xs text-gray-400 capitalize">{product.category}</p>
                      )}

                      {conversion.status.isFailed() && conversion.errorMessage && (
                        <p className="mt-1 text-xs text-red-600">{conversion.errorMessage}</p>
                      )}

                      <div className="mt-3 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={e => { e.stopPropagation(); setPendingDeleteProductId(conversion.productId); }}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button variant="secondary" onClick={() => setPage(p => p + PAGE_SIZE)}>
                  Load more ({filtered.length - page} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        open={pendingDeleteProductId !== null}
        onClose={() => setPendingDeleteProductId(null)}
        title="Delete product"
      >
        <p className="text-sm text-gray-600">
          This will permanently delete the product, its 3D model, and all interaction history. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setPendingDeleteProductId(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} loading={deleting}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
