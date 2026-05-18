import type { QualityHint } from '../types/ai-request.types.js';

const GEOMETRY_FAMILIES = [
  'hard-surface',
  'organic',
  'cloth-fabric',
  'cylindrical',
  'mechanical',
  'soft-body',
] as const;

const PRIMITIVE_SHAPES = [
  'box',
  'cylinder',
  'sphere',
  'tapered-cylinder',
  'frustum',
  'wedge',
  'torus',
  'extruded-ellipse',
] as const;

const RELATIVE_SIZES = ['dominant', 'large', 'medium', 'small', 'detail'] as const;

export interface ProductUnderstandingPromptInput {
  productCategory: string;
  productTitle?: string;
  productDimensions?: string;
  inferredMaterial?: string;
  imageViewAngles?: string[];
  quality: QualityHint;
}

export function buildProductUnderstandingPrompt(input: ProductUnderstandingPromptInput): string {
  const { productCategory, productTitle, productDimensions, inferredMaterial, imageViewAngles, quality } = input;

  const qualityInstructions = quality === 'fast'
    ? 'List only the 3–5 most visually dominant structural parts. Prioritize speed over completeness.'
    : quality === 'quality'
    ? 'List every distinct structural component you can identify, including symmetric pairs. Be thorough and precise.'
    : 'List the main structural parts — aim for 5–12 parts that define the product shape.';

  const viewInfo = imageViewAngles?.length
    ? `Images provided: ${imageViewAngles.join(', ')} view(s).`
    : 'Single image provided.';

  return `You are an expert 3D reconstruction AI. Analyze the provided product image(s) and output a structured JSON describing the product's 3D structure.

CONTEXT:
- Product category hint: "${productCategory}"
${productTitle ? `- Product name: "${productTitle}"` : ''}
${productDimensions ? `- Declared dimensions: ${productDimensions}` : ''}
${inferredMaterial ? `- Inferred material: ${inferredMaterial}` : ''}
- ${viewInfo}

COORDINATE SYSTEM:
- Y axis = up
- Z axis = forward (front of product)
- X axis = right
- Origin = center of the product's base (bottom center)
- All dimensions in metres

GEOMETRY FAMILIES (pick exactly one):
${GEOMETRY_FAMILIES.map(f => `  "${f}"`).join('\n')}

PRIMITIVE SHAPES (geometryHint per part):
${PRIMITIVE_SHAPES.map(s => `  "${s}"`).join('\n')}

RELATIVE SIZES (pick one per part):
${RELATIVE_SIZES.map(s => `  "${s}"`).join('\n')}

ANALYSIS TASK:
${qualityInstructions}

IMPORTANT RULES:
1. Override the category hint if you identify a different product.
2. For symmetric products (cars, headphones, chairs), identify each symmetric part ONCE and add symmetricCounterpart pointing to the other side's partId. The engine will mirror it automatically.
3. Never use "box" for circular objects (wheels, buttons, knobs) — use "cylinder" or "torus".
4. A car MUST have: body, 4 wheels (2 front + 2 rear — use symmetricCounterpart), windshield, rear window, headlights, taillights, front bumper, rear bumper. List only one from each symmetric pair and mark symmetricCounterpart.
5. A t-shirt MUST use geometryFamily "cloth-fabric".
6. Glass/transparent surfaces must be identified (material = "glass" or "transparent-plastic").
7. relativePosition uses format "center", "top-center", "bottom-left", "front-center", etc.
8. If dimensions are declared, use them to estimate the bounding box accurately.

OUTPUT: Return ONLY valid JSON, no markdown, no code fences. Schema:
{
  "detectedCategory": string,
  "detectedSubtype": string,
  "geometryFamily": "${GEOMETRY_FAMILIES.join('" | "')}",
  "structuralParts": [
    {
      "partId": string,
      "label": string,
      "geometryHint": "${PRIMITIVE_SHAPES.join('" | "')}",
      "relativeSize": "${RELATIVE_SIZES.join('" | "')}",
      "relativePosition": string,
      "material": string,
      "isVisible": boolean,
      "symmetricCounterpart": string | null
    }
  ],
  "symmetryAxis": "x" | "z" | "none",
  "estimatedBoundingBox": { "width": number, "height": number, "depth": number },
  "viewAnglesDetected": string[],
  "confidence": number,
  "structuralWarnings": string[]
}`;
}
