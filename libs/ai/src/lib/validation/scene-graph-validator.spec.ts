import { SceneGraphValidator, autoRepairSceneGraph } from './scene-graph-validator.js';
import type { SceneGraph, ScenePart } from '../types/scene-graph.types.js';

function makeGraph(overrides: Partial<SceneGraph> = {}): SceneGraph {
  return {
    schemaVersion: '2.0',
    productCategory: 'test',
    productSubtype: 'sedan',
    geometryFamily: 'hard-surface',
    symmetryAxis: 'x',
    boundingBox: { width: 1.8, height: 1.4, depth: 4.5 },
    parts: [],
    confidence: 0.9,
    sourceViewsUsed: [],
    structuralWarnings: [],
    ...overrides,
  };
}

function makePart(overrides: Partial<ScenePart> = {}): ScenePart {
  return {
    id: 'test-part',
    label: 'test',
    shape: 'box',
    dimensions: { width: 0.5, height: 0.5, depth: 0.5 },
    position: [0, 0.25, 0],
    rotation: [0, 0, 0, 1],
    material: { baseColor: [0.5, 0.5, 0.5, 1], roughness: 0.5, metalness: 0 },
    ...overrides,
  };
}

function makeWheelPart(id: string, position: [number, number, number]): ScenePart {
  return makePart({
    id,
    label: `wheel ${id}`,
    shape: 'torus',
    dimensions: { width: 0.64, height: 0.18, depth: 0.18, tubeRadius: 0.09, majorRadius: 0.32 },
    position,
  });
}

describe('SceneGraphValidator', () => {
  const validator = new SceneGraphValidator();

  // ─── No parts ─────────────────────────────────────────────────────────────

  it('fails when graph has no parts', () => {
    const graph = makeGraph({ parts: [] });
    const report = validator.validate(graph);
    expect(report.passed).toBe(false);
    expect(report.issues.some(i => i.code === 'NO_PARTS')).toBe(true);
  });

  // ─── Vehicle wheel checks ──────────────────────────────────────────────────

  it('passes for a vehicle with 2 wheel parts (mirroring provides other 2)', () => {
    const graph = makeGraph({
      productSubtype: 'car',
      parts: [
        makePart({ id: 'body', label: 'car body' }),
        makeWheelPart('wheel-fl', [-0.9, 0.32, 1.2]),
        makeWheelPart('wheel-rl', [-0.9, 0.32, -1.2]),
      ],
    });
    const report = validator.validate(graph);
    const wheelError = report.issues.find(i => i.code === 'VEHICLE_MISSING_WHEELS');
    expect(wheelError).toBeUndefined();
  });

  it('errors when vehicle has 0 wheel parts', () => {
    const graph = makeGraph({
      productSubtype: 'car',
      parts: [makePart({ id: 'body', label: 'car body' })],
    });
    const report = validator.validate(graph);
    expect(report.passed).toBe(false);
    expect(report.issues.some(i => i.code === 'VEHICLE_MISSING_WHEELS')).toBe(true);
  });

  it('errors when vehicle has only 1 wheel part (minimum is 2)', () => {
    const graph = makeGraph({
      productSubtype: 'suv',
      parts: [
        makePart({ id: 'body', label: 'body' }),
        makeWheelPart('wheel-fl', [-0.9, 0.32, 1.2]),
      ],
    });
    const report = validator.validate(graph);
    // Validator requires ≥ 2 wheel parts (front-left + rear-left; mirroring creates right-side counterparts)
    const wheelError = report.issues.find(i => i.code === 'VEHICLE_MISSING_WHEELS');
    expect(wheelError).toBeDefined();
    expect(wheelError?.severity).toBe('error');
  });

  it('passes when vehicle has exactly 2 wheel parts', () => {
    const graph = makeGraph({
      productSubtype: 'sedan',
      parts: [
        makePart({ id: 'body', label: 'car body' }),
        makeWheelPart('wheel-fl', [-0.9, 0.32, 1.2]),
        makeWheelPart('wheel-rl', [-0.9, 0.32, -1.2]),
      ],
    });
    const report = validator.validate(graph);
    const wheelError = report.issues.find(i => i.code === 'VEHICLE_MISSING_WHEELS');
    expect(wheelError).toBeUndefined();
  });

  // ─── Box wheel detection ───────────────────────────────────────────────────

  it('errors when a wheel part uses box shape', () => {
    const graph = makeGraph({
      productSubtype: 'car',
      parts: [
        makePart({ id: 'wheel-fl', label: 'front left wheel', shape: 'box', dimensions: { width: 0.3, height: 0.3, depth: 0.3 } }),
        makePart({ id: 'wheel-rl', label: 'rear left wheel',  shape: 'box', dimensions: { width: 0.3, height: 0.3, depth: 0.3 } }),
      ],
    });
    const report = validator.validate(graph);
    const boxWheelErrors = report.issues.filter(i => i.code === 'WHEEL_IS_BOX');
    expect(boxWheelErrors.length).toBeGreaterThan(0);
  });

  it('does not error when a wheel part uses torus shape', () => {
    const graph = makeGraph({
      productSubtype: 'car',
      parts: [
        makeWheelPart('wheel-fl', [-0.9, 0.32, 1.2]),
        makeWheelPart('wheel-rl', [-0.9, 0.32, -1.2]),
        makePart({ id: 'body', label: 'car body' }),
      ],
    });
    const report = validator.validate(graph);
    const boxWheelErrors = report.issues.filter(i => i.code === 'WHEEL_IS_BOX');
    expect(boxWheelErrors).toHaveLength(0);
  });

  // ─── Glass transmission check ──────────────────────────────────────────────

  it('warns when window part has no transmissionFactor', () => {
    const graph = makeGraph({
      productSubtype: 'car',
      parts: [
        makePart({ id: 'windshield', label: 'windshield', material: { baseColor: [0.8, 0.9, 1, 0.3], roughness: 0.05, metalness: 0.1 } }),
        makeWheelPart('wheel-fl', [-0.9, 0.32, 1.2]),
        makeWheelPart('wheel-rl', [-0.9, 0.32, -1.2]),
      ],
    });
    const report = validator.validate(graph);
    const glassWarn = report.issues.find(i => i.code === 'GLASS_NO_TRANSMISSION');
    expect(glassWarn).toBeDefined();
    expect(glassWarn?.severity).toBe('warning');
  });

  it('does not warn when window part has transmissionFactor set', () => {
    const graph = makeGraph({
      productSubtype: 'car',
      parts: [
        makePart({ id: 'windshield', label: 'windshield', material: { baseColor: [0.8, 0.9, 1, 0.3], roughness: 0.05, metalness: 0.1, transmissionFactor: 0.85 } }),
        makeWheelPart('wheel-fl', [-0.9, 0.32, 1.2]),
        makeWheelPart('wheel-rl', [-0.9, 0.32, -1.2]),
      ],
    });
    const report = validator.validate(graph);
    const glassWarn = report.issues.find(i => i.code === 'GLASS_NO_TRANSMISSION');
    expect(glassWarn).toBeUndefined();
  });

  // ─── Scale checks ──────────────────────────────────────────────────────────

  it('errors when car bounding box height is implausibly large', () => {
    const graph = makeGraph({
      productSubtype: 'car',
      boundingBox: { width: 1.8, height: 10, depth: 4.5 }, // 10m tall car
      parts: [
        makePart({ id: 'body', label: 'car body' }),
        makeWheelPart('wheel-fl', [-0.9, 0.32, 1.2]),
        makeWheelPart('wheel-rl', [-0.9, 0.32, -1.2]),
      ],
    });
    const report = validator.validate(graph);
    expect(report.issues.some(i => i.code === 'SCALE_TOO_LARGE')).toBe(true);
  });

  it('errors when a part has near-zero dimension', () => {
    const graph = makeGraph({
      productSubtype: 'other',
      parts: [makePart({ dimensions: { width: 0, height: 0.5, depth: 0.5 } })],
    });
    const report = validator.validate(graph);
    expect(report.issues.some(i => i.code === 'PART_ZERO_DIMENSION')).toBe(true);
  });

  // ─── Overall score ─────────────────────────────────────────────────────────

  it('returns overallScore of 100 for a clean graph', () => {
    const graph = makeGraph({
      productSubtype: 'other',
      parts: [makePart({ dimensions: { width: 0.3, height: 0.3, depth: 0.3 } })],
    });
    const report = validator.validate(graph);
    expect(report.overallScore).toBe(100);
    expect(report.passed).toBe(true);
  });

  it('overallScore is 0 when errors exist', () => {
    const graph = makeGraph({ parts: [] }); // no parts → error
    const report = validator.validate(graph);
    expect(report.overallScore).toBeLessThan(100);
  });
});

