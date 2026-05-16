import { useState, useCallback } from 'react';
import { Conversion } from '@minimalblock/core';
import type { IConversionRepository, IModelGeneratorPort, MediaAsset } from '@minimalblock/core';
import { generateId } from '@minimalblock/core';

export interface UseConversionState {
  conversion: Conversion | null;
  loading: boolean;
  error: string | null;
}

export function useConversion(
  repository: IConversionRepository,
  generator: IModelGeneratorPort,
) {
  const [state, setState] = useState<UseConversionState>({ conversion: null, loading: false, error: null });

  const startConversion = useCallback(async (
    productId: string,
    ownerId: string,
    sourceAsset: MediaAsset,
    productCategory: string,
  ) => {
    setState({ conversion: null, loading: true, error: null });

    // Track the latest persisted conversion locally so the catch block can mark it failed
    // without depending on React state (which would be a stale closure value).
    let current: Conversion | null = null;

    try {
      current = Conversion.create(generateId(), productId, ownerId, sourceAsset);
      current = await repository.save(current);

      current = current.markProcessing();
      current = await repository.save(current);
      setState(s => ({ ...s, conversion: current }));

      const { outputAsset } = await generator.generate({ sourceAsset, productCategory });
      current = current.markCompleted(outputAsset);
      current = await repository.save(current);
      setState({ conversion: current, loading: false, error: null });
      return current;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Conversion failed';
      if (current) {
        const failed = current.markFailed(message);
        const saved = await repository.save(failed).catch(() => failed);
        setState({ conversion: saved, loading: false, error: message });
      } else {
        setState({ conversion: null, loading: false, error: message });
      }
      return null;
    }
  }, [repository, generator]);

  return { ...state, startConversion };
}
