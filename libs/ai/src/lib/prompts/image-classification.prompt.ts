export interface ImageClassificationPromptInput {
  imageCount: number;
  productTitleHint?: string;
}

export interface ImageClassificationResult {
  index: number;
  imageClass: 'product-hero' | 'product-detail' | 'lifestyle' | 'logo' | 'banner' | 'ui-asset' | 'icon' | 'unknown';
  relevanceScore: number;
  viewAngle: 'front' | 'back' | 'left' | 'right' | 'top' | 'detail' | 'lifestyle' | 'unknown';
  rejected: boolean;
  rejectionReason?: string;
}

export function buildImageClassificationPrompt(input: ImageClassificationPromptInput): string {
  const hint = input.productTitleHint ? `\nProduct title hint: ${input.productTitleHint}` : '';
  return [
    'You are an AI image intelligence engine for an e-commerce product platform.',
    'You will receive a batch of images from a product page.',
    'Your job: classify each image precisely and reject non-product visuals automatically.',
    '',
    'REJECT these image types (set rejected: true):',
    '- Logos, brand marks, watermarks',
    '- Banners, promotional graphics, sale overlays',
    '- UI assets (buttons, icons, checkmarks, arrows)',
    '- Payment icons, trust badges, star ratings, review graphics',
    '- Navigation elements, header/footer images',
    '- Typography-heavy marketing graphics',
    '- Duplicate views of the exact same angle',
    '',
    'ACCEPT and prioritize (set rejected: false):',
    '- Clean product shots (especially white/neutral background)',
    '- Multi-angle product views (front, back, left, right, top)',
    '- Close-up detail/material shots',
    '- Lifestyle shots showing the product in use (relevanceScore 0.5–0.7)',
    '- Packaging or scale reference shots (relevanceScore 0.4–0.6)',
    '',
    'imageClass values: product-hero, product-detail, lifestyle, logo, banner, ui-asset, icon, unknown',
    'viewAngle values: front, back, left, right, top, detail, lifestyle, unknown',
    'relevanceScore: 0.0–1.0 (hero front shot = 1.0, lifestyle = 0.6, rejected = 0.0)',
    hint,
    '',
    `Classify all ${input.imageCount} images. Respond with JSON only:`,
    '[{"index":0,"imageClass":"product-hero","relevanceScore":0.95,"viewAngle":"front","rejected":false},...]',
    'Use the exact JSON array format. Index matches the order images were provided.',
  ].join('\n');
}
