import { Product } from './product.entity.js';
import type { ProductAiAnalysis, AiDiagnosisAttempt } from './product.entity.js';

function makeAnalysis(overrides: Partial<ProductAiAnalysis> = {}): ProductAiAnalysis {
  return {
    materials: [],
    confidenceScore: 0.8,
    missingVisuals: [],
    suggestedCopy: null,
    returnRiskFactors: [],
    qualityRecommendations: [],
    merchantRecommendations: [],
    ...overrides,
  };
}

function makeProduct(overrides: Partial<ConstructorParameters<typeof Product>[0]> = {}): Product {
  return new Product({
    id: 'prod-1',
    name: 'Test Product',
    description: 'A test product',
    category: 'electronics',
    ownerId: 'user-1',
    hotspots: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  });
}

describe('ProductAiAnalysis — Phase 3 fields', () => {
  describe('conversionResult', () => {
    it('accepts pass result', () => {
      const analysis = makeAnalysis({ conversionResult: 'pass', readinessScore: 91 });
      expect(analysis.conversionResult).toBe('pass');
    });

    it('accepts warning result', () => {
      const analysis = makeAnalysis({ conversionResult: 'warning', readinessScore: 58 });
      expect(analysis.conversionResult).toBe('warning');
    });

    it('accepts fail result', () => {
      const analysis = makeAnalysis({ conversionResult: 'fail', readinessScore: 22 });
      expect(analysis.conversionResult).toBe('fail');
    });

    it('is optional (undefined when not set)', () => {
      const analysis = makeAnalysis();
      expect(analysis.conversionResult).toBeUndefined();
    });
  });

  describe('score fields', () => {
    it('stores all three score dimensions', () => {
      const analysis = makeAnalysis({
        readinessScore: 91,
        visualMatchScore: 89,
        commerceReadinessScore: 93,
        finalQualityScore: 91,
      });
      expect(analysis.readinessScore).toBe(91);
      expect(analysis.visualMatchScore).toBe(89);
      expect(analysis.commerceReadinessScore).toBe(93);
      expect(analysis.finalQualityScore).toBe(91);
    });

    it('scores are optional and default to undefined', () => {
      const analysis = makeAnalysis();
      expect(analysis.visualMatchScore).toBeUndefined();
      expect(analysis.commerceReadinessScore).toBeUndefined();
      expect(analysis.finalQualityScore).toBeUndefined();
    });
  });

  describe('category fields', () => {
    it('stores detectedCategory and expectedCategory separately', () => {
      const analysis = makeAnalysis({
        detectedCategory: 'electronics',
        expectedCategory: 'electronics',
      });
      expect(analysis.detectedCategory).toBe('electronics');
      expect(analysis.expectedCategory).toBe('electronics');
    });

    it('captures category mismatch', () => {
      const analysis = makeAnalysis({
        detectedCategory: 'bags',
        expectedCategory: 'electronics',
      });
      expect(analysis.detectedCategory).not.toBe(analysis.expectedCategory);
    });
  });

  describe('blockingReasons', () => {
    it('stores multiple blocking reasons', () => {
      const analysis = makeAnalysis({
        blockingReasons: [
          '3D model does not preserve laptop silhouette',
          'Critical parts missing from generated model',
        ],
      });
      expect(analysis.blockingReasons).toHaveLength(2);
    });

    it('is empty array when product passes', () => {
      const analysis = makeAnalysis({ blockingReasons: [], conversionResult: 'pass' });
      expect(analysis.blockingReasons).toHaveLength(0);
    });
  });

  describe('missingParts', () => {
    it('lists specific missing product parts', () => {
      const analysis = makeAnalysis({
        missingParts: ['keyboard', 'trackpad', 'hinge'],
      });
      expect(analysis.missingParts).toEqual(['keyboard', 'trackpad', 'hinge']);
    });
  });

  describe('sellerExplanation', () => {
    it('stores a plain-language seller explanation', () => {
      const analysis = makeAnalysis({
        sellerExplanation: "The 3D model doesn't look like your laptop photos.",
      });
      expect(analysis.sellerExplanation).toBeTruthy();
    });
  });

  describe('analysisVersion', () => {
    it('stores version string', () => {
      const analysis = makeAnalysis({ analysisVersion: '1.0' });
      expect(analysis.analysisVersion).toBe('1.0');
    });
  });

  describe('analysisHistory', () => {
    const attempt: AiDiagnosisAttempt = {
      timestamp: '2024-01-01T00:00:00.000Z',
      version: '1.0',
      readinessScore: 44,
      visualMatchScore: 48,
      commerceReadinessScore: 41,
      finalQualityScore: 44,
    };

    it('stores analysis history attempts', () => {
      const analysis = makeAnalysis({ analysisHistory: [attempt] });
      expect(analysis.analysisHistory).toHaveLength(1);
      expect(analysis.analysisHistory![0].readinessScore).toBe(44);
    });

    it('history is empty for first-time analyses', () => {
      const analysis = makeAnalysis({ analysisHistory: [] });
      expect(analysis.analysisHistory).toHaveLength(0);
    });

    it('history records all score dimensions per attempt', () => {
      const analysis = makeAnalysis({ analysisHistory: [attempt] });
      const recorded = analysis.analysisHistory![0];
      expect(recorded.readinessScore).toBeDefined();
      expect(recorded.visualMatchScore).toBeDefined();
      expect(recorded.commerceReadinessScore).toBeDefined();
      expect(recorded.finalQualityScore).toBeDefined();
    });
  });

  describe('Product.withAiAnalysis', () => {
    it('preserves Phase 3 fields through withAiAnalysis', () => {
      const product = makeProduct();
      const analysis = makeAnalysis({
        conversionResult: 'fail',
        blockingReasons: ['Missing keyboard'],
        missingParts: ['keyboard', 'trackpad'],
        sellerExplanation: 'Model is incomplete.',
        analysisVersion: '1.0',
        visualMatchScore: 18,
        commerceReadinessScore: 15,
        finalQualityScore: 22,
        analysisHistory: [],
      });
      const updated = product.withAiAnalysis(analysis);
      expect(updated.aiAnalysis?.conversionResult).toBe('fail');
      expect(updated.aiAnalysis?.blockingReasons).toEqual(['Missing keyboard']);
      expect(updated.aiAnalysis?.missingParts).toEqual(['keyboard', 'trackpad']);
      expect(updated.aiAnalysis?.visualMatchScore).toBe(18);
    });

    it('can clear analysis', () => {
      const product = makeProduct({ aiAnalysis: makeAnalysis({ conversionResult: 'pass' }) });
      const cleared = product.withAiAnalysis(null);
      expect(cleared.aiAnalysis).toBeNull();
    });
  });
});
