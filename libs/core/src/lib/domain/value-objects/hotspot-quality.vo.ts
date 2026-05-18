import type { Hotspot, ProductCategory, SuggestedHotspotType } from '../entities/product.entity.js';

export type HotspotQualityStatus = 'valid' | 'warning' | 'invalid';

export interface HotspotValidationIssue {
  code: string;
  message: string;
  severity: 'warning' | 'invalid';
}

export interface HotspotQualityReport {
  hotspotId: string;
  status: HotspotQualityStatus;
  issues: HotspotValidationIssue[];
}

const MEANINGLESS_LABELS = new Set([
  'hotspot', 'point', 'click here', 'label', 'item', 'thing', 'stuff',
  '123', 'xxx', 'aaa', 'bbb', 'ccc', 'zzz', 'todo', 'placeholder', 'n/a', 'tbd',
  'untitled', 'new hotspot', 'hotspot 1', 'hotspot 2', 'hotspot 3',
]);

const TEST_LABELS = new Set([
  'test', 'testing', 'test label', 'test hotspot', 'test point',
  'foo', 'bar', 'baz', 'qux', 'quux', 'asdf', 'qwerty', 'demo',
  'sample', 'example', 'temp', 'temporary', 'delete me', 'remove',
]);

const VALID_TYPES = new Set<SuggestedHotspotType>([
  'material', 'dimension', 'feature', 'warning', 'assembly',
]);

export class HotspotQuality {
  static validate(hotspot: Hotspot, _category?: ProductCategory): HotspotQualityReport {
    const issues: HotspotValidationIssue[] = [];

    // F.9 — Reject empty labels
    const trimmed = (hotspot.label ?? '').trim();
    if (!trimmed) {
      issues.push({ code: 'empty_label', message: 'Hotspot label must not be empty.', severity: 'invalid' });
    } else {
      const lower = trimmed.toLowerCase();

      // F.10 — Reject meaningless labels
      if (MEANINGLESS_LABELS.has(lower)) {
        issues.push({ code: 'meaningless_label', message: `"${trimmed}" is not a meaningful label. Describe what the buyer sees or touches.`, severity: 'invalid' });
      }

      // F.11 — Reject test labels
      if (TEST_LABELS.has(lower)) {
        issues.push({ code: 'test_label', message: `"${trimmed}" looks like a placeholder label. Replace with a real product detail.`, severity: 'invalid' });
      }

      // F.12 — Label too short (less than 3 chars) to be useful
      if (trimmed.length < 3) {
        issues.push({ code: 'label_too_short', message: 'Label must be at least 3 characters.', severity: 'invalid' });
      }
    }

    // F.13 — Require buyer-useful description
    const desc = (hotspot.description ?? '').trim();
    if (!desc) {
      issues.push({ code: 'missing_description', message: 'Add a buyer-useful description explaining why this detail matters.', severity: 'warning' });
    } else if (desc.length < 10) {
      issues.push({ code: 'description_too_short', message: 'Description is too short to be buyer-useful (minimum 10 characters).', severity: 'warning' });
    }

    // F.14 — Require hotspot type
    if (!hotspot.type || !VALID_TYPES.has(hotspot.type)) {
      issues.push({ code: 'missing_type', message: 'Select a hotspot type (material, dimension, feature, warning, or assembly).', severity: 'warning' });
    }

    // F.16 — Warn when hotspot has no 3D position
    if (!hotspot.position || !hotspot.normal) {
      issues.push({ code: 'missing_position', message: 'Hotspot has no 3D placement. Place it on the model to make it visible.', severity: 'warning' });
    }

    const hasInvalid = issues.some((i) => i.severity === 'invalid');
    const hasWarning = issues.some((i) => i.severity === 'warning');

    let status: HotspotQualityStatus = 'valid';
    if (hasInvalid) status = 'invalid';
    else if (hasWarning) status = 'warning';

    return { hotspotId: hotspot.id, status, issues };
  }

  static validateAll(hotspots: Hotspot[], category?: ProductCategory): HotspotQualityReport[] {
    return hotspots.map((h) => HotspotQuality.validate(h, category));
  }

  static hasInvalidHotspots(hotspots: Hotspot[], category?: ProductCategory): boolean {
    return hotspots.some((h) => HotspotQuality.validate(h, category).status === 'invalid');
  }

  static allApproved(hotspots: Hotspot[]): boolean {
    return hotspots.length > 0 && hotspots.every((h) => h.approved === true);
  }
}
