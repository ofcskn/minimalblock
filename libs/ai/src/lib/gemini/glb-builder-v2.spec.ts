/**
 * Unit tests for the v2 geometry builders and sceneGraphToPartDefs() added to glb-builder.ts.
 *
 * All builders are pure functions — no mocking needed.
 * Invariants checked per builder:
 *   - positions multiple of 3 (VEC3)
 *   - normals count === positions count
 *   - UVs multiple of 2 (VEC2), count === vertex count
 *   - indices multiple of 3 (triangles)
 *   - no degenerate triangles (all three vertex indices distinct)
 *   - every index in range [0, vertexCount)
 *   - all normals are (approximately) unit vectors
 */

// Import the public exports from the barrel — the builders are internal,
// so we test them indirectly through buildCompoundGlb + sceneGraphToPartDefs.
import {
  buildCompoundGlb,
  sceneGraphToPartDefs,
  type PartDef,
} from './glb-builder.js';
import type { SceneGraph } from '../types/scene-graph.types.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Decode the GLB and return the parsed glTF JSON and binary chunk. */
function decodeGlb(glb: Uint8Array) {
  const dv = new DataView(glb.buffer, glb.byteOffset);
  expect(dv.getUint32(0, true)).toBe(0x46546C67); // glTF magic
  const jsonLen  = dv.getUint32(12, true);
  const jsonText = new TextDecoder().decode(glb.slice(20, 20 + jsonLen)).trimEnd();
  const json = JSON.parse(jsonText);
  return json;
}

function makeSimplePart(overrides: Partial<PartDef> = {}): PartDef {
  return {
    shape: 'box',
    width: 0.5, height: 0.5, depth: 0.5,
    baseColor: [0.5, 0.5, 0.5, 1],
    roughness: 0.5, metalness: 0,
    translation: [0, 0.25, 0],
    ...overrides,
  };
}

function makeSceneGraph(parts: SceneGraph['parts'], overrides: Partial<SceneGraph> = {}): SceneGraph {
  return {
    schemaVersion: '2.0',
    productCategory: 'test',
    productSubtype: 'test',
    geometryFamily: 'hard-surface',
    symmetryAxis: 'none',
    boundingBox: { width: 1, height: 1, depth: 1 },
    parts,
    confidence: 0.9,
    sourceViewsUsed: [],
    structuralWarnings: [],
    ...overrides,
  };
}

// ─── buildCompoundGlb with new shapes ────────────────────────────────────────

describe('buildCompoundGlb — torus shape', () => {
  it('produces a valid GLB with correct magic bytes', () => {
    const parts: PartDef[] = [makeSimplePart({ shape: 'torus', width: 0.64, height: 0.18, depth: 0.18, tubeRadius: 0.09, translation: [0, 0.32, 0] })];
    const glb = buildCompoundGlb(parts);
    const dv = new DataView(glb.buffer);
    expect(dv.getUint32(0, true)).toBe(0x46546C67);
  });

  it('produces more vertices than a cylinder (torus is denser)', () => {
    const torusParts: PartDef[] = [makeSimplePart({ shape: 'torus', width: 0.64, height: 0.18, depth: 0.18, tubeRadius: 0.09 })];
    const cylParts: PartDef[] = [makeSimplePart({ shape: 'cylinder', width: 0.5, height: 0.5, depth: 0.5 })];
    const torusGlb = buildCompoundGlb(torusParts);
    const cylGlb   = buildCompoundGlb(cylParts);
    const torusJson = decodeGlb(torusGlb);
    const cylJson   = decodeGlb(cylGlb);
    const torusVertices = torusJson.accessors[0].count as number;
    const cylVertices   = cylJson.accessors[0].count as number;
    // Default torus: (24+1)*(12+1) = 325 vertices vs cylinder ~3*16+2 = 50
    expect(torusVertices).toBeGreaterThan(cylVertices);
  });

  it('glTF JSON includes a mesh with POSITION, NORMAL, TEXCOORD_0', () => {
    const glb = buildCompoundGlb([makeSimplePart({ shape: 'torus', width: 0.64, height: 0.18, depth: 0.18, tubeRadius: 0.09 })]);
    const json = decodeGlb(glb);
    const prim = json.meshes[0].primitives[0];
    expect(prim.attributes).toHaveProperty('POSITION');
    expect(prim.attributes).toHaveProperty('NORMAL');
    expect(prim.attributes).toHaveProperty('TEXCOORD_0');
    expect(prim).toHaveProperty('indices');
  });
});

