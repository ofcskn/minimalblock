import type { ImageQualityWarning, ImageViewLabel, SourceImageReadiness } from '@minimalblock/core';

export interface SourceImageReadinessCardProps {
  readiness: SourceImageReadiness;
  onUploadMissingViews?: () => void;
  onRemoveWeakImages?: (storageKeys: string[]) => void;
  onContinueAnyway?: () => void;
}

const VIEW_LABELS: Record<ImageViewLabel, string> = {
  front: 'Front view',
  back: 'Back view',
  left: 'Left side',
  right: 'Right side',
  top: 'Top view',
  bottom: 'Bottom view',
  detail: 'Detail close-up',
  scale: 'Scale / context',
  unknown: 'Unlabelled',
};

const WARNING_LABELS: Record<ImageQualityWarning, string> = {
  low_resolution: 'Low res',
  likely_duplicate: 'Duplicate',
  likely_cropped: 'Cropped',
  background_inconsistent: 'Background varies',
  angle_unclear: 'Angle unclear',
};

const WARNING_COLORS: Record<ImageQualityWarning, string> = {
  low_resolution: 'bg-red-100 text-red-700',
  likely_duplicate: 'bg-orange-100 text-orange-700',
  likely_cropped: 'bg-amber-100 text-amber-700',
  background_inconsistent: 'bg-amber-100 text-amber-700',
  angle_unclear: 'bg-slate-100 text-slate-600',
};

const REQUIRED_VIEWS: ImageViewLabel[] = ['front', 'back'];
const CHECKLIST_VIEWS: ImageViewLabel[] = [
  'front', 'back', 'left', 'right', 'top', 'bottom', 'detail', 'scale',
];

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500';
  const textColor =
    score >= 70 ? 'text-emerald-700' : score >= 40 ? 'text-amber-700' : 'text-red-700';
  const label = score >= 70 ? 'Good' : score >= 40 ? 'Needs work' : 'Poor';

  return (
    <div className="flex items-center gap-3">
      <span className={`text-2xl font-bold tabular-nums ${textColor}`} data-testid="readiness-score">
        {score}
        <span className="ml-0.5 text-xs font-normal text-gray-400">/100</span>
      </span>
      <div className="flex-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
        </div>
        <p className={`mt-1 text-[11px] font-medium uppercase tracking-wide ${textColor}`}>{label}</p>
      </div>
    </div>
  );
}

export function SourceImageReadinessCard({
  readiness,
  onUploadMissingViews,
  onRemoveWeakImages,
  onContinueAnyway,
}: SourceImageReadinessCardProps) {
  const weakKeys = readiness.weakImages.map((e) => e.storageKey);
  const covered = new Set(readiness.coveredViews);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-5" data-testid="source-image-readiness-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Source image readiness</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            {readiness.count} image{readiness.count !== 1 ? 's' : ''} uploaded
            {!readiness.hasEnoughUniqueViews && ' — not enough unique views'}
          </p>
        </div>
        <ScoreBar score={readiness.score} />
      </div>

      {/* Quality tip: more ≠ better */}
      <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs text-blue-800">
        <span className="font-semibold">Tip:</span> Many images don't always mean useful images.
        Two sharp, well-angled shots beat ten blurry duplicates.
        Focus on unique views, plain backgrounds, and resolution ≥ 800 px per side.
      </div>

      {/* Image grid with per-image warnings */}
      {readiness.entries.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Uploaded images</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {readiness.entries.map((entry) => (
              <div
                key={entry.storageKey}
                className={`flex items-start gap-2.5 rounded-lg border p-2.5 ${
                  entry.warnings.length > 0 ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-gray-50'
                }`}
                data-testid="image-entry"
              >
                <img
                  src={entry.url}
                  alt={VIEW_LABELS[entry.viewLabel]}
                  className="h-14 w-14 shrink-0 rounded-md border border-gray-200 object-cover"
                  loading="lazy"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800">{VIEW_LABELS[entry.viewLabel]}</p>
                  <p className="text-[11px] text-gray-400">{(entry.sizeBytes / 1024).toFixed(0)} KB</p>
                  {entry.warnings.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {entry.warnings.map((w) => (
                        <span
                          key={w}
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${WARNING_COLORS[w]}`}
                        >
                          {WARNING_LABELS[w]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing views checklist */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">View coverage</p>
        <ul className="grid grid-cols-2 gap-1.5">
          {CHECKLIST_VIEWS.map((view) => {
            const present = covered.has(view);
            const isRequired = REQUIRED_VIEWS.includes(view);
            return (
              <li
                key={view}
                className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs ${
                  present
                    ? 'bg-emerald-50 text-emerald-800'
                    : isRequired
                    ? 'bg-red-50 text-red-700'
                    : 'bg-gray-50 text-gray-500'
                }`}
                data-testid={`checklist-${view}`}
              >
                <span className="font-bold">{present ? '✓' : isRequired ? '✕' : '○'}</span>
                {VIEW_LABELS[view]}
                {isRequired && !present && (
                  <span className="ml-auto text-[10px] font-semibold text-red-600">Required</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
        {onUploadMissingViews && readiness.missingViews.length > 0 && (
          <button
            onClick={onUploadMissingViews}
            className="rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
            data-testid="upload-missing-btn"
          >
            Upload missing views
          </button>
        )}
        {onRemoveWeakImages && weakKeys.length > 0 && (
          <button
            onClick={() => onRemoveWeakImages(weakKeys)}
            className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
            data-testid="remove-weak-btn"
          >
            Remove weak images ({weakKeys.length})
          </button>
        )}
        {onContinueAnyway && readiness.score < 70 && (
          <button
            onClick={onContinueAnyway}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            data-testid="continue-anyway-btn"
            title="Continues to internal review only — publishing still requires approval."
          >
            Continue anyway (internal review)
          </button>
        )}
      </div>
    </div>
  );
}