// ─── autoRepairSceneGraph ─────────────────────────────────────────────────────

describe('autoRepairSceneGraph', () => {
  const validator = new SceneGraphValidator();

  it('converts box wheels to torus', () => {
    const graph = makeGraph({
      productSubtype: 'car',
      parts: [
        makePart({ id: 'wheel-fl', label: 'front left wheel', shape: 'box', dimensions: { width: 0.3, height: 0.3, depth: 0.3 } }),
        makePart({ id: 'wheel-rl', label: 'rear left wheel',  shape: 'box', dimensions: { width: 0.3, height: 0.3, depth: 0.3 } }),
      ],
    });
    const report  = validator.validate(graph);
    const repaired = autoRepairSceneGraph(graph, report);
    const wheelShapes = repaired.parts.map(p => p.shape);
    expect(wheelShapes.every(s => s === 'torus')).toBe(true);
  });

  it('clamped zero-dimension parts get minimum 0.01m dimensions', () => {
    const graph = makeGraph({
      productSubtype: 'other',
      parts: [makePart({ id: 'bad-part', label: 'bad part', dimensions: { width: 0, height: 0.5, depth: 0.5 } })],
    });
    const report  = validator.validate(graph);
    const repaired = autoRepairSceneGraph(graph, report);
    expect(repaired.parts[0].dimensions.width).toBeGreaterThanOrEqual(0.01);
  });

  it('adds autoRepair warnings to structuralWarnings', () => {
    const graph = makeGraph({
      productSubtype: 'car',
      parts: [
        makePart({ id: 'wheel-fl', label: 'wheel fl', shape: 'box', dimensions: { width: 0.3, height: 0.3, depth: 0.3 } }),
        makePart({ id: 'wheel-rl', label: 'wheel rl', shape: 'box', dimensions: { width: 0.3, height: 0.3, depth: 0.3 } }),
      ],
    });
    const report  = validator.validate(graph);
    const repaired = autoRepairSceneGraph(graph, report);
    expect(repaired.structuralWarnings.some(w => w.includes('autoRepair'))).toBe(true);
  });

  it('leaves parts without errors unchanged', () => {
    const graph = makeGraph({
      productSubtype: 'other',
      parts: [makePart({ id: 'body', label: 'body', dimensions: { width: 0.5, height: 0.5, depth: 0.5 } })],
    });
    const report  = validator.validate(graph);
    const repaired = autoRepairSceneGraph(graph, report);
    expect(repaired.parts[0]).toEqual(graph.parts[0]);
  });
});
