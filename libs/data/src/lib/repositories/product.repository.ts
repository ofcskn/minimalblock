import { Product, IProductRepository, ProductCategory } from '@minimalblock/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../supabase/database.types.js';

type ProductRow = Database['public']['Tables']['products']['Row'];

function rowToProduct(row: ProductRow): Product {
  return new Product({
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category as ProductCategory,
    ownerId: row.owner_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });
}

export class SupabaseProductRepository implements IProductRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async findById(id: string): Promise<Product | null> {
    const { data } = await this.client.from('products').select('*').eq('id', id).single();
    return data ? rowToProduct(data) : null;
  }

  async findByOwnerId(ownerId: string): Promise<Product[]> {
    const { data } = await this.client
      .from('products')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    return (data ?? []).map(rowToProduct);
  }

  async save(product: Product): Promise<Product> {
    const { data } = await this.client
      .from('products')
      .upsert({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        owner_id: product.ownerId,
      })
      .select()
      .single();
    return rowToProduct(data!);
  }

  async delete(id: string): Promise<void> {
    await this.client.from('products').delete().eq('id', id);
  }
}
