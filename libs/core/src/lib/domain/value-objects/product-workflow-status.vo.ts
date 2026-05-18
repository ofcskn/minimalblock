import type { ProductAiAnalysis } from '../entities/product.entity.js';

export type ProductWorkflowStatusValue =
  | 'draft'
  | 'analyzing'
  | 'failed_qa'
  | 'needs_fix'
  | 'ready_for_review'
  | 'approved'
  | 'published';

export class ProductWorkflowStatus {
  private constructor(readonly value: ProductWorkflowStatusValue) {}

  static draft(): ProductWorkflowStatus { return new ProductWorkflowStatus('draft'); }
  static analyzing(): ProductWorkflowStatus { return new ProductWorkflowStatus('analyzing'); }
  static failedQa(): ProductWorkflowStatus { return new ProductWorkflowStatus('failed_qa'); }
  static needsFix(): ProductWorkflowStatus { return new ProductWorkflowStatus('needs_fix'); }
  static readyForReview(): ProductWorkflowStatus { return new ProductWorkflowStatus('ready_for_review'); }
  static approved(): ProductWorkflowStatus { return new ProductWorkflowStatus('approved'); }
  static published(): ProductWorkflowStatus { return new ProductWorkflowStatus('published'); }

  static from(value: ProductWorkflowStatusValue): ProductWorkflowStatus {
    return new ProductWorkflowStatus(value);
  }

  static deriveFromAiAnalysis(analysis: ProductAiAnalysis | null | undefined): ProductWorkflowStatus {
    if (!analysis) return ProductWorkflowStatus.draft();

    const score = analysis.readinessScore;
    if (score === undefined || score === null) return ProductWorkflowStatus.draft();
    if (score < 40) return ProductWorkflowStatus.failedQa();
    if (score < 70) return ProductWorkflowStatus.needsFix();
    return ProductWorkflowStatus.readyForReview();
  }

  isPublishable(): boolean {
    return this.value === 'approved' || this.value === 'published';
  }

  canExport(): boolean {
    return this.value === 'approved' || this.value === 'published';
  }

  isBlocked(): boolean {
    return this.value === 'failed_qa';
  }

  toString(): string { return this.value; }
}
