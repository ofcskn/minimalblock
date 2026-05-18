import { useTranslation } from 'react-i18next';

interface PageHeaderProps {
  title: string;
  description: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
}

const actionButtonClass =
  'inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500';

export function PageHeader({
  title,
  description,
  primaryActionLabel,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
}: PageHeaderProps) {
  const { t } = useTranslation();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              {t('gallery.catalog')}
            </p>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-600">
              AI QA
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onSecondaryAction}
            className={`${actionButtonClass} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
          >
            {secondaryActionLabel}
          </button>
          <button
            type="button"
            onClick={onPrimaryAction}
            className={`${actionButtonClass} bg-indigo-600 text-white hover:bg-indigo-700`}
          >
            {primaryActionLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
