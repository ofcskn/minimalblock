import { renderHook, act, waitFor } from '@testing-library/react';
import { useGallery } from './use-gallery.js';
import { Conversion, MediaAsset, ConversionStatus } from '@minimalblock/core';
import type { IConversionRepository } from '@minimalblock/core';

function makeConversion(id: string, status: 'pending' | 'processing' | 'completed' | 'failed' = 'completed'): Conversion {
  const sourceAsset = new MediaAsset({ url: 'https://cdn/img.jpg', storageKey: 'u1/img.jpg', mimeType: 'image/jpeg', kind: 'source-image', sizeBytes: 1024 });
  return new Conversion({
    id,
    productId: 'prod-1',
    ownerId: 'user-1',
    sourceAsset,
    status: ConversionStatus.from(status),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeRepo(overrides: Partial<IConversionRepository> = {}): IConversionRepository {
  return {
    findById: jest.fn().mockResolvedValue(null),
    findByProductId: jest.fn().mockResolvedValue([]),
    findByOwnerId: jest.fn().mockResolvedValue([makeConversion('c-1'), makeConversion('c-2')]),
    save: jest.fn().mockImplementation(async (c: Conversion) => c),
    delete: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('useGallery', () => {
  it('starts in loading state', () => {
    const { result } = renderHook(() => useGallery(makeRepo(), 'user-1'));
    expect(result.current.loading).toBe(true);
    expect(result.current.conversions).toHaveLength(0);
  });

  it('loads conversions from the repository', async () => {
    const { result } = renderHook(() => useGallery(makeRepo(), 'user-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.conversions).toHaveLength(2);
  });

  it('sets error when repository throws', async () => {
    const repo = makeRepo({ findByOwnerId: jest.fn().mockRejectedValue(new Error('DB down')) });
    const { result } = renderHook(() => useGallery(repo, 'user-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('DB down');
    expect(result.current.conversions).toHaveLength(0);
  });

  it('remove deletes from repo and removes from local state', async () => {
    const repo = makeRepo();
    const { result } = renderHook(() => useGallery(repo, 'user-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.remove('c-1');
    });

    expect(repo.delete).toHaveBeenCalledWith('c-1');
    expect(result.current.conversions.find(c => c.id === 'c-1')).toBeUndefined();
    expect(result.current.conversions).toHaveLength(1);
  });

  it('loads only conversions owned by ownerId', async () => {
    const repo = makeRepo();
    renderHook(() => useGallery(repo, 'user-1'));
    await waitFor(() => {
      expect(repo.findByOwnerId).toHaveBeenCalledWith('user-1');
    });
  });
});
