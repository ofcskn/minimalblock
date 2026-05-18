import { ProductWorkflowStatus, type ProductWorkflowStatusValue } from './product-workflow-status.vo.js';

export type ExportTarget = 'public_page' | 'embed' | 'trendyol' | 'shopify';

export interface ExportProfile {
  target: ExportTarget;
  label: string;
  available: boolean;
  blockedReason?: string;
}

export class ExportProfileFactory {
  static forStatus(status: ProductWorkflowStatus | ProductWorkflowStatusValue): ExportProfile[] {
    const s = status instanceof ProductWorkflowStatus ? status : ProductWorkflowStatus.from(status);
    const canExport = s.canExport();
    const isPublished = s.value === 'published';

    return [
      {
        target: 'public_page',
        label: 'Public Page',
        available: canExport,
        blockedReason: canExport ? undefined : 'Product must be approved before publishing.',
      },
      {
        target: 'embed',
        label: 'Embed Widget',
        available: canExport,
        blockedReason: canExport ? undefined : 'Product must be approved before embedding.',
      },
      {
        target: 'trendyol',
        label: 'Trendyol',
        available: isPublished,
        blockedReason: isPublished ? undefined : 'Product must be published to export to Trendyol.',
      },
      {
        target: 'shopify',
        label: 'Shopify',
        available: false,
        blockedReason: 'Shopify integration is coming soon.',
      },
    ];
  }
}
