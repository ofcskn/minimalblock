import { Conversion } from './conversion.aggregate.js';
import { MediaAsset } from '../value-objects/media-asset.vo.js';
import { ConversionStatus } from '../value-objects/conversion-status.vo.js';
import { QualityReport } from '../value-objects/quality-report.vo.js';

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

  describe('approval workflow', () => {
    const quality = new QualityReport({
      fileSizeBytes: 2_000_000,
      triangleCount: 50_000,
      textureMaxDim: 1024,
      hasUSDZ: false,
      arCompat: true,
      warnings: [],
    });

    it('processing → awaiting_approval attaches quality + output', () => {
      const c = Conversion.create('id-1', 'prod-1', 'user-1', sourceAsset)
        .markProcessing()
        .markAwaitingApproval(outputAsset, quality);
      expect(c.status.isAwaitingApproval()).toBe(true);
      expect(c.outputAsset).toBe(outputAsset);
      expect(c.qualityReport).toBe(quality);
    });

    it('rejects awaiting_approval from non-processing state', () => {
      const pending = Conversion.create('id-1', 'prod-1', 'user-1', sourceAsset);
      expect(() => pending.markAwaitingApproval(outputAsset, quality)).toThrow();
    });

    it('approve from awaiting_approval stamps approvedBy/approvedAt', () => {
      const c = Conversion.create('id-1', 'prod-1', 'user-1', sourceAsset)
        .markProcessing()
        .markAwaitingApproval(outputAsset, quality)
        .approve('user-1');
      expect(c.status.isApproved()).toBe(true);
      expect(c.approvedBy).toBe('user-1');
      expect(c.approvedAt).toBeInstanceOf(Date);
    });

    it('approve from legacy completed is allowed (backwards-compat)', () => {
      const c = Conversion.create('id-1', 'prod-1', 'user-1', sourceAsset)
        .markProcessing()
        .markCompleted(outputAsset)
        .approve('user-1');
      expect(c.status.isApproved()).toBe(true);
    });

    it('reject requires awaiting_approval and stores reason', () => {
      const c = Conversion.create('id-1', 'prod-1', 'user-1', sourceAsset)
        .markProcessing()
        .markAwaitingApproval(outputAsset, quality)
        .reject('low quality');
      expect(c.status.isRejected()).toBe(true);
      expect(c.rejectionReason).toBe('low quality');
    });

    it('reject from processing throws', () => {
      const c = Conversion.create('id-1', 'prod-1', 'user-1', sourceAsset).markProcessing();
      expect(() => c.reject('nope')).toThrow();
    });

    it('approve from processing throws', () => {
      const c = Conversion.create('id-1', 'prod-1', 'user-1', sourceAsset).markProcessing();
      expect(() => c.approve('user-1')).toThrow();
    });
  });

  describe('multi-image input', () => {
    const second = new MediaAsset({
      url: 'https://cdn/img2.jpg',
      storageKey: 'u1/img2.jpg',
      mimeType: 'image/jpeg',
      kind: 'source-image',
      sizeBytes: 4096,
    });

    it('defaults sourceAssets to [sourceAsset] when not provided', () => {
      const c = Conversion.create('id-1', 'prod-1', 'user-1', sourceAsset);
      expect(c.sourceAssets).toEqual([sourceAsset]);
    });

    it('accepts multiple source assets', () => {
      const c = Conversion.create('id-1', 'prod-1', 'user-1', sourceAsset, [sourceAsset, second]);
      expect(c.sourceAssets).toHaveLength(2);
      expect(c.sourceAssets[1]).toBe(second);
    });

    it('preserves sourceAssets across transitions', () => {
      const c = Conversion.create('id-1', 'prod-1', 'user-1', sourceAsset, [sourceAsset, second])
        .markProcessing('meshy');
      expect(c.sourceAssets).toHaveLength(2);
      expect(c.provider).toBe('meshy');
    });
  });

  describe('modelSource', () => {
    it('defaults to ai-generated on Conversion.create', () => {
      const c = Conversion.create('id-1', 'prod-1', 'user-1', sourceAsset);
      expect(c.modelSource).toBe('ai-generated');
    });

    it('createManual sets modelSource to manual-fallback', () => {
      const c = Conversion.createManual('id-m', 'prod-1', 'user-1', sourceAsset, outputAsset);
      expect(c.modelSource).toBe('manual-fallback');
    });

    it('createManual starts in awaiting_approval so merchant review is required', () => {
      const c = Conversion.createManual('id-m', 'prod-1', 'user-1', sourceAsset, outputAsset);
      expect(c.status.isAwaitingApproval()).toBe(true);
    });

    it('createManual does not auto-approve — approve must be called explicitly', () => {
      const c = Conversion.createManual('id-m', 'prod-1', 'user-1', sourceAsset, outputAsset);
      expect(c.status.isApproved()).toBe(false);
    });

    it('modelSource is preserved across state transitions', () => {
      const c = Conversion.createManual('id-m', 'prod-1', 'user-1', sourceAsset, outputAsset)
        .approve('user-1');
      expect(c.modelSource).toBe('manual-fallback');
    });

    it('ai-generated modelSource is preserved across transitions', () => {
      const c = Conversion.create('id-1', 'prod-1', 'user-1', sourceAsset)
        .markProcessing()
        .markCompleted(outputAsset);
      expect(c.modelSource).toBe('ai-generated');
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
