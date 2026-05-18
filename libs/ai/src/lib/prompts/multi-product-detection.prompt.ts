export interface MultiProductDetectionInput {
  title?: string;
  description?: string;
  imageCount: number;
  specTableKeys?: string[];
}

export interface ClusterFieldHints {
  title?: string;
  category?: string;
  materials?: string[];
  dimensions?: string;
}

export interface DetectedCluster {
  label: string;
  confidence: 'high' | 'medium' | 'low';
  imageIndexes: number[];
  fieldHints: ClusterFieldHints;
}

export interface MultiProductDetectionResult {
  multiProductDetected: boolean;
  clusters: DetectedCluster[];
}

export function buildMultiProductDetectionPrompt(input: MultiProductDetectionInput): string {
  const specKeys = input.specTableKeys?.length ? `\nSpec table keys: ${input.specTableKeys.join(', ')}` : '';
  return [
    'You are an AI product analyst examining an e-commerce page that may contain multiple distinct products.',
    'Your job: determine if this page shows ONE product or MULTIPLE independent products, and cluster images accordingly.',
    '',
    'MULTI-PRODUCT examples to detect:',
    '- Monitor + PC case (different products, different images)',
    '- Desk + Chair (separate furniture items)',
    '- Keyboard + Mouse (separate peripherals)',
    '- Sofa + Pillow set (primary + accessory)',
    '- Camera + Lens (separate items)',
    '- Modular furniture components sold separately',
    '',
    'DO NOT split for:',
    '- Multiple color/finish variants of the same product',
    '- Multiple size variants (S/M/L)',
    '- Accessory shots of the same product (cable, remote, stand)',
    '- Package contents that come IN the box',
    '- Lifestyle environment props (a lamp next to a sofa when selling the sofa)',
    '',
    `Page title: ${input.title ?? 'n/a'}`,
    `Page description: ${input.description?.slice(0, 500) ?? 'n/a'}`,
    `Number of images available: ${input.imageCount}`,
    specKeys,
    '',
    'Respond with JSON only:',
    '{"multiProductDetected":false,"clusters":[{"label":"Main product","confidence":"high","imageIndexes":[0,1,2],"fieldHints":{"title":"string","category":"string","materials":["string"],"dimensions":"string"}}]}',
    '',
    'If multiProductDetected is false, return a single cluster containing all image indexes.',
    'If multiProductDetected is true, each cluster must have at least 1 image index.',
    'confidence: high (clearly separate), medium (likely separate), low (uncertain)',
  ].join('\n');
}
