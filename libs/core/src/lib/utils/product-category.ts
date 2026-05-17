import type { ProductCategory } from '../domain/entities/product.entity.js';

export const PRODUCT_CATEGORIES: readonly ProductCategory[] = [
  'furniture',
  'home-decor',
  'bags',
  'accessories',
  'electronics',
  'other',
];

export function isProductCategory(value: string): value is ProductCategory {
  return PRODUCT_CATEGORIES.includes(value as ProductCategory);
}

export function migrateLegacyProductCategory(value: string): ProductCategory {
  switch (value) {
    case 'house':
      return 'home-decor';
    case 'furniture':
      return 'furniture';
    case 'electronics':
    case 'appliance':
      return 'electronics';
    case 'vehicle':
    case 'other':
    default:
      return 'other';
  }
}
