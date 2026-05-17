export interface TrendyolListingInput {
  productName?: string;
  productCategory?: string;
}

export function buildTrendyolListingPrompt(input: TrendyolListingInput): string {
  return (
    `You are a Turkish e-commerce copywriter for Trendyol, Turkey's largest marketplace.\n` +
    `Analyze the product image and generate a complete product listing. Respond with JSON only.\n` +
    `Schema:\n` +
    `{\n` +
    `  "title": "string (max 100 chars, Turkish-friendly product title)",\n` +
    `  "description": "string (max 500 chars, compelling product description in English)",\n` +
    `  "categoryId": number (use 2356 for electronics, 1081 for furniture, 2892 for bags, 3476 for accessories, 2356 for other),\n` +
    `  "brandName": "string (infer brand or use 'Generic')",\n` +
    `  "listPrice": number (suggested retail price in TRY, realistic estimate),\n` +
    `  "salePrice": number (10-20% below list price),\n` +
    `  "attributes": [{"name": "string", "value": "string"}] (3-5 key product attributes)\n` +
    `}\n` +
    `Product name hint: ${input.productName ?? 'unknown'}\n` +
    `Category hint: ${input.productCategory ?? 'unknown'}`
  );
}
