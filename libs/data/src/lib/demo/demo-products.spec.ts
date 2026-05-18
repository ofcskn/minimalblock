import { DEMO_PRODUCT_FAILED, DEMO_PRODUCT_SUCCESS, DEMO_PRODUCT_WARNING } from './demo-products.js';

describe('demo products', () => {
  describe('DEMO_PRODUCT_FAILED', () => {
    it('has required fields', () => {
      expect(DEMO_PRODUCT_FAILED.id).toBeTruthy();
      expect(DEMO_PRODUCT_FAILED.name).toBeTruthy();
      expect(DEMO_PRODUCT_FAILED.category).toBe('electronics');
      expect(DEMO_PRODUCT_FAILED.ownerId).toBeTruthy();
      expect(DEMO_PRODUCT_FAILED.createdAt).toBeInstanceOf(Date);
      expect(DEMO_PRODUCT_FAILED.updatedAt).toBeInstanceOf(Date);
    });
    it('has workflowStatus failed_qa', () => {
      expect(DEMO_PRODUCT_FAILED.workflowStatus).toBe('failed_qa');
    });
    it('has readinessScore < 40', () => {
      expect(DEMO_PRODUCT_FAILED.aiAnalysis?.readinessScore).toBeDefined();
      expect(DEMO_PRODUCT_FAILED.aiAnalysis!.readinessScore!).toBeLessThan(40);
    });
    it('has at least 2 missingVisuals', () => {
      expect(DEMO_PRODUCT_FAILED.aiAnalysis?.missingVisuals.length).toBeGreaterThanOrEqual(2);
    });
    it('has at least 2 returnRiskFactors', () => {
      expect(DEMO_PRODUCT_FAILED.aiAnalysis?.returnRiskFactors.length).toBeGreaterThanOrEqual(2);
    });
    it('has at least 3 qualityRecommendations', () => {
      expect(DEMO_PRODUCT_FAILED.aiAnalysis?.qualityRecommendations.length).toBeGreaterThanOrEqual(3);
    });
    it('has full aiAnalysis with suggestedCopy, materials', () => {
      expect(DEMO_PRODUCT_FAILED.aiAnalysis?.suggestedCopy).not.toBeNull();
      expect(DEMO_PRODUCT_FAILED.aiAnalysis?.materials.length).toBeGreaterThan(0);
    });
  });

  describe('DEMO_PRODUCT_SUCCESS', () => {
    it('has required fields', () => {
      expect(DEMO_PRODUCT_SUCCESS.id).toBeTruthy();
      expect(DEMO_PRODUCT_SUCCESS.name).toBeTruthy();
      expect(DEMO_PRODUCT_SUCCESS.category).toBe('bags');
      expect(DEMO_PRODUCT_SUCCESS.createdAt).toBeInstanceOf(Date);
      expect(DEMO_PRODUCT_SUCCESS.updatedAt).toBeInstanceOf(Date);
    });
    it('has workflowStatus approved', () => {
      expect(DEMO_PRODUCT_SUCCESS.workflowStatus).toBe('approved');
    });
    it('has readinessScore >= 70', () => {
      expect(DEMO_PRODUCT_SUCCESS.aiAnalysis?.readinessScore).toBeDefined();
      expect(DEMO_PRODUCT_SUCCESS.aiAnalysis!.readinessScore!).toBeGreaterThanOrEqual(70);
    });
    it('has full aiAnalysis with suggestedCopy, materials', () => {
      expect(DEMO_PRODUCT_SUCCESS.aiAnalysis?.suggestedCopy).not.toBeNull();
      expect(DEMO_PRODUCT_SUCCESS.aiAnalysis?.materials.length).toBeGreaterThan(0);
    });
  });

  describe('DEMO_PRODUCT_WARNING', () => {
    it('has required fields', () => {
      expect(DEMO_PRODUCT_WARNING.id).toBeTruthy();
      expect(DEMO_PRODUCT_WARNING.name).toBeTruthy();
      expect(DEMO_PRODUCT_WARNING.category).toBe('home-decor');
      expect(DEMO_PRODUCT_WARNING.createdAt).toBeInstanceOf(Date);
      expect(DEMO_PRODUCT_WARNING.updatedAt).toBeInstanceOf(Date);
    });
    it('has workflowStatus needs_fix', () => {
      expect(DEMO_PRODUCT_WARNING.workflowStatus).toBe('needs_fix');
    });
    it('has readinessScore between 40 and 69', () => {
      const score = DEMO_PRODUCT_WARNING.aiAnalysis!.readinessScore!;
      expect(score).toBeGreaterThanOrEqual(40);
      expect(score).toBeLessThan(70);
    });
    it('has full aiAnalysis with suggestedCopy, materials', () => {
      expect(DEMO_PRODUCT_WARNING.aiAnalysis?.suggestedCopy).not.toBeNull();
      expect(DEMO_PRODUCT_WARNING.aiAnalysis?.materials.length).toBeGreaterThan(0);
    });
  });

  it('each demo product has a unique id', () => {
    const ids = new Set([DEMO_PRODUCT_FAILED.id, DEMO_PRODUCT_SUCCESS.id, DEMO_PRODUCT_WARNING.id]);
    expect(ids.size).toBe(3);
  });
});
