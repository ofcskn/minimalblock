import { render, screen, fireEvent } from '@testing-library/react';
import { AiDiagnosisPanel } from './AiDiagnosisPanel.js';
import type { ProductAiAnalysis } from '@minimalblock/core';

function makeAnalysis(overrides: Partial<ProductAiAnalysis> = {}): ProductAiAnalysis {
  return {
    materials: ['leather', 'brass'],
    confidenceScore: 0.94,
    readinessScore: 91,
    visualMatchScore: 89,
    commerceReadinessScore: 93,
    finalQualityScore: 91,
    conversionResult: 'pass',
    missingVisuals: [],
    blockingReasons: [],
    missingParts: [],
    sellerExplanation: 'Product is ready for merchant review.',
    qualityRecommendations: ['Add interior shot'],
    merchantRecommendations: [],
    returnRiskFactors: [],
    suggestedCopy: null,
    detectedCategory: 'bags',
    expectedCategory: 'bags',
    analysisVersion: '1.0',
    lastUpdatedAt: new Date().toISOString(),
    analysisHistory: [],
    ...overrides,
  };
}

describe('AiDiagnosisPanel', () => {
  const noop = () => undefined;

  describe('loading state', () => {
    it('renders loading indicator', () => {
      render(
        <AiDiagnosisPanel
          analysis={null}
          isLoading={true}
          error={null}
          hasConversion={true}
          onRunAnalysis={noop}
        />,
      );
      expect(screen.getByTestId('loading-state')).toBeTruthy();
      expect(screen.getByText(/Running AI analysis/i)).toBeTruthy();
    });

    it('does not show results when loading', () => {
      render(
        <AiDiagnosisPanel
          analysis={null}
          isLoading={true}
          error={null}
          hasConversion={true}
          onRunAnalysis={noop}
        />,
      );
      expect(screen.queryByTestId('results-state')).toBeNull();
    });
  });

  describe('error state', () => {
    it('renders error message', () => {
      render(
        <AiDiagnosisPanel
          analysis={null}
          isLoading={false}
          error="Network timeout"
          hasConversion={true}
          onRunAnalysis={noop}
        />,
      );
      expect(screen.getByTestId('error-state')).toBeTruthy();
      expect(screen.getByText('Network timeout')).toBeTruthy();
    });

    it('shows retry button when conversion exists', () => {
      const onRunAnalysis = jest.fn();
      render(
        <AiDiagnosisPanel
          analysis={null}
          isLoading={false}
          error="Failed"
          hasConversion={true}
          onRunAnalysis={onRunAnalysis}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: /Retry/i }));
      expect(onRunAnalysis).toHaveBeenCalledTimes(1);
    });
  });

  describe('empty state', () => {
    it('shows empty state when no analysis', () => {
      render(
        <AiDiagnosisPanel
          analysis={null}
          isLoading={false}
          error={null}
          hasConversion={true}
          onRunAnalysis={noop}
        />,
      );
      expect(screen.getByTestId('empty-state')).toBeTruthy();
    });

    it('shows "Run AI analysis" button when conversion exists', () => {
      const onRunAnalysis = jest.fn();
      render(
        <AiDiagnosisPanel
          analysis={null}
          isLoading={false}
          error={null}
          hasConversion={true}
          onRunAnalysis={onRunAnalysis}
        />,
      );
      const btn = screen.getByTestId('run-analysis-btn');
      fireEvent.click(btn);
      expect(onRunAnalysis).toHaveBeenCalledTimes(1);
    });

    it('does not show run button when no conversion', () => {
      render(
        <AiDiagnosisPanel
          analysis={null}
          isLoading={false}
          error={null}
          hasConversion={false}
          onRunAnalysis={noop}
        />,
      );
      expect(screen.queryByTestId('run-analysis-btn')).toBeNull();
    });
  });

  describe('results state — pass', () => {
    it('renders results section', () => {
      render(
        <AiDiagnosisPanel
          analysis={makeAnalysis()}
          isLoading={false}
          error={null}
          hasConversion={true}
          onRunAnalysis={noop}
        />,
      );
      expect(screen.getByTestId('results-state')).toBeTruthy();
    });

    it('shows seller explanation', () => {
      render(
        <AiDiagnosisPanel
          analysis={makeAnalysis()}
          isLoading={false}
          error={null}
          hasConversion={true}
          onRunAnalysis={noop}
        />,
      );
      expect(screen.getByTestId('seller-explanation')).toBeTruthy();
      expect(screen.getByText(/Product is ready for merchant review/i)).toBeTruthy();
    });

    it('shows all scores section', () => {
      render(
        <AiDiagnosisPanel
          analysis={makeAnalysis()}
          isLoading={false}
          error={null}
          hasConversion={true}
          onRunAnalysis={noop}
        />,
      );
      expect(screen.getByTestId('scores-section')).toBeTruthy();
      expect(screen.getByText('Final quality')).toBeTruthy();
      expect(screen.getByText('Visual match')).toBeTruthy();
      expect(screen.getByText('Commerce')).toBeTruthy();
      expect(screen.getByText('Readiness')).toBeTruthy();
      expect(screen.getByText('Confidence')).toBeTruthy();
    });

    it('shows pass conversion result badge', () => {
      render(
        <AiDiagnosisPanel
          analysis={makeAnalysis({ conversionResult: 'pass' })}
          isLoading={false}
          error={null}
          hasConversion={true}
          onRunAnalysis={noop}
        />,
      );
      expect(screen.getByTestId('conversion-result')).toBeTruthy();
      expect(screen.getByText(/Passed/i)).toBeTruthy();
    });

    it('shows category match', () => {
      render(
        <AiDiagnosisPanel
          analysis={makeAnalysis({ detectedCategory: 'bags', expectedCategory: 'bags' })}
          isLoading={false}
          error={null}
          hasConversion={true}
          onRunAnalysis={noop}
        />,
      );
      expect(screen.getByTestId('category-section')).toBeTruthy();
    });

    it('shows "Re-run analysis" button when analysis exists', () => {
      render(
        <AiDiagnosisPanel
          analysis={makeAnalysis()}
          isLoading={false}
          error={null}
          hasConversion={true}
          onRunAnalysis={noop}
        />,
      );
      expect(screen.getByTestId('rerun-analysis-btn')).toBeTruthy();
    });

    it('shows AI Recommendation label', () => {
      render(
        <AiDiagnosisPanel
          analysis={makeAnalysis()}
          isLoading={false}
          error={null}
          hasConversion={true}
          onRunAnalysis={noop}
        />,
      );
      expect(screen.getByText('AI Recommendation')).toBeTruthy();
    });

    it('shows disclaimer text', () => {
      render(
        <AiDiagnosisPanel
          analysis={makeAnalysis()}
          isLoading={false}
          error={null}
          hasConversion={true}
          onRunAnalysis={noop}
        />,
      );
      expect(screen.getByText(/AI output is a recommendation only/i)).toBeTruthy();
    });

    it('shows recommended actions', () => {
      render(
        <AiDiagnosisPanel
          analysis={makeAnalysis({ qualityRecommendations: ['Add interior shot', 'Add exterior shot'] })}
          isLoading={false}
          error={null}
          hasConversion={true}
          onRunAnalysis={noop}
        />,
      );
      expect(screen.getByTestId('recommended-actions')).toBeTruthy();
      expect(screen.getByText('Add interior shot')).toBeTruthy();
    });
  });

  describe('results state — fail (laptop scenario)', () => {
    const failedLaptop = makeAnalysis({
      conversionResult: 'fail',
      readinessScore: 22,
      visualMatchScore: 18,
      commerceReadinessScore: 15,
      finalQualityScore: 22,
      blockingReasons: [
        '3D model does not preserve laptop silhouette',
        'Critical product parts missing from generated model',
      ],
      missingParts: ['keyboard', 'trackpad', 'hinge', 'screen panel detail'],
      sellerExplanation: "The 3D model doesn't look like your laptop photos.",
      detectedCategory: 'electronics',
      expectedCategory: 'electronics',
    });

    it('shows blocking reasons', () => {
      render(
        <AiDiagnosisPanel
          analysis={failedLaptop}
          isLoading={false}
          error={null}
          hasConversion={true}
          onRunAnalysis={noop}
        />,
      );
      expect(screen.getByTestId('blocking-reasons')).toBeTruthy();
      expect(
        screen.getByText('3D model does not preserve laptop silhouette'),
      ).toBeTruthy();
    });

    it('shows missing parts', () => {
      render(
        <AiDiagnosisPanel
          analysis={failedLaptop}
          isLoading={false}
          error={null}
          hasConversion={true}
          onRunAnalysis={noop}
        />,
      );
      expect(screen.getByTestId('missing-parts')).toBeTruthy();
      expect(screen.getByText('keyboard')).toBeTruthy();
      expect(screen.getByText('trackpad')).toBeTruthy();
      expect(screen.getByText('hinge')).toBeTruthy();
    });

    it('shows fail conversion result badge', () => {
      render(
        <AiDiagnosisPanel
          analysis={failedLaptop}
          isLoading={false}
          error={null}
          hasConversion={true}
          onRunAnalysis={noop}
        />,
      );
      expect(screen.getByText(/Failed/i)).toBeTruthy();
    });

    it('does not show blocking-reasons section for passing product', () => {
      render(
        <AiDiagnosisPanel
          analysis={makeAnalysis({ blockingReasons: [] })}
          isLoading={false}
          error={null}
          hasConversion={true}
          onRunAnalysis={noop}
        />,
      );
      expect(screen.queryByTestId('blocking-reasons')).toBeNull();
    });

    it('does not show missing-parts section when empty', () => {
      render(
        <AiDiagnosisPanel
          analysis={makeAnalysis({ missingParts: [] })}
          isLoading={false}
          error={null}
          hasConversion={true}
          onRunAnalysis={noop}
        />,
      );
      expect(screen.queryByTestId('missing-parts')).toBeNull();
    });
  });

  describe('score delta from history', () => {
    it('shows positive score delta when score improved', () => {
      const analysis = makeAnalysis({
        finalQualityScore: 91,
        readinessScore: 91,
        visualMatchScore: 89,
        commerceReadinessScore: 93,
        analysisHistory: [
          {
            timestamp: new Date(Date.now() - 3_600_000).toISOString(),
            version: '1.0',
            readinessScore: 74,
            visualMatchScore: 71,
            commerceReadinessScore: 78,
            finalQualityScore: 74,
          },
        ],
      });
      render(
        <AiDiagnosisPanel
          analysis={analysis}
          isLoading={false}
          error={null}
          hasConversion={true}
          onRunAnalysis={noop}
        />,
      );
      const deltas = screen.getAllByText(/^\+\d+$/);
      expect(deltas.length).toBeGreaterThan(0);
    });

    it('shows no deltas when history is empty', () => {
      const analysis = makeAnalysis({ analysisHistory: [] });
      render(
        <AiDiagnosisPanel
          analysis={analysis}
          isLoading={false}
          error={null}
          hasConversion={true}
          onRunAnalysis={noop}
        />,
      );
      expect(screen.queryAllByText(/^\+\d+$/)).toHaveLength(0);
    });
  });

  describe('run analysis callback', () => {
    it('calls onRunAnalysis when re-run button clicked', () => {
      const onRunAnalysis = jest.fn();
      render(
        <AiDiagnosisPanel
          analysis={makeAnalysis()}
          isLoading={false}
          error={null}
          hasConversion={true}
          onRunAnalysis={onRunAnalysis}
        />,
      );
      fireEvent.click(screen.getByTestId('rerun-analysis-btn'));
      expect(onRunAnalysis).toHaveBeenCalledTimes(1);
    });
  });
});
