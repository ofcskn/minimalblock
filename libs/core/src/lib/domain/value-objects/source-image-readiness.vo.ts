export type ImageViewLabel =
  | 'front'
  | 'back'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'detail'
  | 'scale'
  | 'unknown';

export type ImageQualityWarning =
  | 'low_resolution'
  | 'likely_duplicate'
  | 'likely_cropped'
  | 'background_inconsistent'
  | 'angle_unclear';

export interface SourceImageEntry {
  storageKey: string;
  url: string;
  sizeBytes: number;
  viewLabel: ImageViewLabel;
  widthPx?: number;
  heightPx?: number;
  warnings: ImageQualityWarning[];
}

const CHECKLIST_VIEWS: ImageViewLabel[] = [
  'front', 'back', 'left', 'right', 'top', 'bottom', 'detail', 'scale',
];

const MIN_RECOMMENDED_PX = 800;

export function deriveViewLabel(storageKey: string): ImageViewLabel {
  const name = storageKey.split('/').pop()?.toLowerCase() ?? '';
  if (/front|facing|main/.test(name)) return 'front';
  if (/back|rear/.test(name)) return 'back';
  if (/\bleft\b/.test(name)) return 'left';
  if (/\bright\b/.test(name)) return 'right';
  if (/top|above|overhead/.test(name)) return 'top';
  if (/bottom|under|base/.test(name)) return 'bottom';
  if (/detail|close|zoom|macro/.test(name)) return 'detail';
  if (/scale|context|lifestyle|room|scene/.test(name)) return 'scale';
  return 'unknown';
}

function deriveWarningsFromMeta(entry: Pick<SourceImageEntry, 'sizeBytes' | 'widthPx' | 'heightPx' | 'viewLabel'>): ImageQualityWarning[] {
  const warnings: ImageQualityWarning[] = [];
  if (entry.widthPx !== undefined && entry.heightPx !== undefined) {
    if (entry.widthPx < MIN_RECOMMENDED_PX || entry.heightPx < MIN_RECOMMENDED_PX) {
      warnings.push('low_resolution');
    }
  } else if (entry.sizeBytes < 50_000) {
    warnings.push('low_resolution');
  }
  if (entry.viewLabel === 'unknown') {
    warnings.push('angle_unclear');
  }
  return warnings;
}

function computeScore(entries: SourceImageEntry[]): number {
  if (entries.length === 0) return 0;
  const labels = new Set(entries.map((e) => e.viewLabel));
  let score = 100;
  if (!labels.has('front')) score -= 30;
  if (!labels.has('back')) score -= 20;
  if (!labels.has('detail')) score -= 10;
  for (const entry of entries) {
    for (const w of entry.warnings) {
      if (w === 'likely_duplicate') score -= 10;
      else if (w === 'low_resolution') score -= 8;
      else if (w === 'likely_cropped') score -= 5;
      else if (w === 'background_inconsistent') score -= 5;
      else if (w === 'angle_unclear') score -= 5;
    }
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

export class SourceImageReadiness {
  readonly entries: SourceImageEntry[];

  private constructor(entries: SourceImageEntry[]) {
    this.entries = entries;
  }

  static fromEntries(entries: SourceImageEntry[]): SourceImageReadiness {
    return new SourceImageReadiness(entries);
  }

  static fromMediaAssets(assets: Array<{ storageKey: string; url: string; sizeBytes: number }>): SourceImageReadiness {
    const entries: SourceImageEntry[] = assets.map((asset) => {
      const viewLabel = deriveViewLabel(asset.storageKey);
      const warnings = deriveWarningsFromMeta({ sizeBytes: asset.sizeBytes, viewLabel });
      return { storageKey: asset.storageKey, url: asset.url, sizeBytes: asset.sizeBytes, viewLabel, warnings };
    });
    return new SourceImageReadiness(entries);
  }

  get count(): number {
    return this.entries.length;
  }

  get score(): number {
    return computeScore(this.entries);
  }

  get missingViews(): ImageViewLabel[] {
    const present = new Set(this.entries.map((e) => e.viewLabel));
    return CHECKLIST_VIEWS.filter((v) => !present.has(v));
  }

  get coveredViews(): ImageViewLabel[] {
    const present = new Set<ImageViewLabel>(this.entries.map((e) => e.viewLabel).filter((v) => v !== 'unknown'));
    return CHECKLIST_VIEWS.filter((v) => present.has(v));
  }

  get hasEnoughUniqueViews(): boolean {
    const labels = new Set(this.entries.map((e) => e.viewLabel).filter((v) => v !== 'unknown'));
    return labels.has('front') && labels.size >= 2;
  }

  get weakImages(): SourceImageEntry[] {
    return this.entries.filter((e) => e.warnings.length > 0);
  }

  get hasDuplicates(): boolean {
    return this.entries.some((e) => e.warnings.includes('likely_duplicate'));
  }

  get hasLowResImages(): boolean {
    return this.entries.some((e) => e.warnings.includes('low_resolution'));
  }
}
