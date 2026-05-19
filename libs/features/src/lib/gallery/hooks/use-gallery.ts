import { useState, useEffect, useRef } from 'react';
import { Conversion } from '@minimalblock/core';
import type { IConversionRepository, IProductRepository } from '@minimalblock/core';

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
  const conversionsRef = useRef<Conversion[]>([]);

  useEffect(() => {
    let cancelled = false;

    conversionRepo.findByOwnerId(ownerId).then(conversions => {
      if (cancelled) return;
      conversionsRef.current = conversions;
      setState({ conversions, loading: false, error: null });
    }).catch(err => {
      if (!cancelled) setState({ conversions: [], loading: false, error: err instanceof Error ? err.message : 'Failed to load' });
    });

    return () => { cancelled = true; };
  }, [conversionRepo, ownerId]);

  const removeProduct = async (productId: string) => {
    await productRepo.delete(productId);
    const updated = conversionsRef.current.filter(c => c.productId !== productId);
    conversionsRef.current = updated;
    setState(s => ({ ...s, conversions: updated }));
  };

  return { ...state, removeProduct };
}
