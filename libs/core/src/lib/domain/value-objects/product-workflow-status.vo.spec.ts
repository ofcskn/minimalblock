import { ProductWorkflowStatus } from './product-workflow-status.vo.js';
import type { ProductAiAnalysis } from '../entities/product.entity.js';

const baseAnalysis: ProductAiAnalysis = {
  materials: [],
  confidenceScore: 0.8,
  missingVisuals: [],
  suggestedCopy: null,
  returnRiskFactors: [],
  qualityRecommendations: [],
  merchantRecommendations: [],
};

describe('ProductWorkflowStatus', () => {
  describe('factory constructors', () => {
    it('creates draft', () => {
      expect(ProductWorkflowStatus.draft().value).toBe('draft');
    });
    it('creates analyzing', () => {
      expect(ProductWorkflowStatus.analyzing().value).toBe('analyzing');
    });
    it('creates failed_qa', () => {
      expect(ProductWorkflowStatus.failedQa().value).toBe('failed_qa');
    });
    it('creates needs_fix', () => {
      expect(ProductWorkflowStatus.needsFix().value).toBe('needs_fix');
    });
    it('creates ready_for_review', () => {
      expect(ProductWorkflowStatus.readyForReview().value).toBe('ready_for_review');
    });
    it('creates approved', () => {
      expect(ProductWorkflowStatus.approved().value).toBe('approved');
    });
    it('creates published', () => {
      expect(ProductWorkflowStatus.published().value).toBe('published');
    });
    it('creates from string value', () => {
      expect(ProductWorkflowStatus.from('needs_fix').value).toBe('needs_fix');
    });
  });

  describe('isPublishable', () => {
    it('returns true for approved', () => {
      expect(ProductWorkflowStatus.approved().isPublishable()).toBe(true);
    });
    it('returns true for published', () => {
      expect(ProductWorkflowStatus.published().isPublishable()).toBe(true);
    });
    it('returns false for draft', () => {
      expect(ProductWorkflowStatus.draft().isPublishable()).toBe(false);
    });
    it('returns false for analyzing', () => {
      expect(ProductWorkflowStatus.analyzing().isPublishable()).toBe(false);
    });
    it('returns false for failed_qa', () => {
      expect(ProductWorkflowStatus.failedQa().isPublishable()).toBe(false);
    });
    it('returns false for needs_fix', () => {
      expect(ProductWorkflowStatus.needsFix().isPublishable()).toBe(false);
    });
    it('returns false for ready_for_review', () => {
      expect(ProductWorkflowStatus.readyForReview().isPublishable()).toBe(false);
    });
  });

  describe('canExport', () => {
    it('returns true for approved', () => {
      expect(ProductWorkflowStatus.approved().canExport()).toBe(true);
    });
    it('returns true for published', () => {
      expect(ProductWorkflowStatus.published().canExport()).toBe(true);
    });
    it('returns false for all other states', () => {
      expect(ProductWorkflowStatus.draft().canExport()).toBe(false);
      expect(ProductWorkflowStatus.analyzing().canExport()).toBe(false);
      expect(ProductWorkflowStatus.failedQa().canExport()).toBe(false);
      expect(ProductWorkflowStatus.needsFix().canExport()).toBe(false);
      expect(ProductWorkflowStatus.readyForReview().canExport()).toBe(false);
    });
  });

  describe('isBlocked', () => {
    it('returns true for failed_qa only', () => {
      expect(ProductWorkflowStatus.failedQa().isBlocked()).toBe(true);
    });
    it('returns false for all other states', () => {
      expect(ProductWorkflowStatus.draft().isBlocked()).toBe(false);
      expect(ProductWorkflowStatus.analyzing().isBlocked()).toBe(false);
      expect(ProductWorkflowStatus.needsFix().isBlocked()).toBe(false);
      expect(ProductWorkflowStatus.readyForReview().isBlocked()).toBe(false);
      expect(ProductWorkflowStatus.approved().isBlocked()).toBe(false);
      expect(ProductWorkflowStatus.published().isBlocked()).toBe(false);
    });
  });

  describe('deriveFromAiAnalysis', () => {
    it('returns draft when analysis is null', () => {
      expect(ProductWorkflowStatus.deriveFromAiAnalysis(null).value).toBe('draft');
    });
    it('returns draft when analysis is undefined', () => {
      expect(ProductWorkflowStatus.deriveFromAiAnalysis(undefined).value).toBe('draft');
    });
    it('returns draft when readinessScore is undefined', () => {
      expect(ProductWorkflowStatus.deriveFromAiAnalysis({ ...baseAnalysis }).value).toBe('draft');
    });
    it('returns failed_qa when readinessScore < 40', () => {
      expect(ProductWorkflowStatus.deriveFromAiAnalysis({ ...baseAnalysis, readinessScore: 22 }).value).toBe('failed_qa');
      expect(ProductWorkflowStatus.deriveFromAiAnalysis({ ...baseAnalysis, readinessScore: 0 }).value).toBe('failed_qa');
      expect(ProductWorkflowStatus.deriveFromAiAnalysis({ ...baseAnalysis, readinessScore: 39 }).value).toBe('failed_qa');
    });
    it('returns needs_fix when readinessScore is 40–69', () => {
      expect(ProductWorkflowStatus.deriveFromAiAnalysis({ ...baseAnalysis, readinessScore: 40 }).value).toBe('needs_fix');
      expect(ProductWorkflowStatus.deriveFromAiAnalysis({ ...baseAnalysis, readinessScore: 58 }).value).toBe('needs_fix');
      expect(ProductWorkflowStatus.deriveFromAiAnalysis({ ...baseAnalysis, readinessScore: 69 }).value).toBe('needs_fix');
    });
    it('returns ready_for_review when readinessScore >= 70', () => {
      expect(ProductWorkflowStatus.deriveFromAiAnalysis({ ...baseAnalysis, readinessScore: 70 }).value).toBe('ready_for_review');
      expect(ProductWorkflowStatus.deriveFromAiAnalysis({ ...baseAnalysis, readinessScore: 91 }).value).toBe('ready_for_review');
      expect(ProductWorkflowStatus.deriveFromAiAnalysis({ ...baseAnalysis, readinessScore: 100 }).value).toBe('ready_for_review');
    });
  });

  it('toString returns the value string', () => {
    expect(ProductWorkflowStatus.needsFix().toString()).toBe('needs_fix');
  });
});
