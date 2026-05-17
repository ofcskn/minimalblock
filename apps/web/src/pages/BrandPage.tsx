import { useRef, useState } from 'react';

interface LogoAsset {
  id: string;
  name: string;
  url: string;
}

interface BrandColor {
  id: string;
  hex: string;
  name: string;
}

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

export function BrandPage() {
  const [logos, setLogos] = useState<LogoAsset[]>([]);
  const [colors, setColors] = useState<BrandColor[]>([]);
  const [brandName, setBrandName] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [importing, setImporting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingColor, setPendingColor] = useState('#6366f1');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const websiteInputRef = useRef<HTMLInputElement>(null);

  function handleLogoFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      setLogos((prev) => [...prev, { id: crypto.randomUUID(), name: file.name, url }]);
    });
  }

  function confirmColor() {
    setColors((prev) => [...prev, { id: crypto.randomUUID(), hex: pendingColor, name: pendingColor.toUpperCase() }]);
    setShowColorPicker(false);
    setPendingColor('#6366f1');
  }

  async function handleImportFromWebsite() {
    if (!website.trim()) {
      websiteInputRef.current?.focus();
      return;
    }
    setImporting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setImporting(false);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputClass =
    'block w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Marka Kimliği</h1>
        <button
          type="button"
          onClick={handleSave}
          className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          {saved ? 'Kaydedildi ✓' : 'Kaydet'}
        </button>
      </div>

      {/* Quick start */}
      <div className="rounded-2xl bg-gray-100 p-5">
        <p className="mb-4 text-base font-semibold text-gray-900">Hızlı başlangıç</p>
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
              <p className="text-sm font-semibold text-gray-900">Websiteden içe aktar</p>
              <p className="mt-0.5 text-xs text-gray-500">Logo, renk ve fontları websitenizden ekleyin.</p>
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
              <p className="text-sm font-semibold text-gray-900">Logo yükle</p>
              <p className="mt-0.5 text-xs text-gray-500">Marka logonuzu tüm tasarımlarınızda kullanın.</p>
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
              <p className="text-sm font-semibold text-gray-900">Renk ekle</p>
              <p className="mt-0.5 text-xs text-gray-500">Marka renklerini tanımlayın ve her yerde kullanın.</p>
            </div>
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">

        {/* Left — brand info */}
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 self-start">
          <h2 className="text-sm font-semibold text-gray-900">Marka Bilgisi</h2>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <div className="flex gap-2">
              <input
                ref={websiteInputRef}
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://siteniz.com"
                className={inputClass}
              />
              <button
                type="button"
                onClick={handleImportFromWebsite}
                disabled={importing}
                title="İçe aktar"
                className="shrink-0 rounded-xl border border-gray-200 px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                {importing ? (
                  <svg className="h-4 w-4 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400">Logo, renk ve fontları websitenizden içe aktarabiliriz.</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Marka adı</label>
            <input
              id="brand-name-input"
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Marka adınızı girin"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Marka açıklaması</label>
            <textarea
              rows={4}
              value={brandDescription}
              onChange={(e) => setBrandDescription(e.target.value)}
              placeholder="Marka açıklamanızı girin"
              className={inputClass + ' resize-none'}
            />
            <p className="text-xs text-gray-400">Yapay zeka görsellerini kişiselleştirmek için kullanılır.</p>
          </div>
        </div>

        {/* Right — logos + colors */}
        <div className="space-y-6">

          {/* Logos card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Logolar</h2>

            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => { handleLogoFiles(e.target.files); e.target.value = ''; }}
            />

            {logos.length === 0 ? (
              <div
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 px-6 py-7 text-sm text-gray-500 hover:border-indigo-300 hover:bg-indigo-50/30"
                onClick={() => logoInputRef.current?.click()}
              >
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                <span>
                  Marka logolarınızı ekleyin.{' '}
                  <span className="text-indigo-600 hover:underline">Görsel seç</span>
                </span>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {logos.map((logo) => (
                  <div key={logo.id} className="group relative overflow-hidden rounded-xl border border-gray-200 p-3">
                    <img src={logo.url} alt={logo.name} className="h-20 w-full object-contain" />
                    <p className="mt-2 truncate text-xs text-gray-500">{logo.name}</p>
                    <button
                      type="button"
                      onClick={() => setLogos((p) => p.filter((l) => l.id !== logo.id))}
                      className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-white/90 text-gray-400 shadow hover:text-red-500 group-hover:flex"
                    >
                      <XIcon />
                    </button>
                  </div>
                ))}
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

          {/* Colors card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Renkler</h2>

            {/* Inline color picker */}
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
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={confirmColor}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Seç
                  </button>
                </div>
              </div>
            )}

            {colors.length === 0 && !showColorPicker ? (
              <div
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-10 text-center hover:border-indigo-300 hover:bg-indigo-50/30"
                onClick={() => setShowColorPicker(true)}
              >
                <svg className="h-8 w-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
                </svg>
                <p className="text-sm text-gray-500">Marka renklerinizi tanımlayın.</p>
              </div>
            ) : colors.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => (
                  <div key={color.id} className="group relative flex flex-col items-center gap-1.5">
                    <div className="h-12 w-12 rounded-xl border border-gray-200 shadow-sm" style={{ backgroundColor: color.hex }} />
                    <p className="text-[11px] font-mono text-gray-500">{color.name}</p>
                    <button
                      type="button"
                      onClick={() => setColors((p) => p.filter((c) => c.id !== color.id))}
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
