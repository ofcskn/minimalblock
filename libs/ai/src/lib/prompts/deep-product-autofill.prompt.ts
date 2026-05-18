export interface DeepAutofillInput {
  title?: string;
  description?: string;
  longDescription?: string;
  categoryHint?: string;
  materials?: string[];
  dimensions?: string;
  specTable?: Record<string, string>;
  imageAlts: string[];
}

export function buildDeepAutofillPrompt(input: DeepAutofillInput): string {
  const specEntries = input.specTable && Object.keys(input.specTable).length > 0
    ? `\nSpec table:\n${Object.entries(input.specTable).map(([k, v]) => `  ${k}: ${v}`).join('\n')}`
    : '';
  const longDesc = input.longDescription ? `\nExtended description: ${input.longDescription.slice(0, 600)}` : '';
  return [
    'You are extracting seller-editable ecommerce product data from a scraped product page.',
    'Respond with JSON only — no markdown, no explanation.',
    '{"title":"string","category":"furniture|home-decor|bags|accessories|electronics|other","materials":["string"],"dimensions":"string","description":"string","missingFields":["string"],"confidenceByField":{"title":"high|medium|low","category":"high|medium|low","materials":"high|medium|low","dimensions":"high|medium|low","description":"high|medium|low"}}',
    '',
    `Source title: ${input.title ?? 'n/a'}`,
    `Source description: ${input.description ?? 'n/a'}`,
    longDesc,
    `Source category hint: ${input.categoryHint ?? 'n/a'}`,
    `Source materials: ${(input.materials ?? []).join(', ') || 'n/a'}`,
    `Source dimensions: ${input.dimensions ?? 'n/a'}`,
    specEntries,
    `Image hints: ${input.imageAlts.join(', ') || 'n/a'}`,
    '',
    'Rules:',
    '- Use the spec table and extended description for dimensions and materials when available',
    '- description must be ≤ 700 chars, clean prose, no marketing fluff or HTML',
    '- missingFields: list field names where data is absent or very uncertain',
    '- confidenceByField: rate confidence per field based on source quality',
  ].join('\n');
}
