import { QualityReport } from '@minimalblock/core';

describe('api quality report heuristics', () => {
  it('scores a small model above a large one', () => {
    const small = new QualityReport({
      fileSizeBytes: 2_000_000,
      triangleCount: 50_000,
      textureMaxDim: 2048,
      hasUSDZ: false,
      arCompat: true,
      warnings: [],
    });

    const large = new QualityReport({
      fileSizeBytes: 18_000_000,
      triangleCount: 250_000,
      textureMaxDim: 4096,
      hasUSDZ: false,
      arCompat: true,
      warnings: ['too large'],
    });

    expect(small.score()).toBeGreaterThan(large.score());
  });
});
