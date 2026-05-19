import type { IBrandRepository, BrandData, BrandLogoData, BrandColorData } from '@minimalblock/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../supabase/database.types.js';

type BrandRow = Database['public']['Tables']['brands']['Row'];
type LogoRow = Database['public']['Tables']['brand_logos']['Row'];
type ColorRow = Database['public']['Tables']['brand_colors']['Row'];

function rowToLogo(row: LogoRow): BrandLogoData {
  return {
    id: row.id,
    brandId: row.brand_id,
    ownerId: row.owner_id,
    storageKey: row.storage_key,
    publicUrl: row.public_url,
    name: row.name,
    ordinal: row.ordinal,
    createdAt: new Date(row.created_at),
  };
}

function rowToColor(row: ColorRow): BrandColorData {
  return {
    id: row.id,
    brandId: row.brand_id,
    ownerId: row.owner_id,
    hex: row.hex,
    name: row.name,
    ordinal: row.ordinal,
    createdAt: new Date(row.created_at),
  };
}

async function rowToBrand(client: SupabaseClient<Database>, row: BrandRow): Promise<BrandData> {
  const [{ data: logos }, { data: colors }] = await Promise.all([
    client.from('brand_logos').select('*').eq('brand_id', row.id).order('ordinal'),
    client.from('brand_colors').select('*').eq('brand_id', row.id).order('ordinal'),
  ]);
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    description: row.description,
    website: row.website,
    logos: (logos ?? []).map(rowToLogo),
    colors: (colors ?? []).map(rowToColor),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class SupabaseBrandRepository implements IBrandRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async findByOwnerId(ownerId: string): Promise<BrandData | null> {
    const { data } = await this.client
      .from('brands')
      .select('*')
      .eq('owner_id', ownerId)
      .maybeSingle();
    if (!data) return null;
    return rowToBrand(this.client, data);
  }

  async upsert(input: { ownerId: string; name: string; description: string; website: string }): Promise<BrandData> {
    const { data } = await this.client
      .from('brands')
      .upsert(
        {
          owner_id: input.ownerId,
          name: input.name,
          description: input.description,
          website: input.website,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'owner_id' },
      )
      .select()
      .single();
    return rowToBrand(this.client, data!);
  }

  async saveLogo(
    brandId: string,
    ownerId: string,
    logo: { storageKey: string; publicUrl: string; name: string; ordinal: number },
  ): Promise<BrandLogoData> {
    const { data } = await this.client
      .from('brand_logos')
      .insert({
        brand_id: brandId,
        owner_id: ownerId,
        storage_key: logo.storageKey,
        public_url: logo.publicUrl,
        name: logo.name,
        ordinal: logo.ordinal,
      })
      .select()
      .single();
    return rowToLogo(data!);
  }

  async removeLogo(id: string, ownerId: string): Promise<void> {
    await this.client.from('brand_logos').delete().eq('id', id).eq('owner_id', ownerId);
  }

  async saveColor(
    brandId: string,
    ownerId: string,
    color: { hex: string; name: string; ordinal: number },
  ): Promise<BrandColorData> {
    const { data } = await this.client
      .from('brand_colors')
      .insert({
        brand_id: brandId,
        owner_id: ownerId,
        hex: color.hex,
        name: color.name,
        ordinal: color.ordinal,
      })
      .select()
      .single();
    return rowToColor(data!);
  }

  async removeColor(id: string, ownerId: string): Promise<void> {
    await this.client.from('brand_colors').delete().eq('id', id).eq('owner_id', ownerId);
  }
}
