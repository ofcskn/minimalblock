import type { SceneGraph, ScenePart } from '../types/scene-graph.types.js';
import type { ProductUnderstanding, GeometryIntelligence } from '../types/product-understanding.types.js';
import type { ICategoryGenerator } from './category-generator.interface.js';

const WHEEL_LABELS = ['wheel', 'tire', 'tyre'];
const WINDOW_LABELS = ['window', 'windshield', 'glass', 'rear window', 'side window'];

function isWheel(part: ScenePart): boolean {
  return WHEEL_LABELS.some(w => part.label.toLowerCase().includes(w));
}

function isWindow(part: ScenePart): boolean {
  return WINDOW_LABELS.some(w => part.label.toLowerCase().includes(w));
}

function makeWheel(id: string, label: string, x: number, y: number, z: number): ScenePart {
  const majorRadius = 0.32;
  const tubeRadius  = 0.09;
  return {
    id,
    label,
    shape: 'torus',
    dimensions: { width: majorRadius * 2, height: tubeRadius * 2, depth: tubeRadius * 2, tubeRadius, majorRadius },
    position: [x, y, z],
    rotation: [0.7071068, 0, 0, 0.7071068],
    material: { baseColor: [0.1, 0.1, 0.1, 1], roughness: 0.9, metalness: 0 },
    smooth: true,
    segments: 32,
    symmetryMirror: x < 0 ? 'x' : undefined,
  };
}

export class VehicleGenerator implements ICategoryGenerator {
  readonly supportedSubtypes = ['car', 'sedan', 'suv', 'truck', 'van', 'pickup', 'coupe', 'hatchback', 'convertible', 'vehicle', 'automobile'];
  readonly supportedFamilies = ['hard-surface', 'mechanical'] as const;

  generateSceneGraph(
    understanding: ProductUnderstanding,
    _geometryIntelligence: GeometryIntelligence,
    sceneGraph: SceneGraph,
  ): SceneGraph {
    const parts = [...sceneGraph.parts];

    // 1. Fix windows: must have transmissionFactor
    for (const part of parts) {
      if (isWindow(part)) {
        part.material.transmissionFactor ??= 0.85;
        part.material.roughness = Math.min(part.material.roughness, 0.1);
        if (!part.material.baseColor || part.material.baseColor[3] > 0.5) {
          part.material.baseColor = [0.8, 0.9, 1.0, 0.3];
        }
      }
    }

    // 2. Fix wheels: replace box/cylinder wheels with tori
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (isWheel(part) && part.shape !== 'torus') {
        const [px, py, pz] = part.position;
        parts[i] = makeWheel(part.id, part.label, px, py, pz);
      }
    }

    // 3. Ensure at least 4 wheel parts exist
    const wheelParts = parts.filter(isWheel);
    const hasEnoughWheels = wheelParts.length >= 2; // at least 2 (front+rear) since mirroring doubles them

    if (!hasEnoughWheels) {
      const bb = sceneGraph.boundingBox;
      const majorRadius = Math.min(bb.height * 0.22, 0.35);
      const wheelY  = majorRadius;
      const wheelX  = -(bb.width / 2 + 0.05);
      const wheelZF = bb.depth / 2 * 0.55;
      const wheelZR = -bb.depth / 2 * 0.55;

      // Add front-left and rear-left (mirrored to produce right counterparts)
      parts.push(makeWheel('wheel-front-left', 'front left wheel', wheelX, wheelY, wheelZF));
      parts.push(makeWheel('wheel-rear-left',  'rear left wheel',  wheelX, wheelY, wheelZR));
    }

    // 4. Enforce bounding box sanity for vehicles
    const bb = sceneGraph.boundingBox;
    const clampedBb = {
      width:  Math.min(Math.max(bb.width,  1.4), 3.0),
      height: Math.min(Math.max(bb.height, 1.0), 2.5),
      depth:  Math.min(Math.max(bb.depth,  2.5), 6.0),
    };

    const warnings = [...sceneGraph.structuralWarnings];
    if (!hasEnoughWheels) warnings.push('VehicleGenerator: Wheels were missing — added default wheel positions');

    return { ...sceneGraph, parts, boundingBox: clampedBb, structuralWarnings: warnings };
  }
}
