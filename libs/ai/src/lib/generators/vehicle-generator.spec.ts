import { VehicleGenerator } from './vehicle.generator.js';
import type { SceneGraph, ScenePart } from '../types/scene-graph.types.js';
import type { ProductUnderstanding, GeometryIntelligence } from '../types/product-understanding.types.js';

function makeGraph(parts: ScenePart[], overrides: Partial<SceneGraph> = {}): SceneGraph {
  return {
    schemaVersion: '2.0',
    productCategory: 'vehicle',
    productSubtype:  'car',
    geometryFamily:  'hard-surface',
    symmetryAxis:    'x',
    boundingBox:     { width: 1.8, height: 1.4, depth: 4.5 },
    parts,
    confidence:      0.85,
    sourceViewsUsed: ['front', 'left'],
    structuralWarnings: [],
    ...overrides,
  };
}

function makeUnderstanding(overrides: Partial<ProductUnderstanding> = {}): ProductUnderstanding {
  return {
    detectedCategory: 'vehicle',
    detectedSubtype:  'car',
    geometryFamily:   'hard-surface',
    structuralParts:  [],
    symmetryAxis:     'x',
    estimatedBoundingBox: { width: 1.8, height: 1.4, depth: 4.5 },
    viewAnglesDetected:   ['front'],
    confidence:       0.85,
    structuralWarnings: [],
    ...overrides,
  };
}

function makeGeomIntelligence(): GeometryIntelligence {
  return {
    geometryFamily:    'hard-surface',
    recommendedSegments: {},
    smoothShadingParts: [],
    hardEdgeParts:      [],
    criticalTopologyNotes: [],
  };
}

function makePart(id: string, label: string, overrides: Partial<ScenePart> = {}): ScenePart {
  return {
    id, label,
    shape:      'box',
    dimensions: { width: 0.3, height: 0.3, depth: 0.3 },
    position:   [0, 0.15, 0],
    rotation:   [0, 0, 0, 1],
    material:   { baseColor: [0.2, 0.2, 0.8, 1], roughness: 0.3, metalness: 0.8 },
    ...overrides,
  };
}

function makeWheelPart(id: string, position: [number, number, number]): ScenePart {
  return {
    id, label: id,
    shape:      'torus',
    dimensions: { width: 0.64, height: 0.18, depth: 0.18, tubeRadius: 0.09, majorRadius: 0.32 },
    position,
    rotation:   [0.7071, 0, 0, 0.7071],
    material:   { baseColor: [0.1, 0.1, 0.1, 1], roughness: 0.9, metalness: 0 },
    smooth:     true,
    segments:   32,
  };
}

const generator = new VehicleGenerator();
const understanding = makeUnderstanding();
const geomIntel = makeGeomIntelligence();

