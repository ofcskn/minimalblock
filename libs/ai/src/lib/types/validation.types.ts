export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  affectedPartId?: string;
}

export interface ValidationReport {
  passed: boolean;
  issues: ValidationIssue[];
  topologyScore: number;
  scaleScore: number;
  uvScore: number;
  overallScore: number;
}
