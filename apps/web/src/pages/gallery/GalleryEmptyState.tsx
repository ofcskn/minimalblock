import type { EmptyStateAction, RequirementItem } from '@minimalblock/ui';
import { RequirementChecklist } from './RequirementChecklist.js';

interface GalleryEmptyStateProps {
  title: string;
  description: string;
  actions: EmptyStateAction[];
  requirements: RequirementItem[];
  onAction: (actionId: string) => void;
}

const buttonToneClass: Record<NonNullable<EmptyStateAction['tone']>, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary:
    'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
};

export function GalleryEmptyState({
  title,
  description,
  actions,
  requirements,
  onAction,
}: GalleryEmptyStateProps) {
  return (
    <section
      id="gallery-requirements"
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_320px]">
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 sm:p-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7"
              aria-hidden="true"
            >
              <path d="M21 7.5 12 2.25 3 7.5m18 0-9 5.25M21 7.5v9L12 21.75M3 7.5l9 5.25M3 7.5v9L12 21.75m0-9v9" />
            </svg>
          </div>

          <div className="mt-5 max-w-xl">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              {title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {description}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {actions.map((action) => {
              const tone = action.tone ?? 'secondary';

              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => onAction(action.id)}
                  className={
                    'inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ' +
                    buttonToneClass[tone]
                  }
                >
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>

        <RequirementChecklist items={requirements} />
      </div>
    </section>
  );
}
