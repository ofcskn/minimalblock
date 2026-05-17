import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGallery, type UseGalleryState } from '@minimalblock/features';
import type { Product } from '@minimalblock/core';
import type {
  EmptyStateAction,
  GalleryModel,
  RequirementItem,
} from '@minimalblock/ui';
import {
  ModelViewer,
  ModelViewerPlaceholder,
  StatusBadge,
  Button,
  Spinner,
  Modal,
} from '@minimalblock/ui';
import { useApp } from '../context/AppContext.js';
import type { SupabaseUser } from '../types.js';
import { GalleryEmptyState } from './gallery/GalleryEmptyState.js';
import { GalleryToolbar } from './gallery/GalleryToolbar.js';
import { PageHeader } from './gallery/PageHeader.js';

interface GalleryPageProps {
  user: SupabaseUser;
}

const PAGE_SIZE = 12;

function mapStatus(status: string): 'ready' | 'processing' | 'failed' {
  if (status === 'completed' || status === 'approved') return 'ready';
  if (status === 'failed' || status === 'rejected') return 'failed';
  return 'processing';
}

function toGalleryModel(
  conversion: UseGalleryState['conversions'][number],
  product?: Product,
): GalleryModel {
  const modelUrl = conversion.outputAsset?.url;
  return {
    id: conversion.id,
    productId: conversion.productId,
    name:
      product?.name ??
      conversion.sourceAsset.storageKey.split('/').pop() ??
      'Untitled product',
    category: product?.category,
    status: conversion.status.value,
    previewUrl: conversion.sourceAsset.url,
    modelUrl,
    hotspotCount: product?.hotspots.length ?? 0,
    errorMessage: conversion.errorMessage,
  };
}

