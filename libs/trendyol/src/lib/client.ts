import type {
  BatchResult,
  ShipmentPackagesParams,
  TrendyolBuyboxResult,
  TrendyolEnv,
  TrendyolPackage,
  TrendyolProduct,
  TrendyolUnapprovedProduct,
  UnapprovedProductParams,
} from './types.js';

const BASE_URL = 'https://api.trendyol.com/sapigw';

function mockPackage(id: number): TrendyolPackage {
  return {
    shipmentPackageId: id,
    shipmentPackageStatus: id % 3 === 0 ? 'Invoiced' : 'Created',
    orderNumber: `ORDER-${1000 + id}`,
    orderDate: Date.now() - id * 3_600_000,
    grossAmount: 150 + id * 25,
    totalDiscount: 0,
    currencyCode: 'TRY',
    lines: [
      {
        lineId: id * 10,
        quantity: 1,
        amount: 150 + id * 25,
        discount: 0,
        currencyCode: 'TRY',
        merchantSku: `SKU-${id}`,
        product: {
          id: id,
          barcode: `BARCODE-${id}`,
          title: `Product ${id}`,
          category: { name: 'Electronics' },
          brand: { name: 'Demo Brand' },
          images: [],
        },
      },
    ],
    shipmentAddress: {
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      address1: 'Bağdat Cad. No:1',
      city: 'İstanbul',
      district: 'Kadıköy',
      postalCode: '34710',
      countryCode: 'TR',
      fullName: 'Ahmet Yılmaz',
    },
    cargo: { providerName: 'UPS', trackingNumber: `TRK${id}00001` },
  };
}

export class TrendyolClient {
  private readonly authHeader: string;

  constructor(private readonly env: TrendyolEnv) {
    this.authHeader = `Basic ${btoa(`${env.apiKey}:${env.apiSecret}`)}`;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    if (this.env.mock) {
      throw new Error('Mock: use mock handler');
    }
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authHeader,
        'User-Agent': `${this.env.sellerId} - minimalblock`,
        ...(init?.headers ?? {}),
      },
    });
    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      throw new Error(`Trendyol ${response.status}: ${text}`);
    }
    return response.json() as Promise<T>;
  }

  async getShipmentPackages(params: ShipmentPackagesParams = {}): Promise<{
    content: TrendyolPackage[];
    totalPages: number;
    totalElements: number;
  }> {
    if (this.env.mock) {
      return { content: [1, 2, 3, 4, 5].map(mockPackage), totalPages: 1, totalElements: 5 };
    }
    const query = new URLSearchParams();
    if (params.startDate) query.set('startDate', String(params.startDate));
    if (params.endDate) query.set('endDate', String(params.endDate));
    query.set('page', String(params.page ?? 0));
    query.set('size', String(params.size ?? 50));
    if (params.status) query.set('status', params.status);
    if (params.orderNumber) query.set('orderNumber', params.orderNumber);
    return this.request(`/suppliers/${this.env.sellerId}/orders?${query}`);
  }

  async getShipmentPackagesStream(cursor?: string): Promise<{
    packages: TrendyolPackage[];
    nextCursor?: string;
  }> {
    if (this.env.mock) {
      return { packages: [1, 2, 3].map(mockPackage) };
    }
    const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
    return this.request(`/suppliers/${this.env.sellerId}/orders/stream${qs}`);
  }

  async updatePackageStatus(
    packageId: number | string,
    status: 'Picking' | 'Invoiced',
    invoiceNumber?: string,
  ): Promise<void> {
    if (this.env.mock) return;
    const body: Record<string, unknown> = { status };
    if (invoiceNumber) body['invoiceNumber'] = invoiceNumber;
    return this.request(`/suppliers/${this.env.sellerId}/shipment-packages/${packageId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async cancelOrderPackageItem(
    packageId: number | string,
    lines: Array<{ lineId: number; quantity: number }>,
    reasonId: number,
  ): Promise<void> {
    if (this.env.mock) return;
    return this.request(
      `/suppliers/${this.env.sellerId}/shipment-packages/${packageId}/items/unsupplied`,
      { method: 'PUT', body: JSON.stringify({ lines, reasonId }) },
    );
  }

  async createProducts(items: TrendyolProduct[]): Promise<{ batchRequestId: string }> {
    if (this.env.mock) {
      return { batchRequestId: `mock-batch-${Date.now()}` };
    }
    return this.request(`/suppliers/${this.env.sellerId}/v2/products`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  async pollBatchResult(batchRequestId: string): Promise<BatchResult> {
    if (this.env.mock) {
      return {
        batchRequestId,
        status: 'DONE',
        creationDate: Date.now() - 5000,
        lastModification: Date.now(),
        sourceType: 'PRODUCT_API',
        itemCount: 1,
        failedItemCount: 0,
        items: [],
      };
    }
    return this.request(
      `/suppliers/${this.env.sellerId}/products/batch-requests/${batchRequestId}`,
    );
  }

  async archiveProducts(
    items: Array<{ barcode: string }>,
    archive: boolean,
  ): Promise<void> {
    if (this.env.mock) return;
    return this.request(`/suppliers/${this.env.sellerId}/products/archive`, {
      method: 'PUT',
      body: JSON.stringify({
        items: items.map((item) => ({ ...item, archived: archive })),
      }),
    });
  }

  async getBuyboxInformation(
    barcodes: string[],
  ): Promise<{ result: TrendyolBuyboxResult[] }> {
    if (this.env.mock) {
      return {
        result: barcodes.map((barcode, i) => ({
          barcode,
          buyBoxPrice: 120 + i * 15,
          buyBoxSellerCount: 3 + i,
          isCurrentSellerWinner: i === 0,
        })),
      };
    }
    return this.request(`/suppliers/${this.env.sellerId}/products/price-list`, {
      method: 'POST',
      body: JSON.stringify({ barcodes }),
    });
  }

  async filterUnapprovedProducts(params: UnapprovedProductParams = {}): Promise<{
    content: TrendyolUnapprovedProduct[];
    totalElements: number;
    nextPageToken?: string;
  }> {
    if (this.env.mock) {
      return { content: [], totalElements: 0 };
    }
    const query = new URLSearchParams({ approved: 'false' });
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.size !== undefined) query.set('size', String(params.size));
    if (params.barcode) query.set('barcode', params.barcode);
    return this.request(
      `/suppliers/${this.env.sellerId}/products?${query}`,
    );
  }
}
