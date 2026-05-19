import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Conversion, IConversionRepository, IProductRepository } from '@minimalblock/core';

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
  const queryClient = useQueryClient();
  const queryKey = ['gallery', ownerId] as const;

  const { data: conversions = [], isPending, error } = useQuery({
    queryKey,
    queryFn: () => conversionRepo.findByOwnerId(ownerId),
    staleTime: 30_000,
    enabled: !!ownerId,
  });

  const { mutateAsync: removeProduct } = useMutation({
    mutationFn: (productId: string) => productRepo.delete(productId),
    onSuccess: (_result, productId) => {
      queryClient.setQueryData<Conversion[]>(queryKey, (old) =>
        old ? old.filter((c) => c.productId !== productId) : [],
      );
    },
  });

  return {
    conversions,
    loading: isPending,
    error: error ? (error instanceof Error ? error.message : 'Failed to load') : null,
    removeProduct,
  };
}