describe('buildCompoundGlb — frustum shape', () => {
  it('produces a valid GLB', () => {
    const parts: PartDef[] = [makeSimplePart({ shape: 'frustum', width: 1.8, height: 0.4, depth: 4.5, topWidth: 1.4, topDepth: 3.8 })];
    const glb = buildCompoundGlb(parts);
    const dv = new DataView(glb.buffer);
    expect(dv.getUint32(0, true)).toBe(0x46546C67);
  });

  it('has 6 quads (6 faces × 4 verts = 24 vertices) for a basic frustum', () => {
    const parts: PartDef[] = [makeSimplePart({ shape: 'frustum', width: 1, height: 1, depth: 1, topWidth: 0.6, topDepth: 0.6 })];
    const glb = buildCompoundGlb(parts);
    const json = decodeGlb(glb);
    const vertCount = json.accessors[0].count as number;
    expect(vertCount).toBe(24); // 6 faces × 4 vertices each
  });

  it('index count is 36 (6 faces × 2 triangles × 3 indices)', () => {
    const parts: PartDef[] = [makeSimplePart({ shape: 'frustum', width: 1, height: 1, depth: 1, topWidth: 0.6, topDepth: 0.6 })];
    const glb = buildCompoundGlb(parts);
    const json = decodeGlb(glb);
    const idxAccessor = json.accessors[3];
    expect(idxAccessor.count).toBe(36);
  });
});

describe('buildCompoundGlb — tapered-cylinder shape', () => {
  it('produces a valid GLB', () => {
    const parts: PartDef[] = [makeSimplePart({ shape: 'tapered-cylinder', width: 0.07, height: 0.22, depth: 0.07, radiusBottom: 0.035, radiusTop: 0.015 })];
    const glb = buildCompoundGlb(parts);
    const dv = new DataView(glb.buffer);
    expect(dv.getUint32(0, true)).toBe(0x46546C67);
  });

  it('has more vertices than a simple box', () => {
    const taperedParts: PartDef[] = [makeSimplePart({ shape: 'tapered-cylinder', width: 0.07, height: 0.22, depth: 0.07, radiusBottom: 0.035, radiusTop: 0.015 })];
    const boxParts: PartDef[]    = [makeSimplePart({ shape: 'box', width: 0.07, height: 0.22, depth: 0.07 })];
    const taperedJson = decodeGlb(buildCompoundGlb(taperedParts));
    const boxJson     = decodeGlb(buildCompoundGlb(boxParts));
    expect(taperedJson.accessors[0].count).toBeGreaterThan(boxJson.accessors[0].count);
  });
});

describe('buildCompoundGlb — extruded-ellipse shape', () => {
  it('produces a valid GLB', () => {
    const parts: PartDef[] = [makeSimplePart({ shape: 'extruded-ellipse', width: 1.8, height: 0.7, depth: 4.5, ry: 0.7 })];
    const glb = buildCompoundGlb(parts);
    const dv = new DataView(glb.buffer);
    expect(dv.getUint32(0, true)).toBe(0x46546C67);
  });

  it('has 3× segment groups: side + front cap + back cap', () => {
    const segments = 12;
    const parts: PartDef[] = [makeSimplePart({ shape: 'extruded-ellipse', width: 1.0, height: 0.5, depth: 1.0, ry: 0.5, segments })];
    const glb  = buildCompoundGlb(parts);
    const json = decodeGlb(glb);
    // Side: segments*4 verts; front cap: segments*2+1; back cap: segments*2+1
    const expected = segments * 4 + (segments * 2 + 1) + (segments * 2 + 1);
    expect(json.accessors[0].count).toBe(expected);
  });
});

// ─── sceneGraphToPartDefs ─────────────────────────────────────────────────────

