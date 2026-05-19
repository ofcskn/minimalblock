import { createContext, useContext, useMemo } from 'react';
import {
  getSupabaseClient,
  SupabaseProductRepository,
  SupabaseConversionRepository,
  SupabaseImageUploader,
  SupabaseEventsRepository,
  SupabaseEmbedViewsRepository,
  SupabaseBrandRepository,
} from '@minimalblock/data';
import type { IProductRepository, IConversionRepository, IImageUploaderPort, IBrandRepository } from '@minimalblock/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { MerchantApiClient } from '../lib/merchant-api-client.js';

interface AppContextValue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>;
  productRepo: IProductRepository;
  conversionRepo: IConversionRepository;
  imageUploader: IImageUploaderPort;
  eventsRepo: SupabaseEventsRepository;
  embedViewsRepo: SupabaseEmbedViewsRepository;
  brandRepo: IBrandRepository;
  apiClient: MerchantApiClient;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => {
    const supabaseUrl = import.meta.env['VITE_SUPABASE_URL'] as string;
    const supabaseKey = import.meta.env['VITE_SUPABASE_ANON_KEY'] as string;
    const apiBaseUrl = (import.meta.env['VITE_API_BASE_URL'] as string | undefined) ?? 'http://localhost:8787';

    const supabase = getSupabaseClient(supabaseUrl, supabaseKey);

    return {
      supabase,
      productRepo: new SupabaseProductRepository(supabase),
      conversionRepo: new SupabaseConversionRepository(supabase),
      imageUploader: new SupabaseImageUploader(supabase),
      eventsRepo: new SupabaseEventsRepository(supabase),
      embedViewsRepo: new SupabaseEmbedViewsRepository(supabase),
      brandRepo: new SupabaseBrandRepository(supabase),
      apiClient: new MerchantApiClient(apiBaseUrl, supabase),
    };
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <AppContext.Provider value={value as any}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
