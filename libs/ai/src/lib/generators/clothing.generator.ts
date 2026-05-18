import type { SceneGraph } from '../types/scene-graph.types.js';
import type { ProductUnderstanding, GeometryIntelligence } from '../types/product-understanding.types.js';
import type { ICategoryGenerator } from './category-generator.interface.js';

export class ClothingGenerator implements ICategoryGenerator {
  readonly supportedSubtypes = [
    't-shirt', 'shirt', 'hoodie', 'sweater', 'jacket', 'coat', 'dress',
    'pants', 'jeans', 'shorts', 'skirt', 'shoe', 'sneaker', 'boot',
    'sock', 'glove', 'hat', 'cap', 'scarf', 'clothing', 'apparel',
  ];
  readonly supportedFamilies = ['cloth-fabric', 'soft-body'] as const;

  generateSceneGraph(
    _understanding: ProductUnderstanding,
    _geometryIntelligence: GeometryIntelligence,
    sceneGraph: SceneGraph,
  ): SceneGraph {
    const parts = sceneGraph.parts.map(part => {
      const p = { ...part, material: { ...part.material } };

      // Fabric always: high roughness, zero metalness
      p.material.roughness = Math.max(p.material.roughness, 0.7);
      p.material.metalness  = 0;

      // Fabric is thin — clamp depth
      const label = p.label.toLowerCase();
      if (label.includes('body') || label.includes('sleeve') || label.includes('panel')) {
        p.dimensions = { ...p.dimensions, depth: Math.min(p.dimensions.depth, 0.04) };
      }

      return p;
    });

    const warnings = [...sceneGraph.structuralWarnings];
    if (sceneGraph.geometryFamily !== 'cloth-fabric') {
      warnings.push('ClothingGenerator: geometry family corrected to cloth-fabric');
    }

    return {
      ...sceneGraph,
      geometryFamily: 'cloth-fabric',
      symmetryAxis: sceneGraph.symmetryAxis !== 'none' ? sceneGraph.symmetryAxis : 'x',
      parts,
      structuralWarnings: warnings,
    };
  }
}
