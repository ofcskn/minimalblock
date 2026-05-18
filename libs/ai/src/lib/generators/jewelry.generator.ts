import type { SceneGraph } from '../types/scene-graph.types.js';
import type { ProductUnderstanding, GeometryIntelligence } from '../types/product-understanding.types.js';
import type { ICategoryGenerator } from './category-generator.interface.js';

export class JewelryGenerator implements ICategoryGenerator {
  readonly supportedSubtypes = [
    'ring', 'bracelet', 'necklace', 'earring', 'pendant', 'brooch',
    'watch', 'chain', 'bangle', 'jewelry', 'jewellery',
  ];
  readonly supportedFamilies = ['hard-surface', 'mechanical'] as const;

  generateSceneGraph(
    _understanding: ProductUnderstanding,
    _geometryIntelligence: GeometryIntelligence,
    sceneGraph: SceneGraph,
  ): SceneGraph {
    const bb = sceneGraph.boundingBox;

    // Clamp scale to plausible jewelry dimensions (0.5 cm – 25 cm per axis)
    const clampedBb = {
      width:  Math.min(Math.max(bb.width,  0.005), 0.25),
      height: Math.min(Math.max(bb.height, 0.005), 0.25),
      depth:  Math.min(Math.max(bb.depth,  0.001), 0.15),
    };

    const scaleFactor = bb.width > 0 ? clampedBb.width / bb.width : 1;

    const parts = sceneGraph.parts.map(part => {
      const p = { ...part, material: { ...part.material } };

      // Jewelry: high metalness, smooth surfaces
      p.material.metalness = Math.max(p.material.metalness, 0.7);
      p.material.roughness = Math.min(p.material.roughness, 0.3);
      p.smooth = true;

      // Scale all positions and dimensions proportionally
      if (scaleFactor !== 1) {
        p.position = [p.position[0] * scaleFactor, p.position[1] * scaleFactor, p.position[2] * scaleFactor];
        p.dimensions = {
          ...p.dimensions,
          width:  p.dimensions.width  * scaleFactor,
          height: p.dimensions.height * scaleFactor,
          depth:  p.dimensions.depth  * scaleFactor,
        };
      }

      return p;
    });

    const warnings = [...sceneGraph.structuralWarnings];
    if (scaleFactor !== 1) warnings.push(`JewelryGenerator: scale clamped (factor: ${scaleFactor.toFixed(3)})`);

    return { ...sceneGraph, boundingBox: clampedBb, parts, structuralWarnings: warnings };
  }
}
