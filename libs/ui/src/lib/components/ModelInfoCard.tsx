import type { ModelSource } from '@minimalblock/core';

export interface ModelInfoCardProps {
  fileName: string;
  fileSizeBytes: number;
  uploadedAt: Date;
  modelSource: ModelSource;
  onResetCamera?: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function ModelInfoCard({ fileName, fileSizeBytes, uploadedAt, modelSource, onResetCamera }: ModelInfoCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">3D Model</p>
        {onResetCamera && (
          <button
            onClick={onResetCamera}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            title="Reset camera to default position"
          >
            Reset camera
          </button>
        )}
      </div>

      <div className="space-y-2 text-sm">
        {/* E.15 — model source badge */}
        <div className="flex items-center gap-2">
          {modelSource === 'ai-generated' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              AI-generated
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Manual fallback
            </span>
          )}
        </div>

        {/* E.12 — file name */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-gray-500 shrink-0">File</span>
          <span className="text-gray-900 font-medium truncate text-right">{fileName}</span>
        </div>

        {/* E.14 — file size */}
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Size</span>
          <span className="text-gray-900 font-medium">{formatBytes(fileSizeBytes)}</span>
        </div>

        {/* E.13 — upload date */}
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Uploaded</span>
          <span className="text-gray-900 font-medium">{formatDate(uploadedAt)}</span>
        </div>
      </div>
    </div>
  );
}
