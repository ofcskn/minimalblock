import { Conversion, IConversionRepository, MediaAsset, ConversionStatus } from '@minimalblock/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../supabase/database.types.js';

type ConversionRow = Database['public']['Tables']['conversions']['Row'];

function rowToConversion(row: ConversionRow): Conversion {
  const sourceAsset = new MediaAsset({
    url: row.source_asset_url,
    storageKey: row.source_asset_key,
    mimeType: row.source_asset_mime as MediaAsset['mimeType'],
    kind: 'source-image',
    sizeBytes: row.source_asset_size,
  });

  const outputAsset = row.output_asset_url
    ? new MediaAsset({
        url: row.output_asset_url,
        storageKey: row.output_asset_key!,
        mimeType: row.output_asset_mime as MediaAsset['mimeType'],
        kind: 'generated-model',
        sizeBytes: row.output_asset_size!,
      })
    : undefined;

  return new Conversion({
    id: row.id,
    productId: row.product_id,
    ownerId: row.owner_id,
    sourceAsset,
    outputAsset,
    status: ConversionStatus.from(row.status),
    errorMessage: row.error_message ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });
}

export class SupabaseConversionRepository implements IConversionRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async findById(id: string): Promise<Conversion | null> {
    const { data } = await this.client.from('conversions').select('*').eq('id', id).single();
    return data ? rowToConversion(data) : null;
  }

  async findByProductId(productId: string): Promise<Conversion[]> {
    const { data } = await this.client.from('conversions').select('*').eq('product_id', productId);
    return (data ?? []).map(rowToConversion);
  }

  async findByOwnerId(ownerId: string): Promise<Conversion[]> {
    const { data } = await this.client
      .from('conversions')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    return (data ?? []).map(rowToConversion);
  }

  async save(conversion: Conversion): Promise<Conversion> {
    const { data } = await this.client
      .from('conversions')
      .upsert({
        id: conversion.id,
        product_id: conversion.productId,
        owner_id: conversion.ownerId,
        source_asset_url: conversion.sourceAsset.url,
        source_asset_key: conversion.sourceAsset.storageKey,
        source_asset_mime: conversion.sourceAsset.mimeType,
        source_asset_size: conversion.sourceAsset.sizeBytes,
        output_asset_url: conversion.outputAsset?.url ?? null,
        output_asset_key: conversion.outputAsset?.storageKey ?? null,
        output_asset_mime: conversion.outputAsset?.mimeType ?? null,
        output_asset_size: conversion.outputAsset?.sizeBytes ?? null,
        status: conversion.status.value,
        error_message: conversion.errorMessage ?? null,
      })
      .select()
      .single();
    return rowToConversion(data!);
  }

  async delete(id: string): Promise<void> {
    await this.client.from('conversions').delete().eq('id', id);
  }
}
