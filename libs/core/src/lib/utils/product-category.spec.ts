import { migrateLegacyProductCategory, isProductCategory } from './product-category.js';

describe('product category helpers', () => {
  it('migrates legacy categories into the commerce taxonomy', () => {
    expect(migrateLegacyProductCategory('house')).toBe('home-decor');
    expect(migrateLegacyProductCategory('furniture')).toBe('furniture');
    expect(migrateLegacyProductCategory('vehicle')).toBe('other');
    expect(migrateLegacyProductCategory('appliance')).toBe('electronics');
    expect(migrateLegacyProductCategory('electronics')).toBe('electronics');
    expect(migrateLegacyProductCategory('other')).toBe('other');
  });

  it('checks valid product categories', () => {
    expect(isProductCategory('bags')).toBe(true);
    expect(isProductCategory('home-decor')).toBe(true);
    expect(isProductCategory('electronics')).toBe(true);
    expect(isProductCategory('house')).toBe(false);
  });
});
