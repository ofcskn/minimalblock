import { IImageUploaderPort, MediaAsset, UploadImageInput } from '@minimalblock/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types.js';

const BUCKET = 'media-assets';

export class SupabaseImageUploader implements IImageUploaderPort {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async upload(input: UploadImageInput): Promise<MediaAsset> {
    const key = `${input.ownerId}/${Date.now()}-${input.fileName}`;
    const { error } = await this.client.storage.from(BUCKET).upload(key, input.file, { upsert: false });
    if (error) throw new Error(`Upload failed: ${error.message}`);

    const { data } = this.client.storage.from(BUCKET).getPublicUrl(key);
    const mimeType = (input.file as File).type as MediaAsset['mimeType'];
    return new MediaAsset({
      url: data.publicUrl,
      storageKey: key,
      mimeType,
      kind: mimeType.startsWith('model/') || mimeType === 'application/octet-stream'
        ? 'generated-model'
        : 'source-image',
      sizeBytes: (input.file as File).size,
    });
  }

  async remove(storageKey: string): Promise<void> {
    await this.client.storage.from(BUCKET).remove([storageKey]);
  }
}
