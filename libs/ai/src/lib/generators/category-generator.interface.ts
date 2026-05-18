import type { SceneGraph } from '../types/scene-graph.types.js';
import type { GeometryFamily } from '../types/scene-graph.types.js';
import type { ProductUnderstanding, GeometryIntelligence } from '../types/product-understanding.types.js';

export interface ICategoryGenerator {
  readonly supportedSubtypes: readonly string[];
  readonly supportedFamilies: readonly GeometryFamily[];

  /** Post-process the raw Gemini scene graph to enforce category-specific constraints. */
  generateSceneGraph(
    understanding: ProductUnderstanding,
    geometryIntelligence: GeometryIntelligence,
    sceneGraph: SceneGraph,
  ): SceneGraph;
}
