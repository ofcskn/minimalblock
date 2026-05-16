import { MediaAsset } from '../value-objects/media-asset.vo.js';
import { ConversionStatus } from '../value-objects/conversion-status.vo.js';
import { QualityReport } from '../value-objects/quality-report.vo.js';

export type ProviderId = 'meshy' | 'tripo' | 'gemini' | 'mock';

export interface ConversionProps {
  id: string;
  productId: string;
  ownerId: string;
  // Legacy single-asset input. Kept for backwards-compat with Phase 1 rows;
  // new rows hydrate `sourceAssets` from the join table and leave this
  // pointing at the first ordinal for older callers.
  sourceAsset: MediaAsset;
  sourceAssets?: MediaAsset[];
  outputAsset?: MediaAsset;
  status: ConversionStatus;
  errorMessage?: string;
  provider?: ProviderId;
  qualityReport?: QualityReport;
  approvedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Conversion {
  readonly id: string;
  readonly productId: string;
  readonly ownerId: string;
  readonly sourceAsset: MediaAsset;
  readonly sourceAssets: readonly MediaAsset[];
  readonly outputAsset?: MediaAsset;
  readonly status: ConversionStatus;
  readonly errorMessage?: string;
  readonly provider?: ProviderId;
  readonly qualityReport?: QualityReport;
  readonly approvedAt?: Date;
  readonly approvedBy?: string;
  readonly rejectionReason?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: ConversionProps) {
    this.id = props.id;
    this.productId = props.productId;
    this.ownerId = props.ownerId;
    this.sourceAsset = props.sourceAsset;
    this.sourceAssets = props.sourceAssets ?? [props.sourceAsset];
    this.outputAsset = props.outputAsset;
    this.status = props.status;
    this.errorMessage = props.errorMessage;
    this.provider = props.provider;
    this.qualityReport = props.qualityReport;
    this.approvedAt = props.approvedAt;
    this.approvedBy = props.approvedBy;
    this.rejectionReason = props.rejectionReason;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  private clone(patch: Partial<ConversionProps>): Conversion {
    return new Conversion({
      id: this.id,
      productId: this.productId,
      ownerId: this.ownerId,
      sourceAsset: this.sourceAsset,
      sourceAssets: [...this.sourceAssets],
      outputAsset: this.outputAsset,
      status: this.status,
      errorMessage: this.errorMessage,
      provider: this.provider,
      qualityReport: this.qualityReport,
      approvedAt: this.approvedAt,
      approvedBy: this.approvedBy,
      rejectionReason: this.rejectionReason,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      ...patch,
    });
  }

  markProcessing(provider?: ProviderId): Conversion {
    if (!this.status.isPending()) throw new Error('Only pending conversions can begin processing');
    return this.clone({ status: ConversionStatus.processing(), provider: provider ?? this.provider });
  }

  // Legacy Phase 1 transition: processing → completed. Kept so existing
  // callers (Gemini in-browser path) keep working until V2 rollout flips.
  markCompleted(outputAsset: MediaAsset): Conversion {
    if (!this.status.isProcessing()) throw new Error('Only processing conversions can be completed');
    return this.clone({ status: ConversionStatus.completed(), outputAsset });
  }

  // Phase 2: worker has uploaded the GLB + computed quality. Merchant
  // must approve/reject before the asset is publicly viewable.
  markAwaitingApproval(outputAsset: MediaAsset, quality: QualityReport): Conversion {
    if (!this.status.isProcessing()) {
      throw new Error('Only processing conversions can move to awaiting_approval');
    }
    return this.clone({
      status: ConversionStatus.awaitingApproval(),
      outputAsset,
      qualityReport: quality,
    });
  }

  approve(userId: string): Conversion {
    // Allow promoting legacy `completed` rows to `approved` so the new
    // public-page gate doesn't break Phase 1 products.
    if (!this.status.isAwaitingApproval() && !this.status.isCompleted()) {
      throw new Error('Only awaiting_approval or completed conversions can be approved');
    }
    return this.clone({
      status: ConversionStatus.approved(),
      approvedAt: new Date(),
      approvedBy: userId,
      rejectionReason: undefined,
    });
  }

  reject(reason: string): Conversion {
    if (!this.status.isAwaitingApproval()) {
      throw new Error('Only awaiting_approval conversions can be rejected');
    }
    return this.clone({
      status: ConversionStatus.rejected(),
      rejectionReason: reason,
    });
  }

  markFailed(reason: string): Conversion {
    return this.clone({ status: ConversionStatus.failed(), errorMessage: reason });
  }

  isAccessibleBy(userId: string): boolean {
    return this.ownerId === userId;
  }

  static create(
    id: string,
    productId: string,
    ownerId: string,
    sourceAsset: MediaAsset,
    sourceAssets?: MediaAsset[],
  ): Conversion {
    const now = new Date();
    return new Conversion({
      id,
      productId,
      ownerId,
      sourceAsset,
      sourceAssets: sourceAssets ?? [sourceAsset],
      status: ConversionStatus.pending(),
      createdAt: now,
      updatedAt: now,
    });
  }
}
