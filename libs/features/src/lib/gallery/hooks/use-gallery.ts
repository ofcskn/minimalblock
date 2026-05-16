import { useState, useEffect, useRef } from 'react';
import { Conversion } from '@minimalblock/core';
import type { IConversionRepository, IProductRepository } from '@minimalblock/core';

const POLL_INTERVAL_MS = 3000;

export interface UseGalleryState {
  conversions: Conversion[];
  loading: boolean;
  error: string | null;
}

export function useGallery(
  conversionRepo: IConversionRepository,
  productRepo: IProductRepository,
  ownerId: string,
) {
  const [state, setState] = useState<UseGalleryState>({ conversions: [], loading: true, error: null });
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function hasNonTerminal(list: Conversion[]) {
    return list.some(c => !c.status.isTerminal());
  }

  function scheduleRefresh(list: Conversion[]) {
    if (!hasNonTerminal(list)) return;
    pollTimerRef.current = setTimeout(async () => {
      try {
        const fresh = await conversionRepo.findByOwnerId(ownerId);
        setState(s => ({ ...s, conversions: fresh }));
        scheduleRefresh(fresh);
      } catch {
        // silently ignore poll errors
      }
    }, POLL_INTERVAL_MS);
  }

  useEffect(() => {
    let cancelled = false;

    conversionRepo.findByOwnerId(ownerId).then(conversions => {
      if (cancelled) return;
      setState({ conversions, loading: false, error: null });
      scheduleRefresh(conversions);
    }).catch(err => {
      if (!cancelled) setState({ conversions: [], loading: false, error: err instanceof Error ? err.message : 'Failed to load' });
    });

    return () => {
      cancelled = true;
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversionRepo, ownerId]);

  const removeProduct = async (productId: string) => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    await productRepo.delete(productId);
    setState(s => {
      const updated = s.conversions.filter(c => c.productId !== productId);
      scheduleRefresh(updated);
      return { ...s, conversions: updated };
    });
  };

  return { ...state, removeProduct };
}
