import { SourceImageReadiness, deriveViewLabel } from './source-image-readiness.vo.js';

const asset = (storageKey: string, sizeBytes = 200_000) => ({
  storageKey,
  url: `https://cdn/${storageKey}`,
  sizeBytes,
});

describe('deriveViewLabel', () => {
  it.each([
    ['seller/product-front.jpg', 'front'],
    ['seller/facing-shot.jpg', 'front'],
    ['seller/main.jpg', 'front'],
    ['seller/back.jpg', 'back'],
    ['seller/rear-view.jpg', 'back'],
    ['seller/left-side.jpg', 'left'],
    ['seller/right-side.jpg', 'right'],
    ['seller/top-down.jpg', 'top'],
    ['seller/overhead.jpg', 'top'],
    ['seller/bottom-view.jpg', 'bottom'],
    ['seller/detail-close.jpg', 'detail'],
    ['seller/macro-shot.jpg', 'detail'],
    ['seller/lifestyle-scene.jpg', 'scale'],
    ['seller/room-context.jpg', 'scale'],
    ['seller/image001.jpg', 'unknown'],
  ])('derives %s → %s', (key, expected) => {
    expect(deriveViewLabel(key)).toBe(expected);
  });
});

describe('SourceImageReadiness.fromMediaAssets', () => {
  it('returns score 0 for empty assets', () => {
    const r = SourceImageReadiness.fromMediaAssets([]);
    expect(r.score).toBe(0);
    expect(r.count).toBe(0);
  });

  it('flags low-resolution for files under 50 KB without dimensions', () => {
    const r = SourceImageReadiness.fromMediaAssets([asset('seller/front.jpg', 30_000)]);
    expect(r.hasLowResImages).toBe(true);
  });

  it('does not flag low-resolution for adequately sized files', () => {
    const r = SourceImageReadiness.fromMediaAssets([asset('seller/front.jpg', 200_000)]);
    expect(r.hasLowResImages).toBe(false);
  });
});

describe('SourceImageReadiness.fromEntries', () => {
  it('stores entries', () => {
    const r = SourceImageReadiness.fromEntries([
      { storageKey: 'x', url: 'y', sizeBytes: 1, viewLabel: 'front', warnings: [] },
    ]);
    expect(r.entries).toHaveLength(1);
  });
});

describe('score', () => {
  it('returns 100 for front + back + detail with no warnings', () => {
    const r = SourceImageReadiness.fromMediaAssets([
      asset('seller/product-front.jpg'),
      asset('seller/product-back.jpg'),
      asset('seller/product-detail.jpg'),
    ]);
    expect(r.score).toBe(100);
  });

  it('deducts 30 for missing front', () => {
    const r = SourceImageReadiness.fromMediaAssets([
      asset('seller/product-back.jpg'),
      asset('seller/product-detail.jpg'),
    ]);
    expect(r.score).toBe(70);
  });

  it('deducts 20 for missing back', () => {
    const r = SourceImageReadiness.fromMediaAssets([
      asset('seller/product-front.jpg'),
      asset('seller/product-detail.jpg'),
    ]);
    expect(r.score).toBe(80);
  });

  it('deducts 10 for missing detail', () => {
    const r = SourceImageReadiness.fromMediaAssets([
      asset('seller/product-front.jpg'),
      asset('seller/product-back.jpg'),
    ]);
    expect(r.score).toBe(90);
  });

  it('clamps score to 0', () => {
    const r = SourceImageReadiness.fromEntries([
      {
        storageKey: 'x', url: 'x', sizeBytes: 1, viewLabel: 'unknown',
        warnings: ['low_resolution', 'likely_duplicate', 'likely_cropped', 'background_inconsistent', 'angle_unclear'],
      },
    ]);
    expect(r.score).toBeGreaterThanOrEqual(0);
  });
});

describe('missingViews', () => {
  it('lists all checklist views when no assets', () => {
    const r = SourceImageReadiness.fromMediaAssets([]);
    expect(r.missingViews).toEqual(
      expect.arrayContaining(['front', 'back', 'left', 'right', 'top', 'bottom', 'detail', 'scale']),
    );
  });

  it('excludes views already covered', () => {
    const r = SourceImageReadiness.fromMediaAssets([asset('seller/front.jpg')]);
    expect(r.missingViews).not.toContain('front');
    expect(r.missingViews).toContain('back');
  });
});

describe('coveredViews', () => {
  it('excludes unknown from covered list', () => {
    const r = SourceImageReadiness.fromMediaAssets([asset('seller/image001.jpg')]);
    expect(r.coveredViews).toHaveLength(0);
  });

  it('includes identified views', () => {
    const r = SourceImageReadiness.fromMediaAssets([
      asset('seller/front.jpg'),
      asset('seller/back.jpg'),
    ]);
    expect(r.coveredViews).toEqual(expect.arrayContaining(['front', 'back']));
  });
});

describe('hasEnoughUniqueViews', () => {
  it('returns false with no images', () => {
    expect(SourceImageReadiness.fromMediaAssets([]).hasEnoughUniqueViews).toBe(false);
  });

  it('returns false with only unknown-angle images', () => {
    const r = SourceImageReadiness.fromMediaAssets([
      asset('seller/image001.jpg'),
      asset('seller/image002.jpg'),
    ]);
    expect(r.hasEnoughUniqueViews).toBe(false);
  });

  it('returns true when front + another labelled view exist', () => {
    const r = SourceImageReadiness.fromMediaAssets([
      asset('seller/front.jpg'),
      asset('seller/back.jpg'),
    ]);
    expect(r.hasEnoughUniqueViews).toBe(true);
  });
});

describe('weakImages', () => {
  it('returns entries with at least one warning', () => {
    const r = SourceImageReadiness.fromEntries([
      { storageKey: 'a', url: 'a', sizeBytes: 100, viewLabel: 'front', warnings: [] },
      { storageKey: 'b', url: 'b', sizeBytes: 100, viewLabel: 'back', warnings: ['low_resolution'] },
    ]);
    expect(r.weakImages).toHaveLength(1);
    expect(r.weakImages[0].storageKey).toBe('b');
  });
});
