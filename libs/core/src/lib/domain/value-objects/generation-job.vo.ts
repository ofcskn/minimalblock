import type { ProviderId } from '../aggregates/conversion.aggregate.js';

export type GenerationJobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';

export interface GenerationJobProps {
  id: string;
  conversionId: string;
  ownerId: string;
  provider: ProviderId;
  providerJobId?: string;
  status: GenerationJobStatus;
  attempt: number;
  costCredits?: number;
  errorMessage?: string;
  requestPayload?: unknown;
  responsePayload?: unknown;
  startedAt?: Date;
  finishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// One row per provider call. The merchant-facing aggregate is Conversion;
// GenerationJob is the operational record used by the worker for retries,
// failover, and cost tracking.
export class GenerationJob {
  readonly id: string;
  readonly conversionId: string;
  readonly ownerId: string;
  readonly provider: ProviderId;
  readonly providerJobId?: string;
  readonly status: GenerationJobStatus;
  readonly attempt: number;
  readonly costCredits?: number;
  readonly errorMessage?: string;
  readonly requestPayload?: unknown;
  readonly responsePayload?: unknown;
  readonly startedAt?: Date;
  readonly finishedAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: GenerationJobProps) {
    this.id = props.id;
    this.conversionId = props.conversionId;
    this.ownerId = props.ownerId;
    this.provider = props.provider;
    this.providerJobId = props.providerJobId;
    this.status = props.status;
    this.attempt = props.attempt;
    this.costCredits = props.costCredits;
    this.errorMessage = props.errorMessage;
    this.requestPayload = props.requestPayload;
    this.responsePayload = props.responsePayload;
    this.startedAt = props.startedAt;
    this.finishedAt = props.finishedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isTerminal(): boolean {
    return this.status === 'succeeded' || this.status === 'failed' || this.status === 'cancelled';
  }
}
