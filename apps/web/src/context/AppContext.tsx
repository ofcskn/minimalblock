import { createContext, useContext, useMemo } from 'react';
import {
  getSupabaseClient,
  SupabaseProductRepository,
  SupabaseConversionRepository,
  SupabaseImageUploader,
  SupabaseEventsRepository,
  SupabaseEmbedViewsRepository,
} from '@minimalblock/data';
import { createGenerativeModel, GeminiModelGenerator, GeminiRiskAnalyzer, ANALYSIS_MODEL_ID } from '@minimalblock/ai';
import type { IProductRepository, IConversionRepository, IImageUploaderPort, IModelGeneratorPort } from '@minimalblock/core';
import type { SupabaseClient } from '@supabase/supabase-js';

interface AppContextValue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>;
  productRepo: IProductRepository;
  conversionRepo: IConversionRepository;
  imageUploader: IImageUploaderPort;
  modelGenerator: IModelGeneratorPort;
  riskAnalyzer: GeminiRiskAnalyzer;
  eventsRepo: SupabaseEventsRepository;
  embedViewsRepo: SupabaseEmbedViewsRepository;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => {
    const supabaseUrl = import.meta.env['VITE_SUPABASE_URL'] as string;
    const supabaseKey = import.meta.env['VITE_SUPABASE_ANON_KEY'] as string;
    const geminiKey = import.meta.env['VITE_GEMINI_API_KEY'] as string;

    const supabase = getSupabaseClient(supabaseUrl, supabaseKey);
    const geminiModel = createGenerativeModel(geminiKey);
    const analysisModel = createGenerativeModel(geminiKey, ANALYSIS_MODEL_ID);

    return {
      supabase,
      productRepo: new SupabaseProductRepository(supabase),
      conversionRepo: new SupabaseConversionRepository(supabase),
      imageUploader: new SupabaseImageUploader(supabase),
      modelGenerator: new GeminiModelGenerator(geminiModel),
      riskAnalyzer: new GeminiRiskAnalyzer(analysisModel),
      eventsRepo: new SupabaseEventsRepository(supabase),
      embedViewsRepo: new SupabaseEmbedViewsRepository(supabase),
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
