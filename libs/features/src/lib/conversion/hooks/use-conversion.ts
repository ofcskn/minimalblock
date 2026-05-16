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
    try {
      let conversion = Conversion.create(generateId(), productId, ownerId, sourceAsset);
      conversion = await repository.save(conversion);

      conversion = conversion.markProcessing();
      await repository.save(conversion);
      setState(s => ({ ...s, conversion }));

      const { outputAsset } = await generator.generate({ sourceAsset, productCategory });
      conversion = conversion.markCompleted(outputAsset);
      conversion = await repository.save(conversion);
      setState({ conversion, loading: false, error: null });
      return conversion;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Conversion failed';
      if (state.conversion) {
        const failed = state.conversion.markFailed(message);
        await repository.save(failed).catch(() => null);
        setState({ conversion: failed, loading: false, error: message });
      } else {
        setState({ conversion: null, loading: false, error: message });
      }
      return null;
    }
  }, [repository, generator, state.conversion]);

  return { ...state, startConversion };
}
