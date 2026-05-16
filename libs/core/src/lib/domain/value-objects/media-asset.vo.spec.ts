import { MediaAsset } from './media-asset.vo.js';

const makeSourceImage = () =>
  new MediaAsset({ url: 'https://cdn/img.jpg', storageKey: 'user1/img.jpg', mimeType: 'image/jpeg', kind: 'source-image', sizeBytes: 1024 });

const makeGeneratedModel = () =>
  new MediaAsset({ url: 'https://cdn/model.glb', storageKey: 'user1/model.glb', mimeType: 'model/gltf-binary', kind: 'generated-model', sizeBytes: 204800 });

describe('MediaAsset', () => {
  it('stores all props', () => {
    const asset = makeSourceImage();
    expect(asset.url).toBe('https://cdn/img.jpg');
    expect(asset.storageKey).toBe('user1/img.jpg');
    expect(asset.mimeType).toBe('image/jpeg');
    expect(asset.kind).toBe('source-image');
    expect(asset.sizeBytes).toBe(1024);
  });

  describe('isSourceImage', () => {
    it('returns true for source-image kind', () => {
      expect(makeSourceImage().isSourceImage()).toBe(true);
    });
    it('returns false for generated-model kind', () => {
      expect(makeGeneratedModel().isSourceImage()).toBe(false);
    });
  });

  describe('is3DModel', () => {
    it('returns true for generated-model kind', () => {
      expect(makeGeneratedModel().is3DModel()).toBe(true);
    });
    it('returns false for source-image kind', () => {
      expect(makeSourceImage().is3DModel()).toBe(false);
    });
  });
});
