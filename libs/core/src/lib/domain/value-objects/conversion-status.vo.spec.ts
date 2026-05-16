import { ConversionStatus } from './conversion-status.vo.js';

describe('ConversionStatus', () => {
  describe('factory constructors', () => {
    it('creates pending status', () => {
      expect(ConversionStatus.pending().value).toBe('pending');
    });
    it('creates processing status', () => {
      expect(ConversionStatus.processing().value).toBe('processing');
    });
    it('creates completed status', () => {
      expect(ConversionStatus.completed().value).toBe('completed');
    });
    it('creates failed status', () => {
      expect(ConversionStatus.failed().value).toBe('failed');
    });
    it('creates from string value', () => {
      expect(ConversionStatus.from('completed').value).toBe('completed');
    });
  });

  describe('predicates', () => {
    it('isPending is true only for pending', () => {
      expect(ConversionStatus.pending().isPending()).toBe(true);
      expect(ConversionStatus.processing().isPending()).toBe(false);
    });

    it('isProcessing is true only for processing', () => {
      expect(ConversionStatus.processing().isProcessing()).toBe(true);
      expect(ConversionStatus.pending().isProcessing()).toBe(false);
    });

    it('isCompleted is true only for completed', () => {
      expect(ConversionStatus.completed().isCompleted()).toBe(true);
      expect(ConversionStatus.failed().isCompleted()).toBe(false);
    });

    it('isFailed is true only for failed', () => {
      expect(ConversionStatus.failed().isFailed()).toBe(true);
      expect(ConversionStatus.completed().isFailed()).toBe(false);
    });
  });

  describe('isTerminal', () => {
    it('returns true for completed', () => {
      expect(ConversionStatus.completed().isTerminal()).toBe(true);
    });
    it('returns true for failed', () => {
      expect(ConversionStatus.failed().isTerminal()).toBe(true);
    });
    it('returns true for approved', () => {
      expect(ConversionStatus.approved().isTerminal()).toBe(true);
    });
    it('returns true for rejected', () => {
      expect(ConversionStatus.rejected().isTerminal()).toBe(true);
    });
    it('returns false for pending', () => {
      expect(ConversionStatus.pending().isTerminal()).toBe(false);
    });
    it('returns false for processing', () => {
      expect(ConversionStatus.processing().isTerminal()).toBe(false);
    });
    it('returns false for awaiting_approval (merchant must act)', () => {
      expect(ConversionStatus.awaitingApproval().isTerminal()).toBe(false);
    });
  });

  describe('approval predicates', () => {
    it('isAwaitingApproval', () => {
      expect(ConversionStatus.awaitingApproval().isAwaitingApproval()).toBe(true);
      expect(ConversionStatus.processing().isAwaitingApproval()).toBe(false);
    });
    it('isApproved', () => {
      expect(ConversionStatus.approved().isApproved()).toBe(true);
      expect(ConversionStatus.completed().isApproved()).toBe(false);
    });
    it('isRejected', () => {
      expect(ConversionStatus.rejected().isRejected()).toBe(true);
      expect(ConversionStatus.failed().isRejected()).toBe(false);
    });
  });

  describe('isViewable', () => {
    it('returns true for completed (legacy) and approved', () => {
      expect(ConversionStatus.completed().isViewable()).toBe(true);
      expect(ConversionStatus.approved().isViewable()).toBe(true);
    });
    it('returns false for awaiting_approval, rejected, processing, pending, failed', () => {
      expect(ConversionStatus.awaitingApproval().isViewable()).toBe(false);
      expect(ConversionStatus.rejected().isViewable()).toBe(false);
      expect(ConversionStatus.processing().isViewable()).toBe(false);
      expect(ConversionStatus.pending().isViewable()).toBe(false);
      expect(ConversionStatus.failed().isViewable()).toBe(false);
    });
  });

  it('toString returns the value string', () => {
    expect(ConversionStatus.processing().toString()).toBe('processing');
  });
});
