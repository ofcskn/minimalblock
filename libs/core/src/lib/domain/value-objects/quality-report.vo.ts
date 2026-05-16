export interface QualityReportProps {
  fileSizeBytes: number;
  triangleCount: number;
  textureMaxDim: number;
  hasUSDZ: boolean;
  arCompat: boolean;
  warnings: string[];
}

// Snapshot of the post-generation validation result. Persisted as JSONB on
// `conversions.quality_report` so the UI can render thresholds without
// re-validating the GLB on the client.
export class QualityReport {
  readonly fileSizeBytes: number;
  readonly triangleCount: number;
  readonly textureMaxDim: number;
  readonly hasUSDZ: boolean;
  readonly arCompat: boolean;
  readonly warnings: readonly string[];

  constructor(props: QualityReportProps) {
    this.fileSizeBytes = props.fileSizeBytes;
    this.triangleCount = props.triangleCount;
    this.textureMaxDim = props.textureMaxDim;
    this.hasUSDZ = props.hasUSDZ;
    this.arCompat = props.arCompat;
    this.warnings = props.warnings;
  }

  // 0–100. Shopify's partner guidance targets ~4MB GLB and hard-fails at 15MB.
  // Texture > 2048 and tris > 100k get progressively penalized. AR-incompat
  // costs 20 points. Warnings cap the floor.
  score(): number {
    let score = 100;
    if (this.fileSizeBytes > 15 * 1024 * 1024) score -= 60;
    else if (this.fileSizeBytes > 4 * 1024 * 1024) score -= 20;
    if (this.triangleCount > 200_000) score -= 30;
    else if (this.triangleCount > 100_000) score -= 10;
    if (this.textureMaxDim > 4096) score -= 20;
    else if (this.textureMaxDim > 2048) score -= 5;
    if (!this.arCompat) score -= 20;
    score -= Math.min(20, this.warnings.length * 5);
    return Math.max(0, Math.min(100, score));
  }

  toJSON(): QualityReportProps {
    return {
      fileSizeBytes: this.fileSizeBytes,
      triangleCount: this.triangleCount,
      textureMaxDim: this.textureMaxDim,
      hasUSDZ: this.hasUSDZ,
      arCompat: this.arCompat,
      warnings: [...this.warnings],
    };
  }

  static fromJSON(json: QualityReportProps): QualityReport {
    return new QualityReport(json);
  }
}
