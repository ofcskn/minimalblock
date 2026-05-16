import {
  GenerationJob,
  type GenerationJobStatus,
  type ProviderId,
  type IGenerationJobRepository,
} from '@minimalblock/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from '../supabase/database.types.js';

type Row = Database['public']['Tables']['generation_jobs']['Row'];

function rowToJob(row: Row): GenerationJob {
  return new GenerationJob({
    id: row.id,
    conversionId: row.conversion_id,
    ownerId: row.owner_id,
    provider: row.provider,
    providerJobId: row.provider_job_id ?? undefined,
    status: row.status,
    attempt: row.attempt,
    costCredits: row.cost_credits ?? undefined,
    errorMessage: row.error_message ?? undefined,
    requestPayload: row.request_payload ?? undefined,
    responsePayload: row.response_payload ?? undefined,
    startedAt: row.started_at ? new Date(row.started_at) : undefined,
    finishedAt: row.finished_at ? new Date(row.finished_at) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });
}

export class SupabaseGenerationJobRepository implements IGenerationJobRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async findById(id: string): Promise<GenerationJob | null> {
    const { data } = await this.client.from('generation_jobs').select('*').eq('id', id).single();
    return data ? rowToJob(data) : null;
  }

  async findByConversionId(conversionId: string): Promise<GenerationJob[]> {
    const { data } = await this.client
      .from('generation_jobs')
      .select('*')
      .eq('conversion_id', conversionId)
      .order('attempt', { ascending: true });
    return (data ?? []).map(rowToJob);
  }

  async findRunning(): Promise<GenerationJob[]> {
    const { data } = await this.client
      .from('generation_jobs')
      .select('*')
      .in('status', ['queued', 'running'] satisfies GenerationJobStatus[]);
    return (data ?? []).map(rowToJob);
  }

  async save(job: GenerationJob): Promise<GenerationJob> {
    const { data } = await this.client
      .from('generation_jobs')
      .upsert({
        id: job.id,
        conversion_id: job.conversionId,
        owner_id: job.ownerId,
        provider: job.provider satisfies ProviderId,
        provider_job_id: job.providerJobId ?? null,
        status: job.status,
        attempt: job.attempt,
        cost_credits: job.costCredits ?? null,
        error_message: job.errorMessage ?? null,
        request_payload: (job.requestPayload ?? null) as Json | null,
        response_payload: (job.responsePayload ?? null) as Json | null,
        started_at: job.startedAt?.toISOString() ?? null,
        finished_at: job.finishedAt?.toISOString() ?? null,
      })
      .select()
      .single();
    return rowToJob(data!);
  }
}
