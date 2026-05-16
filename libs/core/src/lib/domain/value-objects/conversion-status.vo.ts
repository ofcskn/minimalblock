export type ConversionStatusValue = 'pending' | 'processing' | 'completed' | 'failed';

export class ConversionStatus {
  private constructor(readonly value: ConversionStatusValue) {}

  static pending(): ConversionStatus { return new ConversionStatus('pending'); }
  static processing(): ConversionStatus { return new ConversionStatus('processing'); }
  static completed(): ConversionStatus { return new ConversionStatus('completed'); }
  static failed(): ConversionStatus { return new ConversionStatus('failed'); }

  static from(value: ConversionStatusValue): ConversionStatus {
    return new ConversionStatus(value);
  }

  isPending(): boolean { return this.value === 'pending'; }
  isProcessing(): boolean { return this.value === 'processing'; }
  isCompleted(): boolean { return this.value === 'completed'; }
  isFailed(): boolean { return this.value === 'failed'; }
  isTerminal(): boolean { return this.isCompleted() || this.isFailed(); }

  toString(): string { return this.value; }
}
