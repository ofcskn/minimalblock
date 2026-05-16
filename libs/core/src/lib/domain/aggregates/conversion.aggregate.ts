import { MediaAsset } from '../value-objects/media-asset.vo.js';
import { ConversionStatus } from '../value-objects/conversion-status.vo.js';

export interface ConversionProps {
  id: string;
  productId: string;
  ownerId: string;
  sourceAsset: MediaAsset;
  outputAsset?: MediaAsset;
  status: ConversionStatus;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Conversion {
  readonly id: string;
  readonly productId: string;
  readonly ownerId: string;
  readonly sourceAsset: MediaAsset;
  readonly outputAsset?: MediaAsset;
  readonly status: ConversionStatus;
  readonly errorMessage?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: ConversionProps) {
    this.id = props.id;
    this.productId = props.productId;
    this.ownerId = props.ownerId;
    this.sourceAsset = props.sourceAsset;
    this.outputAsset = props.outputAsset;
    this.status = props.status;
    this.errorMessage = props.errorMessage;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  markProcessing(): Conversion {
    if (!this.status.isPending()) throw new Error('Only pending conversions can begin processing');
    return new Conversion({ ...this, status: ConversionStatus.processing(), updatedAt: new Date() });
  }

  markCompleted(outputAsset: MediaAsset): Conversion {
    if (!this.status.isProcessing()) throw new Error('Only processing conversions can be completed');
    return new Conversion({ ...this, status: ConversionStatus.completed(), outputAsset, updatedAt: new Date() });
  }

  markFailed(reason: string): Conversion {
    return new Conversion({ ...this, status: ConversionStatus.failed(), errorMessage: reason, updatedAt: new Date() });
  }

  isAccessibleBy(userId: string): boolean {
    return this.ownerId === userId;
  }

  static create(id: string, productId: string, ownerId: string, sourceAsset: MediaAsset): Conversion {
    const now = new Date();
    return new Conversion({
      id, productId, ownerId, sourceAsset,
      status: ConversionStatus.pending(),
      createdAt: now, updatedAt: now,
    });
  }
}
