import type { ICategoryGenerator } from './category-generator.interface.js';
import type { GeometryFamily } from '../types/scene-graph.types.js';
import type { SceneGraph } from '../types/scene-graph.types.js';
import type { ProductUnderstanding, GeometryIntelligence } from '../types/product-understanding.types.js';
import { VehicleGenerator }     from './vehicle.generator.js';
import { ElectronicsGenerator } from './electronics.generator.js';
import { FurnitureGenerator }   from './furniture.generator.js';
import { PackagingGenerator }   from './packaging.generator.js';
import { ClothingGenerator }    from './clothing.generator.js';
import { JewelryGenerator }     from './jewelry.generator.js';

class PassthroughGenerator implements ICategoryGenerator {
  readonly supportedSubtypes: string[] = [];
  readonly supportedFamilies: GeometryFamily[] = [];

  generateSceneGraph(
    _understanding: ProductUnderstanding,
    _geometryIntelligence: GeometryIntelligence,
    sceneGraph: SceneGraph,
  ): SceneGraph {
    return sceneGraph;
  }
}

const GENERATORS: ICategoryGenerator[] = [
  new VehicleGenerator(),
  new ElectronicsGenerator(),
  new FurnitureGenerator(),
  new PackagingGenerator(),
  new ClothingGenerator(),
  new JewelryGenerator(),
];

const PASSTHROUGH = new PassthroughGenerator();

export class CategoryGeneratorFactory {
  static for(subtype: string, geometryFamily: GeometryFamily): ICategoryGenerator {
    const lower = subtype.toLowerCase();

    // Match by subtype first: check if the input subtype contains a known keyword
    for (const gen of GENERATORS) {
      if (gen.supportedSubtypes.some(s => lower.includes(s))) {
        return gen;
      }
    }

    // Fallback: match by geometry family
    for (const gen of GENERATORS) {
      if ((gen.supportedFamilies as readonly string[]).includes(geometryFamily)) {
        return gen;
      }
    }

    return PASSTHROUGH;
  }
}
