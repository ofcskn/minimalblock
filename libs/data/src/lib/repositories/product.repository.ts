import {
  Product,
  IProductRepository,
  Hotspot,
  ProductAiAnalysis,
  ProductImportData,
  SuggestedHotspot,
  migrateLegacyProductCategory,
} from '@minimalblock/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../supabase/database.types.js';

type ProductRow = Database['public']['Tables']['products']['Row'];

function rowToProduct(row: ProductRow): Product {
  return new Product({
    id: row.id,
    name: row.name,
    description: row.description,
    category: migrateLegacyProductCategory(row.category),
    ownerId: row.owner_id,
    slug: row.slug,
    hotspots: Array.isArray(row.hotspots) ? (row.hotspots as unknown as Hotspot[]) : [],
    hotspotsSuggested: Array.isArray(row.hotspots_suggested)
      ? (row.hotspots_suggested as unknown as SuggestedHotspot[])
      : [],
    aiAnalysis: row.ai_insights && !Array.isArray(row.ai_insights)
      ? (row.ai_insights as unknown as ProductAiAnalysis)
      : null,
    workflowStatus: row.workflow_status as Product['workflowStatus'],
    inputMethod: row.input_method as Product['inputMethod'],
    importData: row.import_data && !Array.isArray(row.import_data)
      ? (row.import_data as unknown as ProductImportData)
      : null,
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

  async findBySlugOrId(slugOrId: string): Promise<Product | null> {
    const { data: bySlug } = await this.client.from('products').select('*').eq('slug', slugOrId).maybeSingle();
    if (bySlug) return rowToProduct(bySlug);
    const { data: byId } = await this.client.from('products').select('*').eq('id', slugOrId).maybeSingle();
    return byId ? rowToProduct(byId) : null;
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
        slug: product.slug,
        hotspots: product.hotspots as unknown as import('../supabase/database.types.js').Json,
        hotspots_suggested: product.hotspotsSuggested as unknown as import('../supabase/database.types.js').Json,
        hotspots_suggested_at: product.hotspotsSuggested.length > 0 ? new Date().toISOString() : null,
        ai_insights: product.aiAnalysis
          ? product.aiAnalysis as unknown as import('../supabase/database.types.js').Json
          : null,
        workflow_status: product.workflowStatus,
        input_method: product.inputMethod,
        import_data: product.importData
          ? product.importData as unknown as import('../supabase/database.types.js').Json
          : null,
      })
      .select()
      .single();
    return rowToProduct(data!);
  }

  async delete(id: string): Promise<void> {
    await this.client.from('products').delete().eq('id', id);
  }
}
