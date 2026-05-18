import type { ValidationReport, ValidationIssue } from '../types/validation.types.js';

const GLB_MAGIC = 0x46546C67;

export class GlbValidator {
  validate(glbData: Uint8Array): ValidationReport {
    const issues: ValidationIssue[] = [];
    issues.push(...this.checkFileIntegrity(glbData));
    if (!issues.some(i => i.severity === 'error')) {
      issues.push(...this.checkMeshQuality(glbData));
    }
    const hasErrors = issues.some(i => i.severity === 'error');
    return {
      passed:        !hasErrors,
      issues,
      topologyScore: hasErrors ? 0 : 100,
      scaleScore:    100,
      uvScore:       100,
      overallScore:  hasErrors ? 0 : 100,
    };
  }

  private checkFileIntegrity(data: Uint8Array): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    if (data.byteLength < 12) {
      issues.push({ severity: 'error', code: 'GLB_TOO_SMALL', message: 'GLB data is too small to be valid' });
      return issues;
    }

    const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const magic = dv.getUint32(0, true);
    if (magic !== GLB_MAGIC) {
      issues.push({ severity: 'error', code: 'GLB_INVALID_MAGIC', message: `Invalid GLB magic: 0x${magic.toString(16)} (expected 0x${GLB_MAGIC.toString(16)})` });
    }

    const version = dv.getUint32(4, true);
    if (version !== 2) {
      issues.push({ severity: 'warning', code: 'GLB_UNEXPECTED_VERSION', message: `GLB version ${version} (expected 2)` });
    }

    const totalLength = dv.getUint32(8, true);
    if (totalLength !== data.byteLength) {
      issues.push({ severity: 'error', code: 'GLB_LENGTH_MISMATCH', message: `GLB length field ${totalLength} does not match actual byte length ${data.byteLength}` });
    }

    if (data.byteLength < 20) {
      issues.push({ severity: 'error', code: 'GLB_NO_JSON_CHUNK', message: 'GLB has no JSON chunk' });
      return issues;
    }

    // Validate JSON chunk
    const jsonChunkLength = dv.getUint32(12, true);
    const jsonChunkType   = dv.getUint32(16, true);
    if (jsonChunkType !== 0x4E4F534A) {
      issues.push({ severity: 'error', code: 'GLB_BAD_JSON_CHUNK_TYPE', message: 'First chunk is not a JSON chunk' });
    }

    try {
      const jsonBytes = data.slice(20, 20 + jsonChunkLength);
      const jsonText  = new TextDecoder().decode(jsonBytes).trimEnd();
      JSON.parse(jsonText);
    } catch {
      issues.push({ severity: 'error', code: 'GLB_INVALID_JSON', message: 'JSON chunk contains invalid JSON' });
    }

    return issues;
  }

  private checkMeshQuality(data: Uint8Array): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    try {
      const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
      const jsonChunkLength = dv.getUint32(12, true);
      const jsonBytes = data.slice(20, 20 + jsonChunkLength);
      const gltf = JSON.parse(new TextDecoder().decode(jsonBytes).trimEnd()) as {
        accessors?: Array<{ count: number }>;
        meshes?: Array<{ primitives: Array<{ indices?: number }> }>;
      };

      const accessors = gltf.accessors ?? [];
      for (const accessor of accessors) {
        if (accessor.count <= 0) {
          issues.push({ severity: 'warning', code: 'ACCESSOR_EMPTY', message: `Accessor with count=${accessor.count} found` });
        }
      }

      const meshes = gltf.meshes ?? [];
      for (const mesh of meshes) {
        for (const prim of mesh.primitives) {
          if (prim.indices == null) {
            issues.push({ severity: 'info', code: 'PRIMITIVE_NO_INDICES', message: 'Mesh primitive uses non-indexed geometry' });
          }
        }
      }
    } catch {
      // JSON parsing already validated above; structural issues are caught here
    }
    return issues;
  }
}
