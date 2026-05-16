const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_MODEL_MIME_TYPES = new Set(['model/gltf-binary', 'application/octet-stream']);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_MODEL_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export interface FileValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateImageFile(file: File): FileValidationResult {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, reason: `Unsupported format: ${file.type}. Use JPEG, PNG, or WebP.` };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, reason: `File too large. Max size is 10 MB.` };
  }
  return { valid: true };
}

export function validateModelFile(file: File): FileValidationResult {
  const hasSupportedMime = ALLOWED_MODEL_MIME_TYPES.has(file.type);
  const hasGlbExtension = file.name.toLowerCase().endsWith('.glb');
  if (!hasSupportedMime && !hasGlbExtension) {
    return { valid: false, reason: `Unsupported format: ${file.type || 'unknown'}. Use a GLB file.` };
  }
  if (file.size > MAX_MODEL_SIZE_BYTES) {
    return { valid: false, reason: 'Model file too large. Max size is 25 MB.' };
  }
  return { valid: true };
}
