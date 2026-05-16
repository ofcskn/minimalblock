import { Product } from '../../domain/entities/product.entity.js';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findByOwnerId(ownerId: string): Promise<Product[]>;
  save(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
}
