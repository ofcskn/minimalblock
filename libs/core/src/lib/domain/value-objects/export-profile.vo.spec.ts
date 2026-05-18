import { ExportProfileFactory } from './export-profile.vo.js';
import { ProductWorkflowStatus } from './product-workflow-status.vo.js';

describe('ExportProfileFactory', () => {
  describe('forStatus', () => {
    it('returns exactly 4 profiles', () => {
      const profiles = ExportProfileFactory.forStatus(ProductWorkflowStatus.approved());
      expect(profiles).toHaveLength(4);
    });

    it('returns all 4 targets', () => {
      const profiles = ExportProfileFactory.forStatus(ProductWorkflowStatus.approved());
      const targets = profiles.map((p) => p.target);
      expect(targets).toContain('public_page');
      expect(targets).toContain('embed');
      expect(targets).toContain('trendyol');
      expect(targets).toContain('shopify');
    });

    describe('approved status', () => {
      const profiles = ExportProfileFactory.forStatus(ProductWorkflowStatus.approved());

      it('public_page is available', () => {
        expect(profiles.find((p) => p.target === 'public_page')?.available).toBe(true);
      });
      it('embed is available', () => {
        expect(profiles.find((p) => p.target === 'embed')?.available).toBe(true);
      });
      it('trendyol is not available', () => {
        expect(profiles.find((p) => p.target === 'trendyol')?.available).toBe(false);
      });
      it('shopify is not available', () => {
        expect(profiles.find((p) => p.target === 'shopify')?.available).toBe(false);
      });
    });

    describe('published status', () => {
      const profiles = ExportProfileFactory.forStatus(ProductWorkflowStatus.published());

      it('public_page is available', () => {
        expect(profiles.find((p) => p.target === 'public_page')?.available).toBe(true);
      });
      it('embed is available', () => {
        expect(profiles.find((p) => p.target === 'embed')?.available).toBe(true);
      });
      it('trendyol is available only when published', () => {
        expect(profiles.find((p) => p.target === 'trendyol')?.available).toBe(true);
      });
      it('shopify is never available', () => {
        expect(profiles.find((p) => p.target === 'shopify')?.available).toBe(false);
      });
    });

    describe('non-exportable statuses', () => {
      it('public_page and embed are blocked for needs_fix', () => {
        const profiles = ExportProfileFactory.forStatus(ProductWorkflowStatus.needsFix());
        expect(profiles.find((p) => p.target === 'public_page')?.available).toBe(false);
        expect(profiles.find((p) => p.target === 'embed')?.available).toBe(false);
      });
      it('trendyol is blocked for approved (not yet published)', () => {
        const profiles = ExportProfileFactory.forStatus(ProductWorkflowStatus.approved());
        expect(profiles.find((p) => p.target === 'trendyol')?.available).toBe(false);
      });
      it('shopify is blocked for published', () => {
        const profiles = ExportProfileFactory.forStatus(ProductWorkflowStatus.published());
        expect(profiles.find((p) => p.target === 'shopify')?.available).toBe(false);
      });
    });

    it('accepts a raw status value string', () => {
      const profiles = ExportProfileFactory.forStatus('approved');
      expect(profiles.find((p) => p.target === 'public_page')?.available).toBe(true);
    });
  });
});
