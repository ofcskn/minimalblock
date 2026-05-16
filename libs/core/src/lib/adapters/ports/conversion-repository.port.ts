import { Conversion } from '../../domain/aggregates/conversion.aggregate.js';

export interface IConversionRepository {
  findById(id: string): Promise<Conversion | null>;
  findByProductId(productId: string): Promise<Conversion[]>;
  findByOwnerId(ownerId: string): Promise<Conversion[]>;
  save(conversion: Conversion): Promise<Conversion>;
  delete(id: string): Promise<void>;
}
