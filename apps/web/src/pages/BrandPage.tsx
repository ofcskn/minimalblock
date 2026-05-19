import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BrandLogoData } from '@minimalblock/core';
import type { SupabaseUser } from '../types.js';
import { useBrand } from '../hooks/use-brand.js';
import type { BrandScrapeResult } from '../lib/merchant-api-client.js';

interface BrandPageProps {
  user: SupabaseUser;
}

// --- inline SVG icons ---
const PlusIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const XIcon = () => (
  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SpinnerIcon = ({ className }: { className?: string }) => (
  <svg className={className ?? 'h-4 w-4 animate-spin'} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
  </svg>
);

// --- toast ---
interface Toast {
  id: number;
  message: string;
  kind: 'success' | 'error';
}

let _toastId = 0;

function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  function push(message: string, kind: Toast['kind']) {
    const id = ++_toastId;
    setToasts((p) => [...p, { id, message, kind }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }
  return { toasts, success: (m: string) => push(m, 'success'), error: (m: string) => push(m, 'error') };
}

// --- scrape preview modal ---
interface ScrapePreviewProps {
  result: BrandScrapeResult;
  onApply: (fields: { name: boolean; description: boolean; colors: boolean; logo: boolean }) => void;
  onClose: () => void;
  applyingLogo: boolean;
}

function ScrapePreview({ result, onApply, onClose, applyingLogo }: ScrapePreviewProps) {
  const { t } = useTranslation();
  const [fields, setFields] = useState({ name: !!result.name, description: !!result.description, colors: result.colors.length > 0, logo: !!result.logoUrl });
  const toggle = (k: keyof typeof fields) => setFields((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-1 text-base font-semibold text-gray-900">{t('brand.scrapePreviewTitle')}</h3>
        <p className="mb-4 text-sm text-gray-500">{t('brand.scrapePreviewDesc')}</p>

        <div className="space-y-3">
          {result.name && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={fields.name} onChange={() => toggle('name')} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-700">{t('brand.brandName')}</p>
                <p className="truncate text-sm text-gray-500">{result.name}</p>
              </div>
            </label>
          )}
          {result.description && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={fields.description} onChange={() => toggle('description')} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-700">{t('brand.brandDescription')}</p>
                <p className="line-clamp-2 text-sm text-gray-500">{result.description}</p>
              </div>
            </label>
          )}
          {result.colors.length > 0 && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={fields.colors} onChange={() => toggle('colors')} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <div>
                <p className="mb-1 text-sm font-medium text-gray-700">{t('brand.colors')}</p>
                <div className="flex gap-2">
                  {result.colors.map((c) => (
                    <div key={c} className="h-6 w-6 rounded-lg border border-gray-200 shadow-sm" style={{ backgroundColor: c }} title={c} />
                  ))}
                </div>
              </div>
            </label>
          )}
          {result.logoUrl && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={fields.logo} onChange={() => toggle('logo')} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <div>
                <p className="mb-1 text-sm font-medium text-gray-700">{t('brand.logos')}</p>
                <img src={result.logoUrl} alt="logo preview" className="h-10 w-10 rounded-xl border border-gray-200 object-contain p-1" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              </div>
            </label>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            {t('brand.cancel')}
          </button>
          <button
            type="button"
            onClick={() => onApply(fields)}
            disabled={applyingLogo || !Object.values(fields).some(Boolean)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {applyingLogo && <SpinnerIcon className="h-3.5 w-3.5 animate-spin" />}
            {t('brand.applySelected')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BrandPage({ user }: BrandPageProps) {
  const { t } = useTranslation();
  const {
    brand,
    isLoading,
    saveMeta,
    uploadLogo,
    removeLogo,
    addColor,
    removeColor,
    scrape,
    importLogo,
  } = useBrand(user.id);

  const toast = useToasts();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const websiteInputRef = useRef<HTMLInputElement>(null);

  // form state for fields that require dirty detection + batch save
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formWebsite, setFormWebsite] = useState('');

  // sync form when brand loads
  useEffect(() => {
    if (brand) {
      setFormName(brand.name);
      setFormDescription(brand.description);
      setFormWebsite(brand.website);
    }
  }, [brand?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const isDirty = useMemo(() => {
    if (!brand) return !!(formName || formDescription || formWebsite);
    return brand.name !== formName || brand.description !== formDescription || brand.website !== formWebsite;
  }, [brand, formName, formDescription, formWebsite]);

  // color picker state
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingColor, setPendingColor] = useState('#6366f1');

  // scrape preview state
  const [scrapeResult, setScrapeResult] = useState<BrandScrapeResult | null>(null);

  const inputClass =
    'block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

  async function handleSave() {
    if (!isDirty) return;
    try {
      await saveMeta.mutateAsync({ name: formName, description: formDescription, website: formWebsite });
      toast.success(t('brand.saveSuccess'));
    } catch {
      toast.error(t('brand.saveError'));
    }
  }

  function handleLogoFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      uploadLogo.mutate(file, {
        onError: () => toast.error(t('brand.uploadLogoError')),
      });
    });
  }

  async function handleRemoveLogo(logo: BrandLogoData) {
    try {
      await removeLogo.mutateAsync(logo);
    } catch {
      toast.error(t('brand.removeLogoError'));
    }
  }

  async function confirmColor() {
    setShowColorPicker(false);
    try {
      await addColor.mutateAsync({ hex: pendingColor, name: pendingColor.toUpperCase() });
      setPendingColor('#6366f1');
    } catch {
      toast.error(t('brand.addColorError'));
    }
  }

  async function handleImportFromWebsite() {
    const url = formWebsite.trim();
    if (!url) {
      websiteInputRef.current?.focus();
      return;
    }
    try {
      const result = await scrape.mutateAsync(url);
      setScrapeResult(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('brand.importError'));
    }
  }

  async function applyScrapeResult(fields: { name: boolean; description: boolean; colors: boolean; logo: boolean }) {
    if (!scrapeResult) return;
    if (fields.name && scrapeResult.name) setFormName(scrapeResult.name);
    if (fields.description && scrapeResult.description) setFormDescription(scrapeResult.description);

    if (fields.colors && scrapeResult.colors.length > 0) {
      for (const hex of scrapeResult.colors) {
        await addColor.mutateAsync({ hex, name: hex }).catch(() => null);
      }
    }

    if (fields.logo && scrapeResult.logoUrl) {
      const currentBrandId = brand?.id;
      if (currentBrandId) {
        await importLogo.mutateAsync({ logoUrl: scrapeResult.logoUrl, brandId: currentBrandId }).catch(() => {
          toast.error(t('brand.importLogoError'));
        });
      }
    }

    toast.success(t('brand.importSuccess'));
    setScrapeResult(null);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <SpinnerIcon className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast stack */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toast.toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium shadow-lg ${
              t.kind === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Scrape preview modal */}
      {scrapeResult && (
        <ScrapePreview
          result={scrapeResult}
          onApply={applyScrapeResult}
          onClose={() => setScrapeResult(null)}
          applyingLogo={importLogo.isPending}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{t('brand.title')}</h1>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || saveMeta.isPending}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {saveMeta.isPending && <SpinnerIcon className="h-3.5 w-3.5 animate-spin" />}
          {saveMeta.isPending ? t('brand.saving') : t('brand.save')}
        </button>
      </div>

      {/* Dirty-state banner */}
      {isDirty && !saveMeta.isPending && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
          {t('brand.unsavedChanges')}
        </div>
      )}

      {/* Quick-start shortcuts */}
      <div className="rounded-2xl bg-gray-100 p-5">
        <p className="mb-4 text-base font-semibold text-gray-900">{t('brand.quickStart')}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => { websiteInputRef.current?.focus(); websiteInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-left transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253M3 12c0 .778.099 1.533.284 2.253" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{t('brand.importFromWebsite')}</p>
              <p className="mt-0.5 text-xs text-gray-500">{t('brand.importFromWebsiteDesc')}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-left transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{t('brand.uploadLogo')}</p>
              <p className="mt-0.5 text-xs text-gray-500">{t('brand.uploadLogoDesc')}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setShowColorPicker(true)}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-left transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{t('brand.addColor')}</p>
              <p className="mt-0.5 text-xs text-gray-500">{t('brand.addColorDesc')}</p>
            </div>
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">

        {/* Left — brand info */}
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 self-start">
          <h2 className="text-sm font-semibold text-gray-900">{t('brand.brandInfo')}</h2>

          {/* Website + import */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">{t('brand.website')}</label>
            <div className="flex gap-2">
              <input
                ref={websiteInputRef}
                type="url"
                value={formWebsite}
                onChange={(e) => setFormWebsite(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleImportFromWebsite()}
                placeholder={t('brand.websitePlaceholder')}
                className={inputClass}
              />
              <button
                type="button"
                onClick={handleImportFromWebsite}
                disabled={scrape.isPending}
                title={t('brand.import')}
                className="shrink-0 rounded-xl border border-gray-200 px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                {scrape.isPending ? (
                  <SpinnerIcon className="h-4 w-4 animate-spin text-indigo-500" />
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400">{t('brand.websiteHint')}</p>
          </div>

          {/* Brand name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">{t('brand.brandName')}</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder={t('brand.brandNamePlaceholder')}
              className={inputClass}
            />
          </div>

          {/* Brand description */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">{t('brand.brandDescription')}</label>
            <textarea
              rows={4}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder={t('brand.brandDescriptionPlaceholder')}
              className={inputClass + ' resize-none'}
            />
            <p className="text-xs text-gray-400">{t('brand.brandDescriptionHint')}</p>
          </div>
        </div>

        {/* Right — logos + colors */}
        <div className="space-y-6">

          {/* Logos */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">{t('brand.logos')}</h2>

            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => { handleLogoFiles(e.target.files); e.target.value = ''; }}
            />

            {(brand?.logos ?? []).length === 0 ? (
              <div
                role="button"
                tabIndex={0}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 px-6 py-7 text-sm text-gray-500 hover:border-indigo-300 hover:bg-indigo-50/30"
                onClick={() => logoInputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && logoInputRef.current?.click()}
              >
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                <span>
                  {t('brand.addLogos')}{' '}
                  <span className="text-indigo-600 hover:underline">{t('brand.selectImage')}</span>
                </span>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {(brand?.logos ?? []).map((logo) => (
                  <div key={logo.id} className="group relative overflow-hidden rounded-xl border border-gray-200 p-3">
                    {removeLogo.isPending && removeLogo.variables?.id === logo.id ? (
                      <div className="flex h-20 w-full items-center justify-center">
                        <SpinnerIcon className="h-5 w-5 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <img src={logo.publicUrl} alt={logo.name} className="h-20 w-full object-contain" />
                    )}
                    <p className="mt-2 truncate text-xs text-gray-500">{logo.name}</p>
                    <button
                      type="button"
                      onClick={() => handleRemoveLogo(logo)}
                      className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-white/90 text-gray-400 shadow hover:text-red-500 group-hover:flex"
                    >
                      <XIcon />
                    </button>
                  </div>
                ))}
                {uploadLogo.isPending && (
                  <div className="flex min-h-[96px] items-center justify-center rounded-xl border border-dashed border-gray-300">
                    <SpinnerIcon className="h-5 w-5 animate-spin text-indigo-400" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="flex min-h-[96px] items-center justify-center rounded-xl border border-dashed border-gray-300 text-gray-400 hover:border-indigo-300 hover:text-indigo-500"
                >
                  <PlusIcon />
                </button>
              </div>
            )}
          </div>

          {/* Colors */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">{t('brand.colors')}</h2>

            {showColorPicker && (
              <div className="mb-4 flex items-center gap-4 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
                <div className="relative">
                  <div
                    className="h-10 w-10 cursor-pointer rounded-xl border-2 border-white shadow-md ring-1 ring-gray-200"
                    style={{ backgroundColor: pendingColor }}
                    onClick={() => document.getElementById('inline-color-input')?.click()}
                  />
                  <input
                    id="inline-color-input"
                    type="color"
                    value={pendingColor}
                    onChange={(e) => setPendingColor(e.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </div>
                <span className="font-mono text-sm text-gray-700">{pendingColor.toUpperCase()}</span>
                <div className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(false)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    {t('brand.cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={confirmColor}
                    disabled={addColor.isPending}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {addColor.isPending && <SpinnerIcon className="h-3 w-3 animate-spin" />}
                    {t('brand.select')}
                  </button>
                </div>
              </div>
            )}

            {(brand?.colors ?? []).length === 0 && !showColorPicker ? (
              <div
                role="button"
                tabIndex={0}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-10 text-center hover:border-indigo-300 hover:bg-indigo-50/30"
                onClick={() => setShowColorPicker(true)}
                onKeyDown={(e) => e.key === 'Enter' && setShowColorPicker(true)}
              >
                <svg className="h-8 w-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
                </svg>
                <p className="text-sm text-gray-500">{t('brand.defineColors')}</p>
              </div>
            ) : (brand?.colors ?? []).length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {(brand?.colors ?? []).map((color) => (
                  <div key={color.id} className="group relative flex flex-col items-center gap-1.5">
                    <div className="h-12 w-12 rounded-xl border border-gray-200 shadow-sm" style={{ backgroundColor: color.hex }} />
                    <p className="text-[11px] font-mono text-gray-500">{color.name}</p>
                    <button
                      type="button"
                      onClick={() => removeColor.mutate(color.id, { onError: () => toast.error(t('brand.removeColorError')) })}
                      className="absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-white text-gray-400 shadow hover:text-red-500 group-hover:flex"
                    >
                      <XIcon />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setShowColorPicker(true)}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-gray-300 text-gray-400 hover:border-indigo-300 hover:text-indigo-500"
                >
                  <PlusIcon />
                </button>
              </div>
            ) : null}
          </div>

        </div>
      </div>
    </div>
  );
}
