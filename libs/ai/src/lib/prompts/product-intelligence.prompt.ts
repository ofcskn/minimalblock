import type { ImageClass, ImageViewAngle } from '@minimalblock/core';

export interface ProductIntelligencePromptInput {
  imageCount: number;
  productTitleHint?: string;
}

export interface PerImageIntelligence {
  index: number;
  imageClass: ImageClass;
  relevanceScore: number;
  viewAngle: ImageViewAngle;
  rejected: boolean;
  rejectionReason?: string;
  informationValue: 'high' | 'medium' | 'low';
  geometricContribution: 'primary' | 'secondary' | 'none';
}

export interface DatasetIntelligence {
  productIdentityScore: number;
  datasetCoherence: 'high' | 'medium' | 'low';
  reconstructionReadiness: 'ready' | 'degraded' | 'blocked';
  reconstructionBlockReason?: string;
  uncertaintyLevel: 'low' | 'medium' | 'high';
  perspectiveDiversity: 'excellent' | 'adequate' | 'limited';
  intelligenceNotes: string[];
}

export interface ProductIntelligenceOutput {
  images: PerImageIntelligence[];
  dataset: DatasetIntelligence;
}

export function buildProductIntelligencePrompt(input: ProductIntelligencePromptInput): string {
  const hint = input.productTitleHint ? `\nProduct title hint: "${input.productTitleHint}"` : '';
  return [
    'You are a senior AI Product Intelligence Agent inside a commerce platform.',
    'You reason like a systems engineer evaluating a production image pipeline, not like a classifier.',
    '',
    'YOUR MISSION: evaluate a set of product images holistically and determine which ones carry',
    'genuine product information, how coherent the dataset is, and whether 3D reconstruction is safe.',
    '',
    '--- REASONING STRATEGY ---',
    '',
    'Step 1 — Infer the product identity.',
    'Before judging any single image, survey the full set to understand:',
    '- What is the likely product category?',
    '- What does the product look like (shape, material, form factor)?',
    '- Are all images describing the same product?',
    hint,
    '',
    'Step 2 — Evaluate each image contextually.',
    'For every image, ask: does this image meaningfully advance understanding of THIS specific product?',
    'Consider:',
    '- Product information value: does it reveal geometry, material, scale, or function?',
    '- Geometric contribution: does it provide a clean surface, edge, or view angle for 3D reasoning?',
    '- Contamination risk: if included in a downstream AI pipeline, would it mislead or degrade results?',
    '',
    'Do NOT apply rigid blacklists. A logo shot might be valuable if it confirms brand context.',
    'A lifestyle image might be the only view that reveals a product\'s true scale.',
    'A "banner" might contain the clearest front-view shot of the product.',
    'Reject only when the image genuinely does not represent the product.',
    '',
    'Step 3 — Evaluate the dataset as a whole.',
    'After examining all images, assess:',
    '- datasetCoherence: do the accepted images collectively describe the same product?',
    '- perspectiveDiversity: do accepted images cover multiple angles (front, back, side, top, detail)?',
    '- productIdentityScore: 0.0–1.0, how confident are you that all accepted images show the same product?',
    '- reconstructionReadiness: can a 3D model be safely generated from the accepted images?',
    '  * ready = sufficient geometry, clear product isolation, consistent product identity',
    '  * degraded = possible but risk of hallucination (e.g., only 1 angle, heavy occlusion)',
    '  * blocked = reconstruction would likely hallucinate (e.g., no isolatable product geometry)',
    '- uncertaintyLevel: how uncertain are you about the above assessments?',
    '',
    '--- OUTPUT FORMAT ---',
    '',
    `Analyze all ${input.imageCount} images. Respond with JSON only — no explanation, no markdown:`,
    '{',
    '  "images": [',
    '    {',
    '      "index": 0,',
    '      "imageClass": "product-hero",',
    '      "relevanceScore": 0.95,',
    '      "viewAngle": "front",',
    '      "rejected": false,',
    '      "informationValue": "high",',
    '      "geometricContribution": "primary"',
    '    }',
    '  ],',
    '  "dataset": {',
    '    "productIdentityScore": 0.9,',
    '    "datasetCoherence": "high",',
    '    "reconstructionReadiness": "ready",',
    '    "uncertaintyLevel": "low",',
    '    "perspectiveDiversity": "excellent",',
    '    "intelligenceNotes": []',
    '  }',
    '}',
    '',
    'imageClass values: product-hero, product-detail, lifestyle, logo, banner, ui-asset, icon, unknown',
    'viewAngle values: front, back, left, right, top, detail, lifestyle, unknown',
    'informationValue: high (reveals geometry/material/scale), medium (useful context), low (marginal)',
    'geometricContribution: primary (clean isolated product view), secondary (partial/occluded), none',
    'relevanceScore: 0.0–1.0 (hero front = 1.0, lifestyle = ~0.6, noise = 0.0)',
    'Use intelligenceNotes for any dataset-level observations worth surfacing to downstream systems.',
    'Index must match the order images were provided. Every image must have an entry.',
  ].join('\n');
}
