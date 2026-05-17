export interface GeminiQaResult {
  conversionSucceeded: boolean;
  qualityScore: number;
  status: 'excellent' | 'good' | 'needs_improvement' | 'failed' | 'critical_failure';
  categoryMatch: { score: number; reason: string };
  missingParts: string[];
  sourceImageIssues: string[];
  recommendedActions: string[];
}

export interface QualityReportProps {
  fileSizeBytes: number;
  triangleCount: number;
  textureMaxDim: number;
  hasUSDZ: boolean;
  arCompat: boolean;
  warnings: string[];
  geminiQaScore?: number;
  geminiQaReport?: GeminiQaResult;
  isPrimitiveMesh?: boolean;
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
  readonly geminiQaScore: number | undefined;
  readonly geminiQaReport: GeminiQaResult | undefined;
  readonly isPrimitiveMesh: boolean;

  constructor(props: QualityReportProps) {
    this.fileSizeBytes = props.fileSizeBytes;
    this.triangleCount = props.triangleCount;
    this.textureMaxDim = props.textureMaxDim;
    this.hasUSDZ = props.hasUSDZ;
    this.arCompat = props.arCompat;
    this.warnings = props.warnings;
    this.geminiQaScore = props.geminiQaScore;
    this.geminiQaReport = props.geminiQaReport;
    this.isPrimitiveMesh = props.isPrimitiveMesh ?? false;
  }

  // 0–100 weighted score:
  //   45% technical (file size, triangle count, texture, AR compat)
  //   45% visual fidelity (Gemini QA score, when available)
  //   10% source image readiness (penalised by upload warnings)
  //
  // When no Gemini QA score is present the technical score stands alone (legacy
  // behaviour) so old records are not affected.
  score(): number {
    const technicalScore = this.#technicalScore();

    if (this.geminiQaScore === undefined) {
      return technicalScore;
    }

    const sourceWarningCount = this.warnings.filter((w) => w.toLowerCase().includes('source image')).length;
    const sourceScore = Math.max(0, 100 - sourceWarningCount * 10);

    const weighted = Math.round(0.45 * this.geminiQaScore + 0.45 * technicalScore + 0.10 * sourceScore);

    return Math.max(0, Math.min(100, weighted));
  }

  #technicalScore(): number {
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
      geminiQaScore: this.geminiQaScore,
      geminiQaReport: this.geminiQaReport,
      isPrimitiveMesh: this.isPrimitiveMesh,
    };
  }

  static fromJSON(json: QualityReportProps): QualityReport {
    return new QualityReport(json);
  }
}