describe('VehicleGenerator', () => {
  // ─── supportedSubtypes ────────────────────────────────────────────────────

  it('includes common car subtypes', () => {
    expect(generator.supportedSubtypes).toContain('car');
    expect(generator.supportedSubtypes).toContain('sedan');
    expect(generator.supportedSubtypes).toContain('suv');
    expect(generator.supportedSubtypes).toContain('truck');
  });

  // ─── Window glass enforcement ─────────────────────────────────────────────

  it('adds transmissionFactor to windshield parts that are missing it', () => {
    const graph = makeGraph([
      makePart('body', 'car body'),
      makePart('windshield', 'windshield', { material: { baseColor: [0.8, 0.9, 1, 0.3], roughness: 0.05, metalness: 0 } }),
      makeWheelPart('wheel-fl', [-0.9, 0.32, 1.2]),
      makeWheelPart('wheel-rl', [-0.9, 0.32, -1.2]),
    ]);
    const result = generator.generateSceneGraph(understanding, geomIntel, graph);
    const windshield = result.parts.find(p => p.id === 'windshield');
    expect(windshield?.material.transmissionFactor).toBeCloseTo(0.85);
  });

  it('does not override transmissionFactor if already set', () => {
    const graph = makeGraph([
      makePart('body', 'car body'),
      makePart('windshield', 'windshield', { material: { baseColor: [0.8, 0.9, 1, 0.3], roughness: 0.05, metalness: 0, transmissionFactor: 0.6 } }),
      makeWheelPart('wheel-fl', [-0.9, 0.32, 1.2]),
      makeWheelPart('wheel-rl', [-0.9, 0.32, -1.2]),
    ]);
    const result = generator.generateSceneGraph(understanding, geomIntel, graph);
    const windshield = result.parts.find(p => p.id === 'windshield');
    // 0.6 was set explicitly — should be kept (nullish coalescing)
    expect(windshield?.material.transmissionFactor).toBeCloseTo(0.6);
  });

  it('lowers roughness on window parts to ≤ 0.1', () => {
    const graph = makeGraph([
      makePart('body', 'car body'),
      makePart('side window', 'side window', { material: { baseColor: [0.8, 0.9, 1, 0.3], roughness: 0.5, metalness: 0 } }),
      makeWheelPart('wheel-fl', [-0.9, 0.32, 1.2]),
      makeWheelPart('wheel-rl', [-0.9, 0.32, -1.2]),
    ]);
    const result = generator.generateSceneGraph(understanding, geomIntel, graph);
    const win = result.parts.find(p => p.label === 'side window');
    expect(win?.material.roughness).toBeLessThanOrEqual(0.1);
  });

  // ─── Wheel shape enforcement ───────────────────────────────────────────────

  it('converts box-shaped wheel parts to torus', () => {
    const graph = makeGraph([
      makePart('body', 'car body'),
      makePart('wheel-fl', 'front left wheel', { position: [-0.9, 0.32, 1.2] }),
      makePart('wheel-rl', 'rear left wheel',  { position: [-0.9, 0.32, -1.2] }),
    ]);
    const result = generator.generateSceneGraph(understanding, geomIntel, graph);
    const wheels = result.parts.filter(p => p.label.toLowerCase().includes('wheel'));
    for (const wheel of wheels) {
      expect(wheel.shape).toBe('torus');
    }
  });

  it('keeps torus wheels unchanged', () => {
    const graph = makeGraph([
      makePart('body', 'car body'),
      makeWheelPart('wheel-fl', [-0.9, 0.32, 1.2]),
      makeWheelPart('wheel-rl', [-0.9, 0.32, -1.2]),
    ]);
    const result = generator.generateSceneGraph(understanding, geomIntel, graph);
    const wheels = result.parts.filter(p => p.shape === 'torus');
    expect(wheels.length).toBeGreaterThanOrEqual(2);
  });

  // ─── Missing wheel injection ───────────────────────────────────────────────

  it('adds default wheel parts when none exist', () => {
    const graph = makeGraph([
      makePart('body', 'car body'),
    ]);
    const result = generator.generateSceneGraph(understanding, geomIntel, graph);
    const wheels = result.parts.filter(p => p.label.toLowerCase().includes('wheel'));
    expect(wheels.length).toBeGreaterThanOrEqual(2);
  });

  it('injected wheel parts use torus shape', () => {
    const graph = makeGraph([
      makePart('body', 'car body'),
    ]);
    const result = generator.generateSceneGraph(understanding, geomIntel, graph);
    const wheels = result.parts.filter(p => p.label.toLowerCase().includes('wheel'));
    for (const w of wheels) {
      expect(w.shape).toBe('torus');
    }
  });

  it('adds a warning when wheels were injected', () => {
    const graph = makeGraph([makePart('body', 'car body')]);
    const result = generator.generateSceneGraph(understanding, geomIntel, graph);
    expect(result.structuralWarnings.some(w => w.includes('VehicleGenerator'))).toBe(true);
  });

  it('does not add warnings when wheels already exist', () => {
    const graph = makeGraph([
      makePart('body', 'car body'),
      makeWheelPart('wheel-fl', [-0.9, 0.32, 1.2]),
      makeWheelPart('wheel-rl', [-0.9, 0.32, -1.2]),
    ]);
    const result = generator.generateSceneGraph(understanding, geomIntel, graph);
    expect(result.structuralWarnings.some(w => w.includes('VehicleGenerator'))).toBe(false);
  });

  // ─── Bounding box clamping ────────────────────────────────────────────────

  it('clamps bounding box height to [1.0, 2.5] for vehicles', () => {
    const graph = makeGraph(
      [
        makePart('body', 'car body'),
        makeWheelPart('wheel-fl', [-0.9, 0.32, 1.2]),
        makeWheelPart('wheel-rl', [-0.9, 0.32, -1.2]),
      ],
      { boundingBox: { width: 1.8, height: 10, depth: 4.5 } },
    );
    const result = generator.generateSceneGraph(understanding, geomIntel, graph);
    expect(result.boundingBox.height).toBeLessThanOrEqual(2.5);
    expect(result.boundingBox.height).toBeGreaterThanOrEqual(1.0);
  });

  it('clamps bounding box depth to [2.5, 6.0] for vehicles', () => {
    const graph = makeGraph(
      [
        makePart('body', 'car body'),
        makeWheelPart('wheel-fl', [-0.9, 0.32, 1.2]),
        makeWheelPart('wheel-rl', [-0.9, 0.32, -1.2]),
      ],
      { boundingBox: { width: 1.8, height: 1.4, depth: 0.5 } }, // absurdly short
    );
    const result = generator.generateSceneGraph(understanding, geomIntel, graph);
    expect(result.boundingBox.depth).toBeGreaterThanOrEqual(2.5);
  });
});
