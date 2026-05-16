import { validateImageFile } from './file-validator.js';

function makeFile(name: string, type: string, sizeBytes: number): File {
  const blob = new Blob(['x'.repeat(sizeBytes)], { type });
  return new File([blob], name, { type });
}

describe('validateImageFile', () => {
  describe('valid files', () => {
    it('accepts image/jpeg', () => {
      expect(validateImageFile(makeFile('photo.jpg', 'image/jpeg', 1024))).toEqual({ valid: true });
    });
    it('accepts image/png', () => {
      expect(validateImageFile(makeFile('photo.png', 'image/png', 512))).toEqual({ valid: true });
    });
    it('accepts image/webp', () => {
      expect(validateImageFile(makeFile('photo.webp', 'image/webp', 2048))).toEqual({ valid: true });
    });
    it('accepts a file exactly at the 10 MB limit', () => {
      expect(validateImageFile(makeFile('big.jpg', 'image/jpeg', 10 * 1024 * 1024))).toEqual({ valid: true });
    });
  });

  describe('invalid MIME type', () => {
    it('rejects image/gif', () => {
      const result = validateImageFile(makeFile('anim.gif', 'image/gif', 100));
      expect(result.valid).toBe(false);
      expect(result.reason).toMatch(/Unsupported format/);
    });
    it('rejects application/pdf', () => {
      const result = validateImageFile(makeFile('doc.pdf', 'application/pdf', 100));
      expect(result.valid).toBe(false);
    });
    it('rejects empty type string', () => {
      const result = validateImageFile(makeFile('unknown', '', 100));
      expect(result.valid).toBe(false);
    });
  });

  describe('file size', () => {
    it('rejects files over 10 MB', () => {
      const result = validateImageFile(makeFile('huge.jpg', 'image/jpeg', 10 * 1024 * 1024 + 1));
      expect(result.valid).toBe(false);
      expect(result.reason).toMatch(/too large/i);
    });
  });
});
