import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { BrandData, BrandColorData, BrandLogoData } from '@minimalblock/core';
import { useApp } from '../context/AppContext.js';
import type { BrandScrapeResult } from '../lib/merchant-api-client.js';

const BUCKET = 'media-assets';

export function useBrand(userId: string) {
  const { brandRepo, supabase, apiClient } = useApp();
  const qc = useQueryClient();
  const key = ['brand', userId] as const;

  const query = useQuery({
    queryKey: key,
    queryFn: () => brandRepo.findByOwnerId(userId),
    enabled: !!userId,
  });

  const saveMeta = useMutation({
    mutationFn: (data: { name: string; description: string; website: string }) =>
      brandRepo.upsert({ ownerId: userId, ...data }),
    onSuccess: (saved) => {
      qc.setQueryData(key, (prev: BrandData | null | undefined) =>
        prev ? { ...saved, logos: prev.logos, colors: prev.colors } : saved,
      );
    },
  });

  const uploadLogo = useMutation({
    mutationFn: async (file: File) => {
      let brand = query.data ?? null;
      if (!brand) {
        brand = await brandRepo.upsert({ ownerId: userId, name: '', description: '', website: '' });
        qc.setQueryData(key, brand);
      }
      const storageKey = `${userId}/brand/logos/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from(BUCKET).upload(storageKey, file, { upsert: false });
      if (error) throw new Error(`Upload failed: ${error.message}`);
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storageKey);
      return brandRepo.saveLogo(brand.id, userId, {
        storageKey,
        publicUrl: urlData.publicUrl,
        name: file.name,
        ordinal: brand.logos.length,
      });
    },
    onSuccess: (logo) => {
      qc.setQueryData(key, (prev: BrandData | null | undefined) => {
        if (!prev) return prev;
        return { ...prev, logos: [...prev.logos, logo] };
      });
    },
  });

  const removeLogo = useMutation({
    mutationFn: async (logo: BrandLogoData) => {
      await supabase.storage.from(BUCKET).remove([logo.storageKey]);
      await brandRepo.removeLogo(logo.id, userId);
      return logo.id;
    },
    onSuccess: (id) => {
      qc.setQueryData(key, (prev: BrandData | null | undefined) => {
        if (!prev) return prev;
        return { ...prev, logos: prev.logos.filter((l) => l.id !== id) };
      });
    },
  });

  const addColor = useMutation({
    mutationFn: async (color: { hex: string; name: string }) => {
      let brand = query.data ?? null;
      if (!brand) {
        brand = await brandRepo.upsert({ ownerId: userId, name: '', description: '', website: '' });
        qc.setQueryData(key, brand);
      }
      return brandRepo.saveColor(brand.id, userId, { ...color, ordinal: brand.colors.length });
    },
    onSuccess: (color) => {
      qc.setQueryData(key, (prev: BrandData | null | undefined) => {
        if (!prev) return prev;
        return { ...prev, colors: [...prev.colors, color] };
      });
    },
  });

  const removeColor = useMutation({
    mutationFn: (colorId: string) => brandRepo.removeColor(colorId, userId).then(() => colorId),
    onSuccess: (id) => {
      qc.setQueryData(key, (prev: BrandData | null | undefined) => {
        if (!prev) return prev;
        return { ...prev, colors: prev.colors.filter((c) => c.id !== id) };
      });
    },
  });

  const scrape = useMutation({
    mutationFn: (url: string): Promise<BrandScrapeResult> => apiClient.scrapeBrand(url),
  });

  const importLogo = useMutation({
    mutationFn: async ({ logoUrl, brandId }: { logoUrl: string; brandId: string }) => {
      const res = await fetch(logoUrl);
      if (!res.ok) throw new Error('Could not fetch logo');
      const blob = await res.blob();
      const ext = logoUrl.split('.').pop()?.split('?')[0] ?? 'ico';
      const file = new File([blob], `brand-logo.${ext}`, { type: blob.type || 'image/x-icon' });
      const storageKey = `${userId}/brand/logos/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from(BUCKET).upload(storageKey, file, { upsert: false });
      if (error) throw new Error(`Upload failed: ${error.message}`);
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storageKey);
      const currentLogos = (qc.getQueryData(key) as BrandData | null)?.logos ?? [];
      return brandRepo.saveLogo(brandId, userId, {
        storageKey,
        publicUrl: urlData.publicUrl,
        name: file.name,
        ordinal: currentLogos.length,
      });
    },
    onSuccess: (logo) => {
      qc.setQueryData(key, (prev: BrandData | null | undefined) => {
        if (!prev) return prev;
        return { ...prev, logos: [...prev.logos, logo] };
      });
    },
  });

  return {
    brand: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    saveMeta,
    uploadLogo,
    removeLogo,
    addColor,
    removeColor,
    scrape,
    importLogo,
  };
}