export function GalleryPage({ user }: GalleryPageProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { conversionRepo, productRepo } = useApp();
  const { conversions, loading, error, removeProduct } = useGallery(
    conversionRepo,
    productRepo,
    user.id,
  );

  const [products, setProducts] = useState<Map<string, Product>>(new Map());
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(PAGE_SIZE);
  const [pendingDeleteProductId, setPendingDeleteProductId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    productRepo.findByOwnerId(user.id).then((list) => {
      setProducts(new Map(list.map((product) => [product.id, product])));
    });
  }, [productRepo, user.id, conversions]);

  const galleryModels = useMemo(
    () => conversions.map((conversion) => toGalleryModel(conversion, products.get(conversion.productId))),
    [conversions, products],
  );

  const filteredModels = useMemo(() => {
    const visible = galleryModels.filter((model) => {
      if (statusFilter === 'all') return true;
      return mapStatus(model.status) === statusFilter;
    });
    return [...visible].sort((left, right) => {
      switch (sortBy) {
        case 'name': return left.name.localeCompare(right.name);
        case 'status': return mapStatus(left.status).localeCompare(mapStatus(right.status));
        case 'oldest': return left.id.localeCompare(right.id);
        case 'newest':
        default: return right.id.localeCompare(left.id);
      }
    });
  }, [galleryModels, sortBy, statusFilter]);

  const visibleModels = filteredModels.slice(0, page);
  const hasMore = filteredModels.length > page;

  async function confirmDelete() {
    if (!pendingDeleteProductId) return;
    setDeleting(true);
    await removeProduct(pendingDeleteProductId);
    setDeleting(false);
    setPendingDeleteProductId(null);
  }

  const handlePageAction = (actionId: string) => {
    if (actionId === 'upload-product-photo') {
      navigate('/upload');
      return;
    }
    navigate('/dashboard');
  };

  const handleViewRequirements = () => {
    const checklist = document.getElementById('gallery-requirements');
    if (checklist) {
      checklist.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    navigate('/upload');
  };

  const emptyStateActions: EmptyStateAction[] = [
    { id: 'upload-product-photo', label: t('gallery.emptyActions.uploadPhoto'), tone: 'primary' },
    { id: 'learn-3d-generation', label: t('gallery.emptyActions.learn3d'), tone: 'secondary' },
  ];

  const requirementItems: RequirementItem[] = [
    { id: 'clear-photo', label: t('gallery.requirements.clearPhoto'), description: t('gallery.requirements.clearPhotoDesc') },
    { id: 'plain-background', label: t('gallery.requirements.plainBackground'), description: t('gallery.requirements.plainBackgroundDesc') },
    { id: 'jpg-or-png', label: t('gallery.requirements.jpgOrPng'), description: t('gallery.requirements.jpgOrPngDesc') },
    { id: 'resolution', label: t('gallery.requirements.resolution'), description: t('gallery.requirements.resolutionDesc') },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
        <Spinner size="lg" label={t('gallery.loading')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        <PageHeader
          title={t('gallery.title')}
          description={t('gallery.description')}
          primaryActionLabel={t('gallery.uploadPhoto')}
          secondaryActionLabel={t('gallery.viewRequirements')}
          onPrimaryAction={() => navigate('/upload')}
          onSecondaryAction={handleViewRequirements}
        />

        <GalleryToolbar
          status={statusFilter}
          sort={sortBy}
          view={viewMode}
          onStatusChange={(value) => { setStatusFilter(value); setPage(PAGE_SIZE); }}
          onSortChange={setSortBy}
          onViewChange={setViewMode}
        />

        {galleryModels.length === 0 ? (
          <GalleryEmptyState
            title={t('gallery.noModelsYet.title')}
            description={t('gallery.noModelsYet.description')}
            actions={emptyStateActions}
            requirements={requirementItems}
            onAction={handlePageAction}
          />
        ) : filteredModels.length === 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              {t('gallery.noMatch.title')}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {t('gallery.noMatch.description')}
            </p>
          </section>
        ) : (
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div
              className={
                viewMode === 'grid'
                  ? 'grid gap-4 md:grid-cols-2 xl:grid-cols-3'
                  : 'space-y-4'
              }
            >
              {visibleModels.map((model) => {
                const isReady = mapStatus(model.status) === 'ready' && !!model.modelUrl;
                return (
                  <article
                    key={model.id}
                    className={
                      'overflow-hidden rounded-2xl border border-slate-200 bg-white transition-colors hover:border-slate-300 ' +
                      (viewMode === 'list' ? 'flex flex-col gap-4 p-4 md:flex-row' : '')
                    }
                  >
                    <button
                      type="button"
                      onClick={() => navigate(`/product/${model.id}`)}
                      className={
                        'group text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ' +
                        (viewMode === 'list' ? 'flex min-w-0 flex-1 flex-col gap-4 md:flex-row' : 'block')
                      }
                    >
                      <div
                        className={
                          'relative overflow-hidden bg-slate-100 ' +
                          (viewMode === 'list' ? 'h-48 rounded-2xl md:h-40 md:w-56' : 'aspect-[4/3] w-full')
                        }
                      >
                        {isReady && model.modelUrl ? (
                          <ModelViewer modelUrl={model.modelUrl} className="h-full" />
                        ) : model.previewUrl ? (
                          <img src={model.previewUrl} alt={model.name} className="h-full w-full object-cover" />
                        ) : (
                          <ModelViewerPlaceholder className="h-full" />
                        )}

                        <div className="absolute left-3 top-3 flex items-center gap-2">
                          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-slate-700 backdrop-blur">
                            {model.category ?? t('gallery.uncategorized')}
                          </span>
                          {isReady && (
                            <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-[11px] font-medium text-white">
                              {t('gallery.ready3d')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col p-4 pt-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="truncate text-base font-semibold text-slate-900">
                              {model.name}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                              {model.hotspotCount > 0
                                ? t('gallery.hotspotsCount_one', { count: model.hotspotCount })
                                : t('gallery.noHotspots')}
                            </p>
                          </div>
                          <StatusBadge status={model.status} />
                        </div>

                        {model.errorMessage && (
                          <p className="mt-3 text-sm text-red-600">{model.errorMessage}</p>
                        )}

                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                          <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                            {mapStatus(model.status)}
                          </span>
                          <span className="text-sm text-indigo-600 transition-colors group-hover:text-indigo-700">
                            {t('gallery.openDetails')}
                          </span>
                        </div>
                      </div>
                    </button>

                    <div className={viewMode === 'list' ? 'md:self-start' : 'px-4 pb-4'}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPendingDeleteProductId(model.productId)}
                        className="min-h-11 rounded-xl px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        {t('gallery.delete')}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>

            {hasMore && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="secondary"
                  onClick={() => setPage((currentPage) => currentPage + PAGE_SIZE)}
                  className="min-h-11 rounded-xl border-slate-200 px-4 text-slate-700 hover:bg-slate-50"
                >
                  {t('gallery.loadMore')}
                </Button>
              </div>
            )}
          </section>
        )}
      </div>

      <Modal
        open={pendingDeleteProductId !== null}
        onClose={() => setPendingDeleteProductId(null)}
        title={t('gallery.deleteModal.title')}
      >
        <p className="text-sm text-gray-600">{t('gallery.deleteModal.description')}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setPendingDeleteProductId(null)} disabled={deleting}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={confirmDelete} loading={deleting}>
            {t('common.delete')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
