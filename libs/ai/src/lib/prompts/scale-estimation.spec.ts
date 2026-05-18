import { getStaticScaleBounds } from './scale-estimation.prompt.js';

describe('getStaticScaleBounds', () => {
  // ─── Known categories ───────────────────────────────────────────────────────

  it('returns car bounds in vehicle range (W 1.6–2.1 m)', () => {
    const bounds = getStaticScaleBounds('car');
    expect(bounds.widthM.min).toBeGreaterThanOrEqual(1.6);
    expect(bounds.widthM.max).toBeLessThanOrEqual(2.1);
    expect(bounds.widthM.best).toBeGreaterThan(0);
  });

  it('returns phone bounds in sub-10cm range', () => {
    const bounds = getStaticScaleBounds('phone');
    expect(bounds.widthM.max).toBeLessThan(0.2);
    expect(bounds.heightM.max).toBeLessThan(0.25);
  });

  it('returns bottle height in 15–35cm range', () => {
    const bounds = getStaticScaleBounds('bottle');
    expect(bounds.heightM.min).toBeCloseTo(0.15);
    expect(bounds.heightM.max).toBeCloseTo(0.35);
  });

  it('returns chair height in 80–110cm range', () => {
    const bounds = getStaticScaleBounds('chair');
    expect(bounds.heightM.min).toBeCloseTo(0.8);
    expect(bounds.heightM.max).toBeCloseTo(1.1);
  });

  it('returns laptop depth in 15–30cm range (closed)', () => {
    const bounds = getStaticScaleBounds('laptop');
    expect(bounds.depthM.min).toBeCloseTo(0.15);
    expect(bounds.depthM.max).toBeCloseTo(0.30);
  });

  it('returns ring bounds in mm-to-cm scale', () => {
    const bounds = getStaticScaleBounds('ring');
    expect(bounds.widthM.max).toBeLessThan(0.05);
    expect(bounds.widthM.min).toBeGreaterThan(0);
  });

  // ─── best values ────────────────────────────────────────────────────────────

  it('best value is midpoint of min/max', () => {
    const bounds = getStaticScaleBounds('chair');
    expect(bounds.widthM.best).toBeCloseTo((bounds.widthM.min + bounds.widthM.max) / 2);
    expect(bounds.heightM.best).toBeCloseTo((bounds.heightM.min + bounds.heightM.max) / 2);
    expect(bounds.depthM.best).toBeCloseTo((bounds.depthM.min + bounds.depthM.max) / 2);
  });

  // ─── Confidence / source ────────────────────────────────────────────────────

  it('returns medium confidence for known categories', () => {
    expect(getStaticScaleBounds('laptop').confidence).toBe('medium');
    expect(getStaticScaleBounds('car').confidence).toBe('medium');
  });

  it('returns low confidence for unknown category', () => {
    expect(getStaticScaleBounds('spaceship').confidence).toBe('low');
  });

  it('uses category-knowledge as referenceSource when no dimensions declared', () => {
    expect(getStaticScaleBounds('chair').referenceSource).toBe('category-knowledge');
  });

  it('uses declared-dimensions as referenceSource when dimensions are provided', () => {
    expect(getStaticScaleBounds('chair', '45 x 45 x 88 cm').referenceSource).toBe('declared-dimensions');
  });

  // ─── Unknown fallback ────────────────────────────────────────────────────────

  it('returns a non-zero best value for unknown categories', () => {
    const bounds = getStaticScaleBounds('ufo-shaped-desk');
    expect(bounds.widthM.best).toBeGreaterThan(0);
    expect(bounds.heightM.best).toBeGreaterThan(0);
    expect(bounds.depthM.best).toBeGreaterThan(0);
  });

  it('returns min < best < max for all axes for unknown categories', () => {
    const bounds = getStaticScaleBounds('unknown-product-42');
    expect(bounds.widthM.min).toBeLessThan(bounds.widthM.best);
    expect(bounds.widthM.best).toBeLessThan(bounds.widthM.max);
  });
});
