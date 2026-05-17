import { useTranslation } from 'react-i18next';
import type { RequirementItem } from '@minimalblock/ui';

interface RequirementChecklistProps {
  items: RequirementItem[];
}

export function RequirementChecklist({ items }: RequirementChecklistProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-900">
          {t('gallery.requirements.title')}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {t('gallery.requirements.description')}
        </p>
      </div>

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.415 0L3.29 9.21a1 1 0 111.415-1.42l4.042 4.043 6.543-6.543a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <div>
              <p className="text-sm font-medium text-slate-800">{item.label}</p>
              {item.description && (
                <p className="mt-0.5 text-sm text-slate-500">
                  {item.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
