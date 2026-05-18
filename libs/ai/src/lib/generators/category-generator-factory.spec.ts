import { CategoryGeneratorFactory } from './category-generator.factory.js';
import { VehicleGenerator }     from './vehicle.generator.js';
import { ElectronicsGenerator } from './electronics.generator.js';
import { FurnitureGenerator }   from './furniture.generator.js';
import { PackagingGenerator }   from './packaging.generator.js';
import { ClothingGenerator }    from './clothing.generator.js';
import { JewelryGenerator }     from './jewelry.generator.js';

describe('CategoryGeneratorFactory.for', () => {
  it('returns VehicleGenerator for subtype "car"', () => {
    expect(CategoryGeneratorFactory.for('car', 'hard-surface')).toBeInstanceOf(VehicleGenerator);
  });

  it('returns VehicleGenerator for subtype "sedan"', () => {
    expect(CategoryGeneratorFactory.for('sedan', 'hard-surface')).toBeInstanceOf(VehicleGenerator);
  });

  it('returns VehicleGenerator for subtype "suv"', () => {
    expect(CategoryGeneratorFactory.for('SUV', 'hard-surface')).toBeInstanceOf(VehicleGenerator);
  });

  it('returns ElectronicsGenerator for subtype "laptop"', () => {
    expect(CategoryGeneratorFactory.for('laptop', 'hard-surface')).toBeInstanceOf(ElectronicsGenerator);
  });

  it('returns ElectronicsGenerator for subtype "headphones"', () => {
    expect(CategoryGeneratorFactory.for('headphones', 'hard-surface')).toBeInstanceOf(ElectronicsGenerator);
  });

  it('returns FurnitureGenerator for subtype "chair"', () => {
    expect(CategoryGeneratorFactory.for('chair', 'hard-surface')).toBeInstanceOf(FurnitureGenerator);
  });

  it('returns FurnitureGenerator for subtype "sofa"', () => {
    expect(CategoryGeneratorFactory.for('sofa', 'hard-surface')).toBeInstanceOf(FurnitureGenerator);
  });

  it('returns PackagingGenerator for subtype "bottle"', () => {
    expect(CategoryGeneratorFactory.for('bottle', 'cylindrical')).toBeInstanceOf(PackagingGenerator);
  });

  it('returns PackagingGenerator for subtype "can"', () => {
    expect(CategoryGeneratorFactory.for('can', 'cylindrical')).toBeInstanceOf(PackagingGenerator);
  });

  it('returns ClothingGenerator for subtype "t-shirt"', () => {
    expect(CategoryGeneratorFactory.for('t-shirt', 'cloth-fabric')).toBeInstanceOf(ClothingGenerator);
  });

  it('returns ClothingGenerator for subtype "sneaker"', () => {
    expect(CategoryGeneratorFactory.for('sneaker', 'cloth-fabric')).toBeInstanceOf(ClothingGenerator);
  });

  it('returns JewelryGenerator for subtype "ring"', () => {
    expect(CategoryGeneratorFactory.for('ring', 'hard-surface')).toBeInstanceOf(JewelryGenerator);
  });

  it('returns JewelryGenerator for subtype "watch"', () => {
    expect(CategoryGeneratorFactory.for('watch', 'hard-surface')).toBeInstanceOf(JewelryGenerator);
  });

  it('returns a passthrough (no-op) for unknown subtypes', () => {
    const gen = CategoryGeneratorFactory.for('unknown-product-xyz', 'organic');
    // Passthrough returns graph unchanged
    const fakeGraph = { parts: [], productSubtype: 'test' } as any;
    const fakeUnderstanding = {} as any;
    const fakeGeomIntel = {} as any;
    const result = gen.generateSceneGraph(fakeUnderstanding, fakeGeomIntel, fakeGraph);
    expect(result).toBe(fakeGraph);
  });

  it('is case-insensitive for subtype matching', () => {
    expect(CategoryGeneratorFactory.for('CAR', 'hard-surface')).toBeInstanceOf(VehicleGenerator);
    expect(CategoryGeneratorFactory.for('LAPTOP', 'hard-surface')).toBeInstanceOf(ElectronicsGenerator);
  });
});
