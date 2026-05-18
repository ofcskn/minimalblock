import type { AiDiagnosisAttempt, ProductAiAnalysis } from '@minimalblock/core';
import { Spinner } from './Spinner.js';

export interface AiDiagnosisPanelProps {
  analysis: ProductAiAnalysis | null;
  isLoading: boolean;
  error: string | null;
  hasConversion: boolean;
  onRunAnalysis: () => void;
}

interface ScoreBarProps {
  label: string;
  score: number;
  max?: number;
}

function ScoreBar({ label, score, max = 100 }: ScoreBarProps) {
  const pct = Math.min(100, Math.round((score / max) * 100));
  const color =
    pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500';
  const textColor =
    pct >= 70 ? 'text-emerald-700' : pct >= 40 ? 'text-amber-700' : 'text-red-700';

  return (
    <div className="flex items-center gap-3">
      <span className="w-40 shrink-0 text-xs text-gray-500">{label}</span>
      <div className="flex-1 overflow-hidden rounded-full bg-gray-100 h-1.5">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`w-12 shrink-0 text-right text-xs font-semibold tabular-nums ${textColor}`}>
        {score}/{max}
      </span>
    </div>
  );
}

function ScoreDelta({ current, previous }: { current: number; previous: number }) {
  const delta = current - previous;
  if (delta === 0) return null;
  return (
    <span
      className={`ml-1 text-[10px] font-semibold ${delta > 0 ? 'text-emerald-600' : 'text-red-500'}`}
    >
      {delta > 0 ? `+${delta}` : delta}
    </span>
  );
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

export function AiDiagnosisPanel({
  analysis,
  isLoading,
  error,
  hasConversion,
  onRunAnalysis,
}: AiDiagnosisPanelProps) {
  const hasAnalysis = analysis !== null;
  const prevAttempt: AiDiagnosisAttempt | undefined =
    analysis?.analysisHistory?.[analysis.analysisHistory.length - 1];

  const result = analysis?.conversionResult;
  const isFail = result === 'fail';
  const isWarn = result === 'warning';
  const isPass = result === 'pass';

  const panelBorderColor = isFail
    ? 'border-red-200 bg-red-50'
    : isWarn
      ? 'border-amber-200 bg-amber-50'
      : isPass
        ? 'border-emerald-200 bg-emerald-50'
        : 'border-gray-200 bg-white';

  const headingColor = isFail
    ? 'text-red-900'
    : isWarn
      ? 'text-amber-900'
      : isPass
        ? 'text-emerald-900'
        : 'text-gray-900';

  const sectionLabelColor = isFail
    ? 'text-red-700'
    : isWarn
      ? 'text-amber-700'
      : isPass
        ? 'text-emerald-700'
        : 'text-gray-500';

  return (
    <div
      data-testid="ai-diagnosis-panel"
      className={`rounded-xl border p-4 ${hasAnalysis ? panelBorderColor : 'border-gray-200 bg-white'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className={`text-sm font-semibold ${hasAnalysis ? headingColor : 'text-gray-900'}`}>
            AI Diagnosis
          </h3>
          {hasAnalysis && (
            <span className="rounded-full border border-gray-300 bg-white px-2 py-0.5 text-[10px] font-medium text-gray-500">
              AI Recommendation
            </span>
          )}
        </div>
        {hasConversion && !isLoading && (
          <button
            data-testid={hasAnalysis ? 'rerun-analysis-btn' : 'run-analysis-btn'}
            onClick={onRunAnalysis}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-indigo-400 hover:text-indigo-700 transition-colors"
          >
            {hasAnalysis ? 'Re-run analysis' : 'Run AI analysis'}
          </button>
        )}
      </div>

      {/* Timestamp + version */}
      {analysis?.lastUpdatedAt && (
        <p className="mt-1 text-[11px] text-gray-400">
          Analyzed {formatRelativeTime(analysis.lastUpdatedAt)}
          {analysis.analysisVersion ? ` · v${analysis.analysisVersion}` : ''}
        </p>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500" data-testid="loading-state">
          <Spinner size="sm" />
          <span>Running AI analysis…</span>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="mt-3 rounded-lg bg-red-50 p-3" data-testid="error-state">
          <p className="text-xs font-semibold text-red-900">Analysis failed</p>
          <p className="mt-0.5 text-xs text-red-700">{error}</p>
          {hasConversion && (
            <button
              onClick={onRunAnalysis}
              className="mt-2 text-xs font-medium text-red-700 underline hover:text-red-900"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && !hasAnalysis && (
        <div className="mt-3" data-testid="empty-state">
          <p className="text-sm text-gray-400">
            No analysis yet.{' '}
            {hasConversion
              ? 'Click "Run AI analysis" to diagnose this product.'
              : 'Upload a product to run analysis.'}
          </p>
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && hasAnalysis && analysis && (
        <div className="mt-4 space-y-5" data-testid="results-state">
          {/* Seller explanation */}
          {analysis.sellerExplanation && (
            <div
              className={`rounded-lg p-3 ${isFail ? 'bg-red-100' : isWarn ? 'bg-amber-100' : 'bg-emerald-100'}`}
              data-testid="seller-explanation"
            >
              <p className={`text-xs leading-relaxed ${isFail ? 'text-red-800' : isWarn ? 'text-amber-800' : 'text-emerald-800'}`}>
                {analysis.sellerExplanation}
              </p>
            </div>
          )}

          {/* Scores */}
          <div data-testid="scores-section">
            <p className={`mb-2 text-[10px] font-semibold uppercase tracking-wide ${sectionLabelColor}`}>
              Scores
            </p>
            <div className="space-y-2">
              {analysis.finalQualityScore !== undefined && (
                <div className="flex items-center gap-1">
                  <div className="flex-1">
                    <ScoreBar label="Final quality" score={analysis.finalQualityScore} />
                  </div>
                  {prevAttempt && (
                    <ScoreDelta current={analysis.finalQualityScore} previous={prevAttempt.finalQualityScore} />
                  )}
                </div>
              )}
              {analysis.readinessScore !== undefined && (
                <div className="flex items-center gap-1">
                  <div className="flex-1">
                    <ScoreBar label="Readiness" score={analysis.readinessScore} />
                  </div>
                  {prevAttempt && (
                    <ScoreDelta current={analysis.readinessScore} previous={prevAttempt.readinessScore} />
                  )}
                </div>
              )}
              {analysis.visualMatchScore !== undefined && (
                <div className="flex items-center gap-1">
                  <div className="flex-1">
                    <ScoreBar label="Visual match" score={analysis.visualMatchScore} />
                  </div>
                  {prevAttempt && (
                    <ScoreDelta current={analysis.visualMatchScore} previous={prevAttempt.visualMatchScore} />
                  )}
                </div>
              )}
              {analysis.commerceReadinessScore !== undefined && (
                <div className="flex items-center gap-1">
                  <div className="flex-1">
                    <ScoreBar label="Commerce" score={analysis.commerceReadinessScore} />
                  </div>
                  {prevAttempt && (
                    <ScoreDelta current={analysis.commerceReadinessScore} previous={prevAttempt.commerceReadinessScore} />
                  )}
                </div>
              )}
              <ScoreBar
                label="Confidence"
                score={Math.round(analysis.confidenceScore * 100)}
              />
            </div>
          </div>

          {/* Category match */}
          {(analysis.detectedCategory || analysis.expectedCategory) && (
            <div data-testid="category-section">
              <p className={`mb-2 text-[10px] font-semibold uppercase tracking-wide ${sectionLabelColor}`}>
                Category
              </p>
              <div className="flex flex-col gap-1 text-xs">
                {analysis.expectedCategory && (
                  <span className="text-gray-600">
                    Expected: <span className="font-medium capitalize text-gray-900">{analysis.expectedCategory.replace(/-/g, ' ')}</span>
                  </span>
                )}
                {analysis.detectedCategory && (
                  <span className="text-gray-600">
                    Detected:{' '}
                    <span className="font-medium capitalize text-gray-900">{analysis.detectedCategory.replace(/-/g, ' ')}</span>
                    {analysis.detectedCategory === analysis.expectedCategory ? (
                      <span className="ml-1 text-emerald-600">✓</span>
                    ) : (
                      <span className="ml-1 text-amber-600">⚠ mismatch</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Conversion result badge */}
          {analysis.conversionResult && (
            <div data-testid="conversion-result">
              <p className={`mb-1 text-[10px] font-semibold uppercase tracking-wide ${sectionLabelColor}`}>
                Conversion result
              </p>
              {isFail && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white">
                  ✕ Failed
                </span>
              )}
              {isWarn && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-white">
                  ! Warning
                </span>
              )}
              {isPass && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                  ✓ Passed
                </span>
              )}
            </div>
          )}

          {/* Blocking reasons */}
          {analysis.blockingReasons && analysis.blockingReasons.length > 0 && (
            <div data-testid="blocking-reasons">
              <p className={`mb-2 text-[10px] font-semibold uppercase tracking-wide ${sectionLabelColor}`}>
                Blocking reasons
              </p>
              <ul className="space-y-1">
                {analysis.blockingReasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-1.5 text-xs text-red-700">
                    <span className="mt-0.5 font-bold shrink-0">✕</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing parts */}
          {analysis.missingParts && analysis.missingParts.length > 0 && (
            <div data-testid="missing-parts">
              <p className={`mb-2 text-[10px] font-semibold uppercase tracking-wide ${sectionLabelColor}`}>
                Missing from 3D model
              </p>
              <ul className="space-y-1">
                {analysis.missingParts.map((part) => (
                  <li key={part} className="flex items-start gap-1.5 text-xs text-red-700">
                    <span className="mt-0.5 font-bold shrink-0">✕</span>
                    <span className="capitalize">{part}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended actions */}
          {analysis.qualityRecommendations.length > 0 && (
            <div data-testid="recommended-actions">
              <p className={`mb-2 text-[10px] font-semibold uppercase tracking-wide ${sectionLabelColor}`}>
                Recommended actions
              </p>
              <ul className="space-y-1">
                {analysis.qualityRecommendations.map((action) => (
                  <li key={action} className={`flex items-start gap-1.5 text-xs font-medium ${isFail ? 'text-red-900' : isWarn ? 'text-amber-900' : 'text-emerald-900'}`}>
                    <span className="mt-0.5 shrink-0">→</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Materials (secondary info) */}
          {analysis.materials.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Materials detected
              </p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.materials.map((m) => (
                  <span key={m} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] text-gray-600">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-[10px] text-gray-400 italic">
            AI output is a recommendation only. Final approval decision rests with the merchant.
          </p>
        </div>
      )}
    </div>
  );
}
