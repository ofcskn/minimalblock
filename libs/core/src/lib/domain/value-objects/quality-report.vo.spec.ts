import { QualityReport } from './quality-report.vo.js';
import type { GeminiQaResult, QualityReportProps } from './quality-report.vo.js';

function makeBaseProps(overrides: Partial<QualityReportProps> = {}): QualityReportProps {
  return {
    fileSizeBytes: 1_000_000,
    triangleCount: 50_000,
    textureMaxDim: 1024,
    hasUSDZ: false,
    arCompat: true,
    warnings: [],
    ...overrides,
  };
}

function makeQaResult(overrides: Partial<GeminiQaResult> = {}): GeminiQaResult {
  return {
    conversionSucceeded: true,
    qualityScore: 80,
    status: 'good',
    categoryMatch: { score: 8, reason: 'Shape approximates the product' },
    missingParts: [],
    sourceImageIssues: [],
    recommendedActions: [],
    ...overrides,
  };
}

describe('QualityReport.score()', () => {
  describe('legacy mode (no geminiQaScore)', () => {
    it('returns full technical score for a small, AR-compatible GLB', () => {
      const report = new QualityReport(makeBaseProps());
      expect(report.score()).toBe(100);
    });

    it('penalises oversized files', () => {
      const report = new QualityReport(makeBaseProps({ fileSizeBytes: 20 * 1024 * 1024 }));
      expect(report.score()).toBeLessThan(60);
    });

    it('penalises high triangle count', () => {
      const report = new QualityReport(makeBaseProps({ triangleCount: 250_000 }));
      expect(report.score()).toBe(70);
    });

    it('penalises AR-incompatible assets', () => {
      const report = new QualityReport(makeBaseProps({ arCompat: false }));
      expect(report.score()).toBe(80);
    });

    it('penalises warnings (5 pts each, capped at 20)', () => {
      const report = new QualityReport(makeBaseProps({ warnings: ['w1', 'w2', 'w3', 'w4', 'w5'] }));
      expect(report.score()).toBe(80);
    });
  });

  describe('weighted mode (geminiQaScore present)', () => {
    it('blends technical, visual QA, and source scores at 45/45/10', () => {
      const report = new QualityReport(makeBaseProps({
        geminiQaScore: 80,
        geminiQaReport: makeQaResult({ qualityScore: 80 }),
        isPrimitiveMesh: true,
      }));
      // technical=100, qa=80, source=100 → 0.45*80 + 0.45*100 + 0.10*100 = 36+45+10 = 91
      expect(report.score()).toBe(91);
    });

    it('scores primitive mesh with low categoryMatch without capping', () => {
      const report = new QualityReport(makeBaseProps({
        geminiQaScore: 30,
        geminiQaReport: makeQaResult({
          qualityScore: 30,
          categoryMatch: { score: 2, reason: 'Electronics product cannot be represented as a primitive' },
        }),
        isPrimitiveMesh: true,
      }));
      // technical=100, qa=30, source=100 → 0.45*30 + 0.45*100 + 0.10*100 = 13.5+45+10 = 68.5 → 69
      // No hard cap: compound shapes now represent the product, score reflects actual quality
      expect(report.score()).toBe(69);
    });

    it('does not apply primitive cap when categoryMatch >= 3', () => {
      const report = new QualityReport(makeBaseProps({
        geminiQaScore: 70,
        geminiQaReport: makeQaResult({ qualityScore: 70, categoryMatch: { score: 5, reason: 'Decent match' } }),
        isPrimitiveMesh: true,
      }));
      // technical=100, qa=70, source=100 → 0.45*70 + 0.45*100 + 0.10*100 = 31.5+45+10 = 86.5 → 87
      expect(report.score()).toBeGreaterThan(30);
    });

    it('penalises source image warnings in source score', () => {
      const report = new QualityReport(makeBaseProps({
        geminiQaScore: 80,
        geminiQaReport: makeQaResult({ qualityScore: 80 }),
        warnings: ['source image is too dark', 'source image is blurry'],
        isPrimitiveMesh: true,
      }));
      // source score = max(0, 100 - 2*10) = 80
      // technical = 100 - 2*5 = 90 (warnings penalise technical too), qa=80
      // 0.45*80 + 0.45*90 + 0.10*80 = 36+40.5+8 = 84.5 → 85
      expect(report.score()).toBe(85);
    });

    it('isPrimitiveMesh defaults to false when not provided', () => {
      const report = new QualityReport(makeBaseProps({ geminiQaScore: 20, geminiQaReport: makeQaResult({ qualityScore: 20, categoryMatch: { score: 1, reason: 'No match' } }) }));
      // No cap because isPrimitiveMesh is false by default
      const capped = new QualityReport(makeBaseProps({ geminiQaScore: 20, geminiQaReport: makeQaResult({ qualityScore: 20, categoryMatch: { score: 1, reason: 'No match' } }), isPrimitiveMesh: true }));
      expect(report.score()).toBeGreaterThanOrEqual(capped.score());
    });
  });

  describe('toJSON / fromJSON round-trip', () => {
    it('preserves all fields including geminiQaReport', () => {
      const qaReport = makeQaResult();
      const original = new QualityReport(makeBaseProps({ geminiQaScore: 75, geminiQaReport: qaReport, isPrimitiveMesh: true }));
      const restored = QualityReport.fromJSON(original.toJSON());

      expect(restored.geminiQaScore).toBe(75);
      expect(restored.isPrimitiveMesh).toBe(true);
      expect(restored.geminiQaReport?.qualityScore).toBe(80);
      expect(restored.score()).toBe(original.score());
    });

    it('handles missing optional fields gracefully', () => {
      const original = new QualityReport(makeBaseProps());
      const restored = QualityReport.fromJSON(original.toJSON());

      expect(restored.geminiQaScore).toBeUndefined();
      expect(restored.geminiQaReport).toBeUndefined();
      expect(restored.isPrimitiveMesh).toBe(false);
    });
  });
});
