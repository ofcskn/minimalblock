import { useState, useEffect } from 'react';
import { Conversion } from '@minimalblock/core';
import type { IConversionRepository } from '@minimalblock/core';

export interface UseGalleryState {
  conversions: Conversion[];
  loading: boolean;
  error: string | null;
}

export function useGallery(repository: IConversionRepository, ownerId: string) {
  const [state, setState] = useState<UseGalleryState>({ conversions: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    repository.findByOwnerId(ownerId).then(conversions => {
      if (!cancelled) setState({ conversions, loading: false, error: null });
    }).catch(err => {
      if (!cancelled) setState({ conversions: [], loading: false, error: err instanceof Error ? err.message : 'Failed to load' });
    });
    return () => { cancelled = true; };
  }, [repository, ownerId]);

  const remove = async (id: string) => {
    await repository.delete(id);
    setState(s => ({ ...s, conversions: s.conversions.filter(c => c.id !== id) }));
  };

  return { ...state, remove };
}
