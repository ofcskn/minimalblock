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
    it('returns false for pending', () => {
      expect(ConversionStatus.pending().isTerminal()).toBe(false);
    });
    it('returns false for processing', () => {
      expect(ConversionStatus.processing().isTerminal()).toBe(false);
    });
  });

  it('toString returns the value string', () => {
    expect(ConversionStatus.processing().toString()).toBe('processing');
  });
});
