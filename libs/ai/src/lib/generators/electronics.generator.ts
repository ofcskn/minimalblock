import type { SceneGraph, ScenePart } from '../types/scene-graph.types.js';
import type { ProductUnderstanding, GeometryIntelligence } from '../types/product-understanding.types.js';
import type { ICategoryGenerator } from './category-generator.interface.js';

const SCREEN_LABELS = ['screen', 'display', 'panel', 'monitor'];
const LED_LABELS    = ['led', 'indicator', 'light', 'status light'];

function isScreen(part: ScenePart): boolean {
  return SCREEN_LABELS.some(s => part.label.toLowerCase().includes(s));
}

function isLed(part: ScenePart): boolean {
  return LED_LABELS.some(l => part.label.toLowerCase().includes(l));
}

export class ElectronicsGenerator implements ICategoryGenerator {
  readonly supportedSubtypes = [
    'laptop', 'phone', 'smartphone', 'tablet', 'monitor', 'tv', 'speaker',
    'headphones', 'earbuds', 'keyboard', 'mouse', 'router', 'camera',
    'smartwatch', 'console', 'remote', 'electronics',
  ];
  readonly supportedFamilies = ['hard-surface', 'mechanical'] as const;

  generateSceneGraph(
    _understanding: ProductUnderstanding,
    _geometryIntelligence: GeometryIntelligence,
    sceneGraph: SceneGraph,
  ): SceneGraph {
    const parts = sceneGraph.parts.map(part => {
      const p = { ...part, material: { ...part.material } };

      // Screen panels must have low roughness and slight metalness
      if (isScreen(p)) {
        p.material.roughness = Math.min(p.material.roughness, 0.15);
        p.material.metalness = Math.max(p.material.metalness, 0.1);
      }

      // LED indicators get emissive
      if (isLed(p) && !p.material.emissiveFactor) {
        const bc = p.material.baseColor;
        p.material.emissiveFactor = [bc[0] * 2, bc[1] * 2, bc[2] * 2];
      }

      return p;
    });

    return { ...sceneGraph, parts };
  }
}
