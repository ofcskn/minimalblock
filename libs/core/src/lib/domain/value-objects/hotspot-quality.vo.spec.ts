import { HotspotQuality } from './hotspot-quality.vo.js';
import type { Hotspot } from '../entities/product.entity.js';

function makeHotspot(overrides: Partial<Hotspot> = {}): Hotspot {
  return {
    id: 'h-1',
    label: 'Anodized Aluminum Frame',
    description: 'Lightweight aerospace-grade aluminium resists dents and scratches.',
    type: 'material',
    position: '0.1 0.2 0.3',
    normal: '0 1 0',
    approved: true,
    ...overrides,
  };
}

describe('HotspotQuality.validate', () => {
  describe('F.9 — empty label', () => {
    it('marks empty label as invalid', () => {
      const report = HotspotQuality.validate(makeHotspot({ label: '' }));
      expect(report.status).toBe('invalid');
      expect(report.issues.some((i) => i.code === 'empty_label')).toBe(true);
    });

    it('marks whitespace-only label as invalid', () => {
      const report = HotspotQuality.validate(makeHotspot({ label: '   ' }));
      expect(report.status).toBe('invalid');
      expect(report.issues.some((i) => i.code === 'empty_label')).toBe(true);
    });
  });

  describe('F.10 — meaningless labels', () => {
    it.each(['hotspot', 'point', 'label', 'todo', 'placeholder', 'untitled'])(
      'marks "%s" as invalid (meaningless)',
      (label) => {
        const report = HotspotQuality.validate(makeHotspot({ label }));
        expect(report.status).toBe('invalid');
        expect(report.issues.some((i) => i.code === 'meaningless_label')).toBe(true);
      },
    );

    it('is case-insensitive for meaningless labels', () => {
      const report = HotspotQuality.validate(makeHotspot({ label: 'HOTSPOT' }));
      expect(report.issues.some((i) => i.code === 'meaningless_label')).toBe(true);
    });
  });

  describe('F.11 — test labels', () => {
    it.each(['test', 'foo', 'bar', 'baz', 'asdf', 'qwerty', 'demo', 'temp'])(
      'marks "%s" as invalid (test label)',
      (label) => {
        const report = HotspotQuality.validate(makeHotspot({ label }));
        expect(report.status).toBe('invalid');
        expect(report.issues.some((i) => i.code === 'test_label')).toBe(true);
      },
    );
  });

  describe('F.12 — label too short', () => {
    it('marks single-character label as invalid', () => {
      const report = HotspotQuality.validate(makeHotspot({ label: 'X' }));
      expect(report.issues.some((i) => i.code === 'label_too_short')).toBe(true);
    });

    it('accepts 3-character labels', () => {
      const report = HotspotQuality.validate(makeHotspot({ label: 'USB' }));
      expect(report.issues.some((i) => i.code === 'label_too_short')).toBe(false);
    });
  });

  describe('F.13 — buyer-useful description', () => {
    it('warns when description is missing', () => {
      const report = HotspotQuality.validate(makeHotspot({ description: undefined }));
      expect(report.status).toBe('warning');
      expect(report.issues.some((i) => i.code === 'missing_description')).toBe(true);
    });

    it('warns when description is too short', () => {
      const report = HotspotQuality.validate(makeHotspot({ description: 'Short' }));
      expect(report.issues.some((i) => i.code === 'description_too_short')).toBe(true);
    });

    it('accepts a useful description of 10+ characters', () => {
      const report = HotspotQuality.validate(makeHotspot({ description: 'High-tensile steel frame.' }));
      expect(report.issues.some((i) => i.code === 'missing_description')).toBe(false);
      expect(report.issues.some((i) => i.code === 'description_too_short')).toBe(false);
    });
  });

  describe('F.14 — require hotspot type', () => {
    it('warns when type is missing', () => {
      const report = HotspotQuality.validate(makeHotspot({ type: undefined }));
      expect(report.issues.some((i) => i.code === 'missing_type')).toBe(true);
    });

    it.each(['material', 'dimension', 'feature', 'warning', 'assembly'] as const)(
      'accepts valid type "%s"',
      (type) => {
        const report = HotspotQuality.validate(makeHotspot({ type }));
        expect(report.issues.some((i) => i.code === 'missing_type')).toBe(false);
      },
    );
  });

  describe('F.16 — 3D placement', () => {
    it('warns when position is missing', () => {
      const report = HotspotQuality.validate(makeHotspot({ position: undefined }));
      expect(report.issues.some((i) => i.code === 'missing_position')).toBe(true);
    });

    it('warns when normal is missing', () => {
      const report = HotspotQuality.validate(makeHotspot({ normal: undefined }));
      expect(report.issues.some((i) => i.code === 'missing_position')).toBe(true);
    });

    it('does not warn when both position and normal are present', () => {
      const report = HotspotQuality.validate(makeHotspot({ position: '0.1 0.2 0.3', normal: '0 1 0' }));
      expect(report.issues.some((i) => i.code === 'missing_position')).toBe(false);
    });
  });

  describe('status aggregation', () => {
    it('is "valid" when no issues exist', () => {
      const report = HotspotQuality.validate(makeHotspot());
      expect(report.status).toBe('valid');
      expect(report.issues).toHaveLength(0);
    });

    it('is "invalid" when any invalid issue exists', () => {
      const report = HotspotQuality.validate(makeHotspot({ label: '' }));
      expect(report.status).toBe('invalid');
    });

    it('is "warning" when only warnings exist', () => {
      const report = HotspotQuality.validate(makeHotspot({ type: undefined, description: undefined }));
      expect(report.status).toBe('warning');
    });

    it('is "invalid" when both invalid and warning issues exist', () => {
      const report = HotspotQuality.validate(makeHotspot({ label: 'test', type: undefined }));
      expect(report.status).toBe('invalid');
    });
  });
});

describe('HotspotQuality.validateAll', () => {
  it('returns a report for each hotspot', () => {
    const hotspots = [makeHotspot({ id: 'h-1' }), makeHotspot({ id: 'h-2', label: '' })];
    const reports = HotspotQuality.validateAll(hotspots);
    expect(reports).toHaveLength(2);
    expect(reports[0].status).toBe('valid');
    expect(reports[1].status).toBe('invalid');
  });
});

describe('HotspotQuality.hasInvalidHotspots', () => {
  it('returns false when all hotspots are valid', () => {
    expect(HotspotQuality.hasInvalidHotspots([makeHotspot()])).toBe(false);
  });

  it('returns true when any hotspot is invalid', () => {
    expect(HotspotQuality.hasInvalidHotspots([makeHotspot(), makeHotspot({ label: '' })])).toBe(true);
  });

  it('returns false for an empty array', () => {
    expect(HotspotQuality.hasInvalidHotspots([])).toBe(false);
  });
});

describe('HotspotQuality.allApproved', () => {
  it('returns true when all hotspots are approved', () => {
    expect(HotspotQuality.allApproved([makeHotspot({ approved: true }), makeHotspot({ id: 'h-2', approved: true })])).toBe(true);
  });

  it('returns false when any hotspot is not approved', () => {
    expect(HotspotQuality.allApproved([makeHotspot({ approved: true }), makeHotspot({ id: 'h-2', approved: false })])).toBe(false);
  });

  it('returns false for an empty array', () => {
    expect(HotspotQuality.allApproved([])).toBe(false);
  });
});
