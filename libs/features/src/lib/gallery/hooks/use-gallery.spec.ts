import { renderHook, act, waitFor } from '@testing-library/react';
import { useGallery } from './use-gallery.js';
import { Conversion, MediaAsset, ConversionStatus } from '@minimalblock/core';
import type { IConversionRepository, IProductRepository } from '@minimalblock/core';

function makeConversion(id: string, productId = 'prod-1', status: 'pending' | 'processing' | 'completed' | 'failed' = 'completed'): Conversion {
  const sourceAsset = new MediaAsset({ url: 'https://cdn/img.jpg', storageKey: 'u1/img.jpg', mimeType: 'image/jpeg', kind: 'source-image', sizeBytes: 1024 });
  return new Conversion({
    id,
    productId,
    ownerId: 'user-1',
    sourceAsset,
    status: ConversionStatus.from(status),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeConversionRepo(overrides: Partial<IConversionRepository> = {}): IConversionRepository {
  return {
    findById: jest.fn().mockResolvedValue(null),
    findByProductId: jest.fn().mockResolvedValue([]),
    findByOwnerId: jest.fn().mockResolvedValue([makeConversion('c-1', 'prod-1'), makeConversion('c-2', 'prod-2')]),
    save: jest.fn().mockImplementation(async (c: Conversion) => c),
    delete: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeProductRepo(overrides: Partial<IProductRepository> = {}): IProductRepository {
  return {
    findById: jest.fn().mockResolvedValue(null),
    findByOwnerId: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockResolvedValue(null),
    delete: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('useGallery', () => {
  it('starts in loading state', () => {
    const pendingRepo = makeConversionRepo({
      findByOwnerId: jest.fn().mockImplementation(() => new Promise(() => undefined)),
    });
    const { result, unmount } = renderHook(() => useGallery(pendingRepo, makeProductRepo(), 'user-1'));
    expect(result.current.loading).toBe(true);
    expect(result.current.conversions).toHaveLength(0);
    unmount();
  });

  it('loads conversions from the repository', async () => {
    const { result } = renderHook(() => useGallery(makeConversionRepo(), makeProductRepo(), 'user-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.conversions).toHaveLength(2);
  });

  it('sets error when repository throws', async () => {
    const repo = makeConversionRepo({ findByOwnerId: jest.fn().mockRejectedValue(new Error('DB down')) });
    const { result } = renderHook(() => useGallery(repo, makeProductRepo(), 'user-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('DB down');
    expect(result.current.conversions).toHaveLength(0);
  });

  it.skip('removeProduct deletes from productRepo and removes conversions from local state', async () => {
    const productRepo = makeProductRepo();
    const { result } = renderHook(() => useGallery(makeConversionRepo(), productRepo, 'user-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await result.current.removeProduct('prod-1');
    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => expect(result.current.conversions).toHaveLength(1));
    expect(productRepo.delete).toHaveBeenCalledWith('prod-1');
    expect(result.current.conversions.find(c => c.productId === 'prod-1')).toBeUndefined();
    expect(result.current.conversions).toHaveLength(1);
  });

  it('loads only conversions owned by ownerId', async () => {
    const repo = makeConversionRepo();
    renderHook(() => useGallery(repo, makeProductRepo(), 'user-1'));
    await waitFor(() => {
      expect(repo.findByOwnerId).toHaveBeenCalledWith('user-1');
    });
  });
});
