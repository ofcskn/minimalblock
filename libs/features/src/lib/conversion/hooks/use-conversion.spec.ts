import { renderHook, act, waitFor } from '@testing-library/react';
import { useConversion } from './use-conversion.js';
import { Conversion, MediaAsset, ConversionStatus } from '@minimalblock/core';
import type { IConversionRepository, IModelGeneratorPort } from '@minimalblock/core';

const sourceAsset = new MediaAsset({
  url: 'https://cdn/img.jpg',
  storageKey: 'u1/img.jpg',
  mimeType: 'image/jpeg',
  kind: 'source-image',
  sizeBytes: 2048,
});

const outputAsset = new MediaAsset({
  url: 'https://cdn/model.glb',
  storageKey: 'u1/model.glb',
  mimeType: 'model/gltf-binary',
  kind: 'generated-model',
  sizeBytes: 512000,
});

function makeConversion(id: string, status: 'pending' | 'processing' | 'completed' | 'failed'): Conversion {
  return new Conversion({ id, productId: 'prod-1', ownerId: 'user-1', sourceAsset, status: ConversionStatus.from(status), createdAt: new Date(), updatedAt: new Date() });
}

function makeRepo(overrides: Partial<IConversionRepository> = {}): IConversionRepository {
  const saved: Record<string, Conversion> = {};
  return {
    findById: jest.fn().mockImplementation(async (id: string) => saved[id] ?? null),
    findByProductId: jest.fn().mockResolvedValue([]),
    findByOwnerId: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockImplementation(async (c: Conversion) => { saved[c.id] = c; return c; }),
    delete: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeGenerator(overrides: Partial<IModelGeneratorPort> = {}): IModelGeneratorPort {
  return {
    generate: jest.fn().mockResolvedValue({ outputAsset, tokensUsed: 100 }),
    ...overrides,
  };
}

describe('useConversion', () => {
  it('initialises with empty state', () => {
    const { result } = renderHook(() => useConversion(makeRepo(), makeGenerator()));
    expect(result.current.conversion).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('runs the full pending → processing → completed pipeline', async () => {
    const repo = makeRepo();
    const generator = makeGenerator();
    const { result } = renderHook(() => useConversion(repo, generator));

    await act(async () => {
      await result.current.startConversion('prod-1', 'user-1', sourceAsset, 'furniture');
    });

    expect(result.current.conversion?.status.isCompleted()).toBe(true);
    expect(result.current.conversion?.outputAsset).toBe(outputAsset);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(repo.save).toHaveBeenCalledTimes(3);
  });

  it('saves processing state before calling the generator', async () => {
    const saveOrder: string[] = [];
    const repo = makeRepo({
      save: jest.fn().mockImplementation(async (c: Conversion) => {
        saveOrder.push(c.status.value);
        return c;
      }),
    });

    const { result } = renderHook(() => useConversion(repo, makeGenerator()));

    await act(async () => {
      await result.current.startConversion('prod-1', 'user-1', sourceAsset, 'furniture');
    });

    expect(saveOrder[0]).toBe('pending');
    expect(saveOrder[1]).toBe('processing');
    expect(saveOrder[2]).toBe('completed');
  });

  it('sets error and failed status when generator throws', async () => {
    const generator = makeGenerator({ generate: jest.fn().mockRejectedValue(new Error('Gemini quota exceeded')) });
    const { result } = renderHook(() => useConversion(makeRepo(), generator));

    await act(async () => {
      await result.current.startConversion('prod-1', 'user-1', sourceAsset, 'other');
    });

    expect(result.current.error).toBe('Gemini quota exceeded');
    expect(result.current.loading).toBe(false);
  });
});
