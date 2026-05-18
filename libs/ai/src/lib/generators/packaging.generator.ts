import type { SceneGraph, ScenePart } from '../types/scene-graph.types.js';
import type { ProductUnderstanding, GeometryIntelligence } from '../types/product-understanding.types.js';
import type { ICategoryGenerator } from './category-generator.interface.js';

function isBottleBody(part: ScenePart): boolean {
  const l = part.label.toLowerCase();
  return (l.includes('body') || l.includes('bottle') || l.includes('container')) && !l.includes('cap');
}

export class PackagingGenerator implements ICategoryGenerator {
  readonly supportedSubtypes = [
    'bottle', 'can', 'jar', 'box', 'carton', 'tube', 'container',
    'flask', 'vase', 'cup', 'mug', 'packaging',
  ];
  readonly supportedFamilies = ['cylindrical', 'hard-surface'] as const;

  generateSceneGraph(
    _understanding: ProductUnderstanding,
    _geometryIntelligence: GeometryIntelligence,
    sceneGraph: SceneGraph,
  ): SceneGraph {
    const parts = sceneGraph.parts.map(part => {
      const p = { ...part, material: { ...part.material } };
      const label = p.label.toLowerCase();

      // Bottle/can body: enforce cylindrical shape
      if (isBottleBody(p) && p.shape === 'box') {
        p.shape = 'cylinder';
      }

      // Glass containers: add transmission
      if ((label.includes('glass') || label.includes('transparent')) && p.material.transmissionFactor == null) {
        p.material.transmissionFactor = 0.7;
        p.material.roughness = Math.min(p.material.roughness, 0.1);
      }

      // Ensure minimum segments for circular shapes
      if (p.shape === 'cylinder' && (!p.segments || p.segments < 16)) {
        p.segments = 24;
      }

      return p;
    });

    return { ...sceneGraph, parts };
  }
}
