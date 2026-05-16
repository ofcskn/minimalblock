import { MediaAsset } from '../../domain/value-objects/media-asset.vo.js';

export interface UploadImageInput {
  file: File | Blob;
  fileName: string;
  ownerId: string;
}

export interface IImageUploaderPort {
  upload(input: UploadImageInput): Promise<MediaAsset>;
  remove(storageKey: string): Promise<void>;
}
