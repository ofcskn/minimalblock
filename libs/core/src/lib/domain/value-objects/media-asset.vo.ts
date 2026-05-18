export type MediaAssetType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/svg+xml'
  | 'image/webp'
  | 'model/gltf-binary'
  | 'model/gltf+json'
  | 'application/octet-stream';
export type MediaAssetKind = 'source-image' | 'generated-model';

export interface MediaAssetProps {
  url: string;
  storageKey: string;
  mimeType: MediaAssetType;
  kind: MediaAssetKind;
  sizeBytes: number;
}

export class MediaAsset {
  readonly url: string;
  readonly storageKey: string;
  readonly mimeType: MediaAssetType;
  readonly kind: MediaAssetKind;
  readonly sizeBytes: number;

  constructor(props: MediaAssetProps) {
    this.url = props.url;
    this.storageKey = props.storageKey;
    this.mimeType = props.mimeType;
    this.kind = props.kind;
    this.sizeBytes = props.sizeBytes;
  }

  isSourceImage(): boolean {
    return this.kind === 'source-image';
  }

  is3DModel(): boolean {
    return this.kind === 'generated-model';
  }
}
