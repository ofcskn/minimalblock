import type { GeneratedPrimitive } from '@minimalblock/core';

export function buildVisualQaPrompt(productCategory: string, primitive: GeneratedPrimitive): string {
  const [r, g, b] = primitive.baseColor.map((v) => Math.round(v * 255));
  const shapeDescription =
    primitive.shape === 'sphere'
      ? `a sphere with diameter ${primitive.widthM.toFixed(2)} m`
      : primitive.shape === 'cylinder'
        ? `a cylinder with diameter ${primitive.widthM.toFixed(2)} m and height ${primitive.heightM.toFixed(2)} m`
        : `a box measuring ${primitive.widthM.toFixed(2)} m (W) × ${primitive.heightM.toFixed(2)} m (H) × ${primitive.depthM.toFixed(2)} m (D)`;

  const materialDescription = `roughness ${primitive.roughness.toFixed(2)}, metalness ${primitive.metalness.toFixed(2)}, base colour rgb(${r},${g},${b})`;

  return (
    `You are a 3D commerce asset quality evaluator.\n\n` +
    `TASK\n` +
    `The source product images show a "${productCategory}" product. ` +
    `A 3D generation pipeline converted those images into a single primitive mesh: ${shapeDescription}, ${materialDescription}.\n\n` +
    `Evaluate whether this primitive shape is an acceptable 3D/AR representation of the product shown in the images for an e-commerce product page.\n\n` +
    `SCORING GUIDE\n` +
    `- 90-100: primitive matches product shape well (e.g. sphere for a ball, cylinder for a candle)\n` +
    `- 70-89: primitive is a rough but acceptable approximation\n` +
    `- 40-69: significant mismatch — product shape features are lost\n` +
    `- 0-39: critical failure — primitive does not resemble the product at all\n\n` +
    `Respond with ONLY a raw JSON object — no markdown, no code fences:\n` +
    `{\n` +
    `  "conversionSucceeded": boolean,\n` +
    `  "qualityScore": number (0-100),\n` +
    `  "status": "excellent" | "good" | "needs_improvement" | "failed" | "critical_failure",\n` +
    `  "categoryMatch": { "score": number (0-10), "reason": string },\n` +
    `  "missingParts": string[],\n` +
    `  "sourceImageIssues": string[],\n` +
    `  "recommendedActions": string[]\n` +
    `}\n\n` +
    `Rules for "status":\n` +
    `- "excellent" for qualityScore 90-100\n` +
    `- "good" for 70-89\n` +
    `- "needs_improvement" for 40-69\n` +
    `- "failed" for 20-39\n` +
    `- "critical_failure" for 0-19`
  );
}
