import type { SceneGraph, ScenePart } from '../types/scene-graph.types.js';
import type { ValidationReport, ValidationIssue } from '../types/validation.types.js';

const VEHICLE_SUBTYPES = ['car', 'sedan', 'suv', 'truck', 'van', 'pickup', 'vehicle', 'automobile'];
const WHEEL_LABELS = ['wheel', 'tire', 'tyre'];
const GLASS_LABELS = ['window', 'windshield', 'glass'];
const NON_BOX_CIRCULAR = ['wheel', 'tire', 'tyre', 'knob', 'button', 'dial', 'coin'];

function isWheelPart(part: ScenePart): boolean {
  return WHEEL_LABELS.some(w => part.label.toLowerCase().includes(w));
}

function isGlassPart(part: ScenePart): boolean {
  return GLASS_LABELS.some(g => part.label.toLowerCase().includes(g));
}

function isCircularPart(part: ScenePart): boolean {
  return NON_BOX_CIRCULAR.some(c => part.label.toLowerCase().includes(c));
}

function score(issues: ValidationIssue[], weight: number): number {
  const errors   = issues.filter(i => i.severity === 'error').length;
  const warnings = issues.filter(i => i.severity === 'warning').length;
  return Math.max(0, weight - errors * 20 - warnings * 5);
}

export class SceneGraphValidator {
  validate(graph: SceneGraph): ValidationReport {
    const topology = this.checkTopology(graph);
    const scale    = this.checkScale(graph);
    const geometry = this.checkGeometry(graph);
    const completeness = this.checkPartCompleteness(graph);

    const all = [...topology, ...scale, ...geometry, ...completeness];
    const hasErrors = all.some(i => i.severity === 'error');

    return {
      passed:        !hasErrors,
      issues:        all,
      topologyScore: score(topology, 100),
      scaleScore:    score(scale, 100),
      uvScore:       100,
      overallScore:  Math.round((score(topology, 25) + score(scale, 25) + score(geometry, 25) + score(completeness, 25))),
    };
  }

  private checkTopology(graph: SceneGraph): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const bb = graph.boundingBox;

