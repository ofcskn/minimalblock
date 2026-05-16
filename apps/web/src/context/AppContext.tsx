import { createContext, useContext, useMemo } from 'react';
import { getSupabaseClient, SupabaseProductRepository, SupabaseConversionRepository, SupabaseImageUploader } from '@minimalblock/data';
import { createGenerativeModel, GeminiModelGenerator } from '@minimalblock/ai';
import type { IProductRepository, IConversionRepository, IImageUploaderPort, IModelGeneratorPort } from '@minimalblock/core';
import type { SupabaseClient } from '@supabase/supabase-js';

interface AppContextValue {
  supabase: SupabaseClient;
  productRepo: IProductRepository;
  conversionRepo: IConversionRepository;
  imageUploader: IImageUploaderPort;
  modelGenerator: IModelGeneratorPort;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<AppContextValue>(() => {
    const supabaseUrl = import.meta.env['VITE_SUPABASE_URL'] as string;
    const supabaseKey = import.meta.env['VITE_SUPABASE_ANON_KEY'] as string;
    const geminiKey = import.meta.env['VITE_GEMINI_API_KEY'] as string;

    const supabase = getSupabaseClient(supabaseUrl, supabaseKey);
    const geminiModel = createGenerativeModel(geminiKey);

    return {
      supabase,
      productRepo: new SupabaseProductRepository(supabase),
      conversionRepo: new SupabaseConversionRepository(supabase),
      imageUploader: new SupabaseImageUploader(supabase),
      modelGenerator: new GeminiModelGenerator(geminiModel),
    };
  }, []);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