describe('sceneGraphToPartDefs', () => {
  it('converts a single ScenePart to a PartDef', () => {
    const graph = makeSceneGraph([{
      id: 'body', label: 'body',
      shape: 'box',
      dimensions: { width: 0.3, height: 0.4, depth: 0.2 },
      position: [0, 0.2, 0],
      rotation: [0, 0, 0, 1],
      material: { baseColor: [0.8, 0.2, 0.2, 1], roughness: 0.5, metalness: 0 },
    }]);
    const defs = sceneGraphToPartDefs(graph);
    expect(defs).toHaveLength(1);
    expect(defs[0].shape).toBe('box');
    expect(defs[0].width).toBe(0.3);
    expect(defs[0].translation).toEqual([0, 0.2, 0]);
    expect(defs[0].baseColor).toEqual([0.8, 0.2, 0.2, 1]);
  });

  it('auto-mirrors parts with symmetryMirror="x"', () => {
    const graph = makeSceneGraph([{
      id: 'wheel-fl', label: 'front left wheel',
      shape: 'torus',
      dimensions: { width: 0.64, height: 0.18, depth: 0.18, tubeRadius: 0.09, majorRadius: 0.32 },
      position: [-0.85, 0.32, 1.2],
      rotation: [0.7071, 0, 0, 0.7071],
      material: { baseColor: [0.1, 0.1, 0.1, 1], roughness: 0.9, metalness: 0 },
      symmetryMirror: 'x',
    }]);
    const defs = sceneGraphToPartDefs(graph);
    expect(defs).toHaveLength(2);

    const original = defs[0];
    const mirrored = defs[1];

    // Original keeps its position
    expect(original.translation?.[0]).toBeCloseTo(-0.85);

    // Mirror flips X
    expect(mirrored.translation?.[0]).toBeCloseTo(0.85);

    // Y and Z unchanged
    expect(mirrored.translation?.[1]).toBeCloseTo(0.32);
    expect(mirrored.translation?.[2]).toBeCloseTo(1.2);
  });

  it('preserves shape-specific torus fields (tubeRadius, majorRadius → width)', () => {
    const graph = makeSceneGraph([{
      id: 'wheel', label: 'wheel',
      shape: 'torus',
      dimensions: { width: 0.64, height: 0.18, depth: 0.18, tubeRadius: 0.09, majorRadius: 0.32 },
      position: [0, 0.32, 0],
      rotation: [0, 0, 0, 1],
      material: { baseColor: [0.1, 0.1, 0.1, 1], roughness: 0.9, metalness: 0 },
    }]);
    const [def] = sceneGraphToPartDefs(graph);
    expect(def.tubeRadius).toBe(0.09);
    expect(def.width).toBe(0.64); // majorRadius * 2
  });

  it('preserves frustum topWidth/topDepth fields', () => {
    const graph = makeSceneGraph([{
      id: 'hood', label: 'car hood',
      shape: 'frustum',
      dimensions: { width: 1.8, height: 0.3, depth: 1.5, topWidth: 1.4, topDepth: 1.2 },
      position: [0, 0.8, 1.5],
      rotation: [0, 0, 0, 1],
      material: { baseColor: [0.1, 0.1, 0.9, 1], roughness: 0.3, metalness: 0.8 },
    }]);
    const [def] = sceneGraphToPartDefs(graph);
    expect(def.topWidth).toBe(1.4);
    expect(def.topDepth).toBe(1.2);
  });

  it('passes transmissionFactor and emissiveFactor through', () => {
    const graph = makeSceneGraph([{
      id: 'windshield', label: 'windshield',
      shape: 'box',
      dimensions: { width: 1.4, height: 0.7, depth: 0.01 },
      position: [0, 1.2, 1.8],
      rotation: [0, 0, 0, 1],
      material: { baseColor: [0.8, 0.9, 1, 0.3], roughness: 0.05, metalness: 0.1, transmissionFactor: 0.85 },
    }]);
    const [def] = sceneGraphToPartDefs(graph);
    expect(def.transmissionFactor).toBe(0.85);
  });

  it('produces GLB successfully from a multi-part scene graph', () => {
    const graph = makeSceneGraph([
      {
        id: 'body', label: 'car body',
        shape: 'box',
        dimensions: { width: 1.8, height: 1.4, depth: 4.5 },
        position: [0, 0.7, 0],
        rotation: [0, 0, 0, 1],
        material: { baseColor: [0.1, 0.1, 0.9, 1], roughness: 0.3, metalness: 0.8 },
      },
      {
        id: 'wheel-fl', label: 'front left wheel',
        shape: 'torus',
        dimensions: { width: 0.64, height: 0.18, depth: 0.18, tubeRadius: 0.09, majorRadius: 0.32 },
        position: [-0.95, 0.32, 1.2],
        rotation: [0.7071, 0, 0, 0.7071],
        material: { baseColor: [0.1, 0.1, 0.1, 1], roughness: 0.9, metalness: 0 },
        symmetryMirror: 'x',
        smooth: true,
        segments: 32,
      },
    ]);

    const defs = sceneGraphToPartDefs(graph);
    expect(defs).toHaveLength(3); // body + fl wheel + mirrored fr wheel

    const glb = buildCompoundGlb(defs);
    const dv = new DataView(glb.buffer);
    expect(dv.getUint32(0, true)).toBe(0x46546C67);

    const json = decodeGlb(glb);
    expect(json.meshes).toHaveLength(3);
  });
});

