import type {
  AnalyzeProductResponse,
  ConversionResponse,
  CreateConversionRequest,
  CreateConversionResponse,
  GenerateDescriptionResponse,
  GenerateHotspotsResponse,
  QualityCheckResponse,
  RejectConversionRequest,
  ReturnRiskResponse,
} from '@minimalblock/core';
import type { SupabaseClient } from '@supabase/supabase-js';

export class MerchantApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly supabase: SupabaseClient,
  ) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const { data } = await this.supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      throw new Error('You must be signed in to call the API.');
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    });

    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      throw new Error(payload.error ?? 'Request failed');
    }
    return payload as T;
  }

  createConversion(input: CreateConversionRequest): Promise<CreateConversionResponse> {
    return this.request<CreateConversionResponse>('/api/conversions', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  getConversion(conversionId: string): Promise<ConversionResponse> {
    return this.request<ConversionResponse>(`/api/conversions/${conversionId}`);
  }

  approveConversion(conversionId: string): Promise<ConversionResponse> {
    return this.request<ConversionResponse>(`/api/conversions/${conversionId}/approve`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  rejectConversion(conversionId: string, reason: string): Promise<ConversionResponse> {
    const body: RejectConversionRequest = { reason };
    return this.request<ConversionResponse>(`/api/conversions/${conversionId}/reject`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  analyzeProduct(productId: string): Promise<AnalyzeProductResponse> {
    return this.request<AnalyzeProductResponse>('/api/ai/analyze-product', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  generateHotspots(productId: string): Promise<GenerateHotspotsResponse> {
    return this.request<GenerateHotspotsResponse>('/api/ai/generate-hotspots', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  generateDescription(productId: string): Promise<GenerateDescriptionResponse> {
    return this.request<GenerateDescriptionResponse>('/api/ai/generate-description', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  getReturnRisk(productId: string): Promise<ReturnRiskResponse> {
    return this.request<ReturnRiskResponse>('/api/ai/return-risk', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  getQualityCheck(productId: string): Promise<QualityCheckResponse> {
    return this.request<QualityCheckResponse>('/api/ai/quality-check', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }
}
