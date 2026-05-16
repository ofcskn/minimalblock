export type ConversionStatusValue =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'awaiting_approval'
  | 'approved'
  | 'rejected';

export class ConversionStatus {
  private constructor(readonly value: ConversionStatusValue) {}

  static pending(): ConversionStatus { return new ConversionStatus('pending'); }
  static processing(): ConversionStatus { return new ConversionStatus('processing'); }
  static completed(): ConversionStatus { return new ConversionStatus('completed'); }
  static failed(): ConversionStatus { return new ConversionStatus('failed'); }
  static awaitingApproval(): ConversionStatus { return new ConversionStatus('awaiting_approval'); }
  static approved(): ConversionStatus { return new ConversionStatus('approved'); }
  static rejected(): ConversionStatus { return new ConversionStatus('rejected'); }

  static from(value: ConversionStatusValue): ConversionStatus {
    return new ConversionStatus(value);
  }

  isPending(): boolean { return this.value === 'pending'; }
  isProcessing(): boolean { return this.value === 'processing'; }
  isCompleted(): boolean { return this.value === 'completed'; }
  isFailed(): boolean { return this.value === 'failed'; }
  isAwaitingApproval(): boolean { return this.value === 'awaiting_approval'; }
  isApproved(): boolean { return this.value === 'approved'; }
  isRejected(): boolean { return this.value === 'rejected'; }

  // Terminal states stop polling. `awaiting_approval` is intentionally not
  // terminal: the merchant must act before the conversion is settled.
  isTerminal(): boolean {
    return this.isCompleted() || this.isFailed() || this.isApproved() || this.isRejected();
  }

  // Asset is safe to render in public/embed surfaces.
  // Legacy `completed` rows from Phase 1 are still viewable; the public-page
  // gate (Step 7) tightens this to `approved` only.
  isViewable(): boolean {
    return this.isCompleted() || this.isApproved();
  }

  toString(): string { return this.value; }
}