    for (const part of graph.parts) {
      const [px, py, pz] = part.position;
      const { width: w, height: h, depth: d } = part.dimensions;

      // Parts must not exceed 2× bounding box in any axis
      if (Math.abs(px) + w / 2 > bb.width * 2) {
        issues.push({ severity: 'warning', code: 'PART_OUTSIDE_BOUNDS_X', message: `Part "${part.label}" extends far outside bounding box on X axis`, affectedPartId: part.id });
      }
      if (py + h > bb.height * 2.5) {
        issues.push({ severity: 'warning', code: 'PART_OUTSIDE_BOUNDS_Y', message: `Part "${part.label}" extends far above bounding box`, affectedPartId: part.id });
      }
      if (Math.abs(pz) + d / 2 > bb.depth * 2) {
        issues.push({ severity: 'warning', code: 'PART_OUTSIDE_BOUNDS_Z', message: `Part "${part.label}" extends far outside bounding box on Z axis`, affectedPartId: part.id });
      }
    }
    return issues;
  }

  private checkScale(graph: SceneGraph): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const bb = graph.boundingBox;
    const subtype = graph.productSubtype.toLowerCase();

    // Detect obviously wrong scales
    const MAX_SCALE: Record<string, number> = { car: 7, laptop: 0.6, phone: 0.3, bottle: 0.6, chair: 1.5 };
    const MIN_SCALE: Record<string, number> = { car: 2.0, laptop: 0.15, phone: 0.05, bottle: 0.05, chair: 0.3 };

    for (const [key, maxH] of Object.entries(MAX_SCALE)) {
      if (subtype.includes(key) && bb.height > maxH) {
        issues.push({ severity: 'error', code: 'SCALE_TOO_LARGE', message: `Bounding box height ${bb.height.toFixed(2)}m is too large for ${key} (max ${maxH}m)` });
      }
    }
    for (const [key, minH] of Object.entries(MIN_SCALE)) {
      if (subtype.includes(key) && bb.height < minH) {
        issues.push({ severity: 'error', code: 'SCALE_TOO_SMALL', message: `Bounding box height ${bb.height.toFixed(2)}m is too small for ${key} (min ${minH}m)` });
      }
    }

    // Each part's dimensions must be plausible
    for (const part of graph.parts) {
      const { width: w, height: h, depth: d } = part.dimensions;
      if (w < 0.0001 || h < 0.0001 || d < 0.0001) {
        issues.push({ severity: 'error', code: 'PART_ZERO_DIMENSION', message: `Part "${part.label}" has near-zero dimension`, affectedPartId: part.id });
      }
      if (w > 50 || h > 50 || d > 50) {
        issues.push({ severity: 'error', code: 'PART_ENORMOUS', message: `Part "${part.label}" has implausibly large dimension`, affectedPartId: part.id });
      }
    }
    return issues;
  }

  private checkGeometry(graph: SceneGraph): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (const part of graph.parts) {
      // Wheel/tire must not be a box
      if (isWheelPart(part) && part.shape === 'box') {
        issues.push({ severity: 'error', code: 'WHEEL_IS_BOX', message: `Part "${part.label}" is a wheel but uses box geometry — must use torus or cylinder`, affectedPartId: part.id });
      }

      // Circular parts should not be boxes
      if (isCircularPart(part) && part.shape === 'box') {
        issues.push({ severity: 'warning', code: 'CIRCULAR_PART_IS_BOX', message: `Part "${part.label}" appears circular but uses box geometry`, affectedPartId: part.id });
      }

      // Glass parts should have transmissionFactor
      if (isGlassPart(part) && part.material.transmissionFactor == null) {
        issues.push({ severity: 'warning', code: 'GLASS_NO_TRANSMISSION', message: `Part "${part.label}" appears to be glass but has no transmissionFactor`, affectedPartId: part.id });
      }
    }
    return issues;
  }

  private checkPartCompleteness(graph: SceneGraph): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const subtype = graph.productSubtype.toLowerCase();

    // Vehicles must have at least 2 wheel parts (mirroring creates the other 2)
    if (VEHICLE_SUBTYPES.some(v => subtype.includes(v))) {
      const wheelCount = graph.parts.filter(isWheelPart).length;
      if (wheelCount < 2) {
        issues.push({ severity: 'error', code: 'VEHICLE_MISSING_WHEELS', message: `Vehicle has only ${wheelCount} wheel part(s) — expected at least 2 (front-left and rear-left with symmetryMirror)` });
      }
    }

    // Must have at least one part
    if (graph.parts.length === 0) {
      issues.push({ severity: 'error', code: 'NO_PARTS', message: 'Scene graph has no parts' });
    }

    return issues;
  }
}

export function autoRepairSceneGraph(graph: SceneGraph, report: ValidationReport): SceneGraph {
  let parts = [...graph.parts];
  const warnings = [...graph.structuralWarnings];

  for (const issue of report.issues) {
    if (issue.severity !== 'error') continue;

    if (issue.code === 'WHEEL_IS_BOX' && issue.affectedPartId) {
      parts = parts.map(p => {
        if (p.id !== issue.affectedPartId) return p;
        const majorRadius = Math.min(p.dimensions.width, p.dimensions.height) / 2;
        const tubeRadius  = majorRadius * 0.28;
        warnings.push(`autoRepair: converted "${p.label}" from box to torus`);
        return {
          ...p,
          shape: 'torus' as const,
          dimensions: { ...p.dimensions, tubeRadius, majorRadius },
          material: { ...p.material, baseColor: [0.1, 0.1, 0.1, 1] as [number,number,number,number], roughness: 0.9, metalness: 0 },
          smooth: true,
          segments: 32,
        };
      });
    }

    if (issue.code === 'PART_ZERO_DIMENSION' && issue.affectedPartId) {
      parts = parts.map(p => {
        if (p.id !== issue.affectedPartId) return p;
        warnings.push(`autoRepair: clamped zero dimensions on "${p.label}"`);
        return {
          ...p,
          dimensions: {
            ...p.dimensions,
            width:  Math.max(p.dimensions.width,  0.01),
            height: Math.max(p.dimensions.height, 0.01),
            depth:  Math.max(p.dimensions.depth,  0.01),
          },
        };
      });
    }
  }

  return { ...graph, parts, structuralWarnings: warnings };
}
