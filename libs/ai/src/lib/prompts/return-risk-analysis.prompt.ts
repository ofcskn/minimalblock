export interface ReturnRiskInput {
  name: string;
  category: string;
  description: string;
  hotspotCount: number;
}

export function buildReturnRiskPrompt(input: ReturnRiskInput): string {
  return `You are a product experience consultant specializing in e-commerce conversion optimization and return reduction.

Analyze this product's 3D page setup and identify buyer confidence gaps that typically cause product returns or abandoned carts.

Product:
- Name: ${input.name}
- Category: ${input.category}
- Description: ${input.description || 'No description provided'}
- Hotspot annotations added: ${input.hotspotCount}
- AR preview: enabled (WebXR)

Return a JSON array of 3 to 5 improvement opportunities. Each item must have:
- "risk": the specific buyer uncertainty or return cause (1 sentence, specific to this product)
- "recommendation": a concrete action to address it (1 sentence, actionable)

Focus on: size/scale communication, material and texture clarity, dimension information, comparison to familiar objects, assembly or mechanism clarity, and variant differentiation.

Respond ONLY with the raw JSON array. No markdown, no code fences, no other text.`;
}
