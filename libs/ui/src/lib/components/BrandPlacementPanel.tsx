import type { BrandPlacementConfig, BrandPlacementKey } from '@minimalblock/core';
import { DEFAULT_BRAND_PLACEMENT, BRAND_PLACEMENT_KEYS } from '@minimalblock/core';
import { Spinner } from './Spinner.js';

export interface BrandPlacementPanelProps {
  value: BrandPlacementConfig | null;
  onChange: (config: BrandPlacementConfig) => void;
  onSave: (config: BrandPlacementConfig) => Promise<void> | void;
  isSaving: boolean;
  labels: {
    title: string;
    master: string;
    assetsSection: string;
    save: string;
    description: string;
    options: Record<BrandPlacementKey, string>;
  };
}

function resolvedConfig(value: BrandPlacementConfig | null): BrandPlacementConfig {
  return value ?? DEFAULT_BRAND_PLACEMENT;
}

export function BrandPlacementPanel({ value, onChange, onSave, isSaving, labels }: BrandPlacementPanelProps) {
  const config = resolvedConfig(value);

  function toggleMaster() {
    onChange({ ...config, enabled: !config.enabled });
  }

  function toggleOption(key: BrandPlacementKey) {
    onChange({ ...config, [key]: !config[key] });
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">{labels.title}</h2>
        {isSaving && <Spinner size="sm" />}
      </div>
      <p className="mb-4 text-xs text-gray-500">{labels.description}</p>

      {/* Master toggle */}
      <button
        type="button"
        onClick={toggleMaster}
        className="flex w-full items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-left transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <span
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${config.enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${config.enabled ? 'translate-x-4' : 'translate-x-0.5'}`}
          />
        </span>
        <span className={`text-sm font-medium ${config.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
          {labels.master}
        </span>
      </button>

      {/* Brand Assets section — shown only when enabled */}
      {config.enabled && (
        <div className="mt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {labels.assetsSection}
          </p>
          <ul className="space-y-1">
            {BRAND_PLACEMENT_KEYS.map((key) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => toggleOption(key)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      config[key]
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {config[key] && (
                      <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className={`text-sm ${config[key] ? 'text-gray-900' : 'text-gray-500'}`}>
                    {labels.options[key]}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => void onSave(config)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              {isSaving && <Spinner size="sm" />}
              {labels.save}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
