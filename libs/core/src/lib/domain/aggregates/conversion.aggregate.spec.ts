import { Conversion } from './conversion.aggregate.js';
import { MediaAsset } from '../value-objects/media-asset.vo.js';
import { ConversionStatus } from '../value-objects/conversion-status.vo.js';

const sourceAsset = new MediaAsset({
  url: 'https://cdn/img.jpg',
  storageKey: 'u1/img.jpg',
  mimeType: 'image/jpeg',
  kind: 'source-image',
  sizeBytes: 2048,
});

const outputAsset = new MediaAsset({
  url: 'https://cdn/model.glb',
  storageKey: 'u1/model.glb',
  mimeType: 'model/gltf-binary',
  kind: 'generated-model',
  sizeBytes: 512000,
});

describe('Conversion aggregate', () => {
  describe('Conversion.create', () => {
    it('creates a pending conversion with correct fields', () => {
      const c = Conversion.create('id-1', 'prod-1', 'user-1', sourceAsset);
      expect(c.id).toBe('id-1');
      expect(c.productId).toBe('prod-1');
      expect(c.ownerId).toBe('user-1');
      expect(c.sourceAsset).toBe(sourceAsset);
      expect(c.status.isPending()).toBe(true);
      expect(c.outputAsset).toBeUndefined();
    });
  });

  describe('markProcessing', () => {
    it('transitions pending → processing', () => {
      const c = Conversion.create('id-1', 'prod-1', 'user-1', sourceAsset).markProcessing();
      expect(c.status.isProcessing()).toBe(true);
    });

    it('throws when called on a non-pending conversion', () => {
      const processing = Conversion.create('id-1', 'prod-1', 'user-1', sourceAsset).markProcessing();
      expect(() => processing.markProcessing()).toThrow('Only pending conversions can begin processing');
    });
  });

  describe('markCompleted', () => {
    it('transitions processing → completed and attaches outputAsset', () => {
      const c = Conversion.create('id-1', 'prod-1', 'user-1', sourceAsset)
        .markProcessing()
        .markCompleted(outputAsset);
      expect(c.status.isCompleted()).toBe(true);
      expect(c.outputAsset).toBe(outputAsset);
    });

    it('throws when called on a non-processing conversion', () => {
      const pending = Conversion.create('id-1', 'prod-1', 'user-1', sourceAsset);
      expect(() => pending.markCompleted(outputAsset)).toThrow('Only processing conversions can be completed');
    });
  });

  describe('markFailed', () => {
    it('transitions any state → failed with error message', () => {
      const c = Conversion.create('id-1', 'prod-1', 'user-1', sourceAsset).markFailed('API timeout');
      expect(c.status.isFailed()).toBe(true);
      expect(c.errorMessage).toBe('API timeout');
    });

    it('can fail from processing state', () => {
      const c = Conversion.create('id-1', 'prod-1', 'user-1', sourceAsset)
        .markProcessing()
        .markFailed('Gemini error');
      expect(c.status.isFailed()).toBe(true);
      expect(c.errorMessage).toBe('Gemini error');
    });
  });

  describe('isAccessibleBy', () => {
    it('returns true for the owner', () => {
      const c = Conversion.create('id-1', 'prod-1', 'user-1', sourceAsset);
      expect(c.isAccessibleBy('user-1')).toBe(true);
    });

    it('returns false for a different user', () => {
      const c = Conversion.create('id-1', 'prod-1', 'user-1', sourceAsset);
      expect(c.isAccessibleBy('user-2')).toBe(false);
    });
  });

  describe('immutability', () => {
    it('returns a new instance on each state transition', () => {
      const pending = Conversion.create('id-1', 'prod-1', 'user-1', sourceAsset);
      const processing = pending.markProcessing();
      expect(processing).not.toBe(pending);
      expect(pending.status.isPending()).toBe(true);
    });

    it('updates updatedAt on transition', () => {
      const pending = Conversion.create('id-1', 'prod-1', 'user-1', sourceAsset);
      const processing = pending.markProcessing();
      expect(processing.updatedAt.getTime()).toBeGreaterThanOrEqual(pending.updatedAt.getTime());
    });

    it('preserves ConversionStatus type across transitions', () => {
      const c = Conversion.create('id-1', 'prod-1', 'user-1', sourceAsset).markProcessing();
      expect(c.status).toBeInstanceOf(ConversionStatus);
    });
  });
});