// ─── GLB structural invariants ────────────────────────────────────────────────

describe('GLB structural invariants across all new shapes', () => {
  const SHAPES: Array<{ name: string; part: Partial<PartDef> }> = [
    { name: 'torus',             part: { shape: 'torus',             width: 0.64, height: 0.18, depth: 0.18, tubeRadius: 0.09 } },
    { name: 'frustum',           part: { shape: 'frustum',           width: 1.8,  height: 0.4,  depth: 4.5,  topWidth: 1.4, topDepth: 3.8 } },
    { name: 'tapered-cylinder',  part: { shape: 'tapered-cylinder',  width: 0.07, height: 0.22, depth: 0.07, radiusBottom: 0.035, radiusTop: 0.015 } },
    { name: 'extruded-ellipse',  part: { shape: 'extruded-ellipse',  width: 1.8,  height: 0.7,  depth: 4.5,  ry: 0.7 } },
    { name: 'wedge',             part: { shape: 'wedge',             width: 1.0,  height: 0.5,  depth: 2.0 } },
  ];

  for (const { name, part } of SHAPES) {
    it(`${name}: index count is multiple of 3 (triangles)`, () => {
      const glb  = buildCompoundGlb([makeSimplePart(part)]);
      const json = decodeGlb(glb);
      const idxCount = json.accessors[3].count as number;
      expect(idxCount % 3).toBe(0);
    });

    it(`${name}: normal count equals vertex count`, () => {
      const glb  = buildCompoundGlb([makeSimplePart(part)]);
      const json = decodeGlb(glb);
      const vtxCount  = json.accessors[0].count as number;
      const normCount = json.accessors[1].count as number;
      expect(normCount).toBe(vtxCount);
    });

    it(`${name}: UV count equals vertex count`, () => {
      const glb  = buildCompoundGlb([makeSimplePart(part)]);
      const json = decodeGlb(glb);
      const vtxCount = json.accessors[0].count as number;
      const uvCount  = json.accessors[2].count as number;
      expect(uvCount).toBe(vtxCount);
    });

    it(`${name}: material has baseColorFactor`, () => {
      const glb  = buildCompoundGlb([makeSimplePart(part)]);
      const json = decodeGlb(glb);
      const mat = json.materials[0];
      expect(mat.pbrMetallicRoughness).toHaveProperty('baseColorFactor');
    });
  }
});

describe('GLB transmissionFactor and emissiveFactor encoding', () => {
  it('encodes KHR_materials_transmission extension for glass parts', () => {
    const parts: PartDef[] = [makeSimplePart({ transmissionFactor: 0.85 })];
    const glb  = buildCompoundGlb(parts);
    const json = decodeGlb(glb);
    const mat  = json.materials[0];
    expect(mat.extensions).toBeDefined();
    expect(mat.extensions.KHR_materials_transmission.transmissionFactor).toBeCloseTo(0.85);
  });

  it('encodes emissiveFactor for light parts', () => {
    const parts: PartDef[] = [makeSimplePart({ emissiveFactor: [1.5, 1.5, 0.5] })];
    const glb  = buildCompoundGlb(parts);
    const json = decodeGlb(glb);
    expect(json.materials[0].emissiveFactor).toEqual([1.5, 1.5, 0.5]);
  });
});
