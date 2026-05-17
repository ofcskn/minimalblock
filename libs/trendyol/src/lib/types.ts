export interface TrendyolPackageLine {
  lineId: number;
  quantity: number;
  amount: number;
  discount: number;
  currencyCode: string;
  merchantSku: string;
  productSize?: string;
  productColor?: string;
  product: {
    id: number;
    barcode: string;
    title: string;
    category: { name: string };
    brand: { name: string };
    images: Array<{ url: string }>;
  };
}

export interface TrendyolPackage {
  shipmentPackageId: number;
  shipmentPackageStatus: string;
  shipmentPackageType?: string;
  orderNumber: string;
  orderDate: number;
  lastModifiedDate?: number;
  grossAmount: number;
  totalDiscount: number;
  currencyCode: string;
  lines: TrendyolPackageLine[];
  shipmentAddress?: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    district: string;
    postalCode: string;
    countryCode: string;
    fullName: string;
  };
  cargo?: {
    providerName: string;
    trackingNumber?: string;
    trackingUrl?: string;
  };
}

export interface TrendyolProduct {
  barcode: string;
  title: string;
  productMainId: string;
  brandId: number;
  categoryId: number;
  quantity: number;
  stockCode: string;
  description: string;
  currencyType: string;
  listPrice: number;
  salePrice: number;
  vatRate: number;
  images: Array<{ url: string }>;
  attributes?: Array<{
    attributeId: number;
    attributeValueId?: number;
    customAttributeValue?: string;
  }>;
}

export interface TrendyolProductDraft {
  title: string;
  description: string;
  categoryId: number;
  brandName: string;
  listPrice: number;
  salePrice: number;
  attributes: Array<{ name: string; value: string }>;
}

export interface BatchResult {
  batchRequestId: string;
  status: 'IN_PROGRESS' | 'DONE' | 'FAILED';
  creationDate: number;
  lastModification: number;
  sourceType: string;
  itemCount: number;
  failedItemCount: number;
  items: Array<{
    requestItem: TrendyolProduct;
    status: 'SUCCESS' | 'ERROR';
    failureReasons?: string[];
  }>;
}

export interface TrendyolBuyboxResult {
  barcode: string;
  buyBoxPrice?: number;
  buyBoxSellerCount?: number;
  winnerSellerId?: number;
  isCurrentSellerWinner?: boolean;
}

export interface TrendyolUnapprovedProduct {
  barcode: string;
  title: string;
  status: string;
  rejectionReasons?: string[];
}

export interface ShipmentPackagesParams {
  startDate?: number;
  endDate?: number;
  page?: number;
  size?: number;
  status?: string;
  orderNumber?: string;
}

export interface UnapprovedProductParams {
  page?: number;
  size?: number;
  barcode?: string;
}

export interface TrendyolEnv {
  sellerId: string;
  apiKey: string;
  apiSecret: string;
  mock?: boolean;
}
