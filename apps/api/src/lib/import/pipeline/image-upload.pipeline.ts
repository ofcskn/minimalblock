import { Buffer } from 'node:buffer';
import { generateId, type ImportedImageCandidate, type MediaAssetType } from '@minimalblock/core';
import type { ScrapedImageCandidate } from '@minimalblock/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@minimalblock/data';

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48) || 'product';
}

function mimeExtension(mimeType: string): string {
  switch (mimeType) {
    case 'image/png': return 'png';
    case 'image/svg+xml': return 'svg';
    case 'image/webp': return 'webp';
    default: return 'jpg';
  }
}

function decodeDataUrl(raw: string): { mimeType: string; buffer: Buffer } | null {
  if (!raw.startsWith('data:')) return null;
  const match = raw.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], buffer: Buffer.from(match[2], 'base64') };
}

export type UploadedImportImage = ImportedImageCandidate;

export class ImageUploadPipeline {
  constructor(
    private readonly admin: SupabaseClient<Database>,
    private readonly ownerId: string,
  ) {}

  async upload(images: ScrapedImageCandidate[]): Promise<UploadedImportImage[]> {
    const uploaded: UploadedImportImage[] = [];
    for (const image of images) {
      try {
        const result = await this.fetchAndUpload(image);
        uploaded.push(result);
      } catch (error) {
        uploaded.push({
          id: generateId(),
          sourceUrl: image.sourceUrl,
          ordinal: image.ordinal,
          selected: false,
          warnings: image.warnings,
          confidence: image.confidence,
          widthPx: image.widthPx,
          heightPx: image.heightPx,
          alt: image.alt,
          title: image.title,
          failureReasons: [error instanceof Error ? error.message : 'image_download_failed'],
        });
      }
    }
    return uploaded;
  }

  private async fetchAndUpload(image: ScrapedImageCandidate): Promise<UploadedImportImage> {
    const decoded = decodeDataUrl(image.sourceUrl);
    const response = decoded
      ? null
      : await fetch(image.sourceUrl, {
          headers: {
            'user-agent': 'MinimalBlockBot/1.0 (+https://minimalblock.demo)',
            accept: 'image/*',
          },
        });

    const mimeType = decoded?.mimeType ?? response?.headers.get('content-type')?.split(';')[0] ?? '';
    if (!mimeType.startsWith('image/')) throw new Error('non_image_response');

    const normalizedMimeType: MediaAssetType =
      mimeType === 'image/png' || mimeType === 'image/webp' || mimeType === 'image/svg+xml'
        ? mimeType
        : 'image/jpeg';

    const bytes = decoded?.buffer ?? Buffer.from(await response!.arrayBuffer());
    const fileName = `${Date.now()}-${slugify(image.title ?? image.alt ?? `import-${image.ordinal}`)}.${mimeExtension(normalizedMimeType)}`;
    const storageKey = `${this.ownerId}/imports/${fileName}`;

    const { error } = await this.admin.storage.from('media-assets').upload(storageKey, bytes, {
      contentType: normalizedMimeType,
      upsert: false,
    });
    if (error) throw new Error('image_upload_failed');

    const { data } = this.admin.storage.from('media-assets').getPublicUrl(storageKey);

    return {
      id: generateId(),
      sourceUrl: image.sourceUrl,
      url: data.publicUrl,
      storageKey,
      mimeType: normalizedMimeType,
      sizeBytes: bytes.byteLength,
      ordinal: image.ordinal,
      selected: true,
      warnings: image.warnings,
      confidence: image.confidence,
      widthPx: image.widthPx,
      heightPx: image.heightPx,
      alt: image.alt,
      title: image.title,
    };
  }
}
