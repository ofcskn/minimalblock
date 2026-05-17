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

export interface TrendyolProductDraft {
  title: string;
  description: string;
  categoryId: number;
  brandName: string;
  listPrice: number;
  salePrice: number;
  attributes: Array<{ name: string; value: string }>;
}

export interface TrendyolPackage {
  shipmentPackageId: number;
  shipmentPackageStatus: string;
  orderNumber: string;
  orderDate: number;
  grossAmount: number;
  currencyCode: string;
  lines: Array<{
    lineId: number;
    quantity: number;
    amount: number;
    merchantSku: string;
    product: { id: number; barcode: string; title: string; category: { name: string }; brand: { name: string }; images: Array<{ url: string }> };
  }>;
  shipmentAddress?: { fullName: string; city: string; district: string };
  cargo?: { providerName: string; trackingNumber?: string };
}

export interface TrendyolBuyboxResult {
  barcode: string;
  buyBoxPrice?: number;
  buyBoxSellerCount?: number;
  isCurrentSellerWinner?: boolean;
}

export interface BatchResult {
  batchRequestId: string;
  status: 'IN_PROGRESS' | 'DONE' | 'FAILED';
  itemCount: number;
  failedItemCount: number;
  items: Array<{ status: 'SUCCESS' | 'ERROR'; failureReasons?: string[] }>;
}

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

  // --- Trendyol ---

  generateTrendyolListing(productId: string): Promise<{ draft: TrendyolProductDraft }> {
    return this.request<{ draft: TrendyolProductDraft }>('/api/ai/trendyol-listing', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  createTrendyolProducts(items: unknown[]): Promise<{ batchRequestId: string }> {
    return this.request<{ batchRequestId: string }>('/api/trendyol/products', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  pollTrendyolBatch(batchRequestId: string): Promise<{ batch: BatchResult }> {
    return this.request<{ batch: BatchResult }>(`/api/trendyol/products/batch/${batchRequestId}`);
  }

  getTrendyolOrders(params?: { page?: number; size?: number; status?: string }): Promise<{
    content: TrendyolPackage[];
    totalPages: number;
    totalElements: number;
  }> {
    const qs = new URLSearchParams();
    if (params?.page !== undefined) qs.set('page', String(params.page));
    if (params?.size !== undefined) qs.set('size', String(params.size));
    if (params?.status) qs.set('status', params.status);
    return this.request(`/api/trendyol/orders?${qs}`);
  }

  updateTrendyolOrderStatus(
    packageId: number | string,
    status: 'Picking' | 'Invoiced',
    invoiceNumber?: string,
  ): Promise<{ ok: true }> {
    return this.request<{ ok: true }>(`/api/trendyol/orders/${packageId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, invoiceNumber }),
    });
  }

  getTrendyolBuybox(barcodes: string[]): Promise<{ result: TrendyolBuyboxResult[] }> {
    return this.request<{ result: TrendyolBuyboxResult[] }>('/api/trendyol/buybox', {
      method: 'POST',
      body: JSON.stringify({ barcodes }),
    });
  }

  getTrendyolUnapproved(page = 0): Promise<{ content: unknown[]; totalElements: number }> {
    return this.request(`/api/trendyol/unapproved?page=${page}`);
  }
}
