import {
  Conversion,
  IConversionRepository,
  MediaAsset,
  ConversionStatus,
  QualityReport,
  type QualityReportProps,
  type ProviderId,
} from '@minimalblock/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from '../supabase/database.types.js';

type ConversionRow = Database['public']['Tables']['conversions']['Row'];
type SourceAssetRow = Database['public']['Tables']['conversion_source_assets']['Row'];

function rowToSourceAsset(row: SourceAssetRow): MediaAsset {
  return new MediaAsset({
    url: row.url,
    storageKey: row.storage_key,
    mimeType: row.mime as MediaAsset['mimeType'],
    kind: 'source-image',
    sizeBytes: row.size_bytes,
  });
}

function rowToConversion(row: ConversionRow, sources: SourceAssetRow[]): Conversion {
  const sortedSources = [...sources].sort((a, b) => a.ordinal - b.ordinal);
  const hydrated = sortedSources.map(rowToSourceAsset);

  // Legacy single-asset columns are the fallback when the join table has no
  // entries (Phase 1 rows). New rows persist into the join table only, but
  // we keep the legacy columns populated from ordinal 0 for back-compat.
  const legacySourceAsset = row.source_asset_url
    ? new MediaAsset({
        url: row.source_asset_url,
        storageKey: row.source_asset_key ?? '',
        mimeType: (row.source_asset_mime ?? 'image/jpeg') as MediaAsset['mimeType'],
        kind: 'source-image',
        sizeBytes: row.source_asset_size ?? 0,
      })
    : undefined;

  const sourceAssets = hydrated.length > 0 ? hydrated : legacySourceAsset ? [legacySourceAsset] : [];
  if (sourceAssets.length === 0) {
    throw new Error(`Conversion ${row.id} has no source assets`);
  }
  const primarySource = sourceAssets[0];

  const outputAsset = row.output_asset_url
    ? new MediaAsset({
        url: row.output_asset_url,
        storageKey: row.output_asset_key ?? row.output_storage_key ?? '',
        mimeType: (row.output_asset_mime ?? 'model/gltf-binary') as MediaAsset['mimeType'],
        kind: 'generated-model',
        sizeBytes: row.output_asset_size ?? 0,
      })
    : undefined;

  const qualityReport = row.quality_report
    ? QualityReport.fromJSON(row.quality_report as unknown as QualityReportProps)
    : undefined;

  return new Conversion({
    id: row.id,
    productId: row.product_id,
    ownerId: row.owner_id,
    sourceAsset: primarySource,
    sourceAssets,
    outputAsset,
    status: ConversionStatus.from(row.status),
    errorMessage: row.error_message ?? undefined,
    provider: (row.provider ?? undefined) as ProviderId | undefined,
    qualityReport,
    approvedAt: row.approved_at ? new Date(row.approved_at) : undefined,
    approvedBy: row.approved_by ?? undefined,
    rejectionReason: row.rejection_reason ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });
}

export class SupabaseConversionRepository implements IConversionRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  private async hydrateSources(conversionIds: string[]): Promise<Map<string, SourceAssetRow[]>> {
    if (conversionIds.length === 0) return new Map();
    const { data } = await this.client
      .from('conversion_source_assets')
      .select('*')
      .in('conversion_id', conversionIds);
    const map = new Map<string, SourceAssetRow[]>();
    for (const row of data ?? []) {
      const list = map.get(row.conversion_id) ?? [];
      list.push(row);
      map.set(row.conversion_id, list);
    }
    return map;
  }

  async findById(id: string): Promise<Conversion | null> {
    const { data } = await this.client.from('conversions').select('*').eq('id', id).single();
    if (!data) return null;
    const sources = await this.hydrateSources([id]);
    return rowToConversion(data, sources.get(id) ?? []);
  }

  async findByProductId(productId: string): Promise<Conversion[]> {
    const { data } = await this.client.from('conversions').select('*').eq('product_id', productId);
    const rows = data ?? [];
    const sources = await this.hydrateSources(rows.map((r) => r.id));
    return rows.map((r) => rowToConversion(r, sources.get(r.id) ?? []));
  }

  async findByOwnerId(ownerId: string): Promise<Conversion[]> {
    const { data } = await this.client
      .from('conversions')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })
      .limit(200);
    const rows = data ?? [];
    const sources = await this.hydrateSources(rows.map((r) => r.id));
    return rows.map((r) => rowToConversion(r, sources.get(r.id) ?? []));
  }

  async save(conversion: Conversion): Promise<Conversion> {
    const primarySource = conversion.sourceAssets[0] ?? conversion.sourceAsset;

    const { data } = await this.client
      .from('conversions')
      .upsert({
        id: conversion.id,
        product_id: conversion.productId,
        owner_id: conversion.ownerId,
        source_asset_url: primarySource.url,
        source_asset_key: primarySource.storageKey,
        source_asset_mime: primarySource.mimeType,
        source_asset_size: primarySource.sizeBytes,
        output_asset_url: conversion.outputAsset?.url ?? null,
        output_asset_key: conversion.outputAsset?.storageKey ?? null,
        output_asset_mime: conversion.outputAsset?.mimeType ?? null,
        output_asset_size: conversion.outputAsset?.sizeBytes ?? null,
        status: conversion.status.value,
        error_message: conversion.errorMessage ?? null,
        provider: conversion.provider ?? null,
        output_storage_key: conversion.outputAsset?.storageKey ?? null,
        quality_score: conversion.qualityReport?.score() ?? null,
        quality_report: (conversion.qualityReport?.toJSON() ?? null) as Json | null,
        approved_at: conversion.approvedAt?.toISOString() ?? null,
        approved_by: conversion.approvedBy ?? null,
        rejection_reason: conversion.rejectionReason ?? null,
      })
      .select()
      .single();

    // Persist multi-image source assets when we have more than the legacy
    // single primary. Replace-all semantics (delete-then-insert) keeps the
    // ordinal canonical with the aggregate's view of the world.
    if (conversion.sourceAssets.length > 1) {
      await this.client.from('conversion_source_assets').delete().eq('conversion_id', conversion.id);
      const inserts = conversion.sourceAssets.map((asset, ordinal) => ({
        conversion_id: conversion.id,
        owner_id: conversion.ownerId,
        url: asset.url,
        storage_key: asset.storageKey,
        mime: asset.mimeType,
        size_bytes: asset.sizeBytes,
        ordinal,
      }));
      await this.client.from('conversion_source_assets').insert(inserts);
    }

    const sources = await this.hydrateSources([conversion.id]);
    return rowToConversion(data!, sources.get(conversion.id) ?? []);
  }

  async delete(id: string): Promise<void> {
    await this.client.from('conversions').delete().eq('id', id);
  }
}
