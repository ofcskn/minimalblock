import type { SceneGraph } from '../types/scene-graph.types.js';
import type { ProductUnderstanding, GeometryIntelligence } from '../types/product-understanding.types.js';
import type { ICategoryGenerator } from './category-generator.interface.js';

export class FurnitureGenerator implements ICategoryGenerator {
  readonly supportedSubtypes = [
    'chair', 'table', 'sofa', 'desk', 'bookshelf', 'bookcase', 'shelf',
    'bed', 'cabinet', 'wardrobe', 'dresser', 'nightstand', 'stool', 'bench',
    'lamp', 'furniture',
  ];
  readonly supportedFamilies = ['hard-surface'] as const;

  generateSceneGraph(
    _understanding: ProductUnderstanding,
    _geometryIntelligence: GeometryIntelligence,
    sceneGraph: SceneGraph,
  ): SceneGraph {
    const parts = sceneGraph.parts.map(part => {
      const p = { ...part, material: { ...part.material } };
      const label = p.label.toLowerCase();

      // Wooden surfaces: enforce appropriate roughness
      if (label.includes('wood') || label.includes('top') || label.includes('seat') || label.includes('panel')) {
        p.material.roughness = Math.max(p.material.roughness, 0.5);
        p.material.metalness = 0;
      }

      // Metal legs: enforce metalness
      if (label.includes('leg') && p.material.metalness > 0.3) {
        p.material.roughness = Math.min(p.material.roughness, 0.4);
      }

      return p;
    });

    return { ...sceneGraph, parts };
  }
}
