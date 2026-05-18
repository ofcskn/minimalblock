import type { ScaleBounds } from '../types/product-understanding.types.js';

/** Known real-world size references keyed by subtype keyword. */
const SIZE_PRIORS: Record<string, { wM: [number,number], hM: [number,number], dM: [number,number] }> = {
  car:         { wM: [1.6, 2.1],  hM: [1.2, 2.0],  dM: [3.5, 5.5] },
  suv:         { wM: [1.7, 2.2],  hM: [1.6, 2.2],  dM: [4.0, 5.5] },
  motorcycle:  { wM: [0.6, 0.9],  hM: [1.0, 1.4],  dM: [1.8, 2.5] },
  bicycle:     { wM: [0.4, 0.6],  hM: [0.9, 1.2],  dM: [1.5, 2.0] },
  chair:       { wM: [0.4, 0.7],  hM: [0.8, 1.1],  dM: [0.4, 0.7] },
  sofa:        { wM: [1.5, 2.8],  hM: [0.7, 1.0],  dM: [0.7, 1.1] },
  table:       { wM: [0.6, 2.0],  hM: [0.7, 0.8],  dM: [0.6, 1.2] },
  desk:        { wM: [1.0, 1.8],  hM: [0.7, 0.8],  dM: [0.5, 0.9] },
  laptop:      { wM: [0.28, 0.40], hM: [0.17, 0.28], dM: [0.15, 0.30] },
  phone:       { wM: [0.07, 0.09], hM: [0.13, 0.18], dM: [0.006, 0.012] },
  tablet:      { wM: [0.15, 0.30], hM: [0.20, 0.40], dM: [0.005, 0.010] },
  monitor:     { wM: [0.45, 1.2],  hM: [0.35, 0.75], dM: [0.10, 0.30] },
  headphones:  { wM: [0.15, 0.22], hM: [0.18, 0.25], dM: [0.06, 0.12] },
  earbuds:     { wM: [0.02, 0.04], hM: [0.02, 0.04], dM: [0.02, 0.04] },
  bottle:      { wM: [0.06, 0.12], hM: [0.15, 0.35], dM: [0.06, 0.12] },
  cup:         { wM: [0.06, 0.12], hM: [0.08, 0.15], dM: [0.06, 0.12] },
  shoe:        { wM: [0.08, 0.14], hM: [0.08, 0.18], dM: [0.22, 0.32] },
  shirt:       { wM: [0.40, 0.65], hM: [0.55, 0.80], dM: [0.01, 0.04] },
  watch:       { wM: [0.03, 0.05], hM: [0.03, 0.05], dM: [0.01, 0.015] },
  ring:        { wM: [0.015, 0.025], hM: [0.005, 0.015], dM: [0.015, 0.025] },
  lamp:        { wM: [0.25, 0.60], hM: [0.40, 1.80], dM: [0.25, 0.60] },
  bookshelf:   { wM: [0.60, 1.20], hM: [1.20, 2.20], dM: [0.25, 0.40] },
};

function findPrior(subtype: string) {
  const lower = subtype.toLowerCase();
  for (const [key, val] of Object.entries(SIZE_PRIORS)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

export function buildScaleEstimationPrompt(subtype: string, declaredDimensions?: string): string {
  const prior = findPrior(subtype);
  const priorNote = prior
    ? `Known real-world range for "${subtype}": W ${prior.wM[0]}–${prior.wM[1]} m, H ${prior.hM[0]}–${prior.hM[1]} m, D ${prior.dM[0]}–${prior.dM[1]} m.`
    : `No known reference found for "${subtype}". Use visual estimation.`;

  const dimNote = declaredDimensions
    ? `Declared dimensions from product listing: "${declaredDimensions}". Parse and convert to metres. Use these as the primary source.`
    : 'No declared dimensions available. Use category knowledge and visual estimation.';

  return `Estimate the real-world 3D scale of this product.

Product subtype: "${subtype}"
${dimNote}
${priorNote}

OUTPUT: Return ONLY valid JSON.
{
  "widthM":  { "min": number, "best": number, "max": number },
  "heightM": { "min": number, "best": number, "max": number },
  "depthM":  { "min": number, "best": number, "max": number },
  "confidence": "high" | "medium" | "low",
  "referenceSource": "declared-dimensions" | "category-knowledge" | "visual-estimate"
}`;
}

/** Derive scale bounds from known priors without calling Gemini. */
export function getStaticScaleBounds(subtype: string, declaredDimensions?: string): ScaleBounds {
  const prior = findPrior(subtype);
  if (prior) {
    return {
      widthM:  { min: prior.wM[0], best: (prior.wM[0] + prior.wM[1]) / 2, max: prior.wM[1] },
      heightM: { min: prior.hM[0], best: (prior.hM[0] + prior.hM[1]) / 2, max: prior.hM[1] },
      depthM:  { min: prior.dM[0], best: (prior.dM[0] + prior.dM[1]) / 2, max: prior.dM[1] },
      confidence: 'medium',
      referenceSource: declaredDimensions ? 'declared-dimensions' : 'category-knowledge',
    };
  }
  return {
    widthM:  { min: 0.05, best: 0.3, max: 2.0 },
    heightM: { min: 0.05, best: 0.3, max: 2.0 },
    depthM:  { min: 0.05, best: 0.3, max: 2.0 },
    confidence: 'low',
    referenceSource: 'visual-estimate',
  };
}
