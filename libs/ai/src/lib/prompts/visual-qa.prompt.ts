import type { GeneratedPrimitive } from '@minimalblock/core';

function describeMesh(primitive: GeneratedPrimitive): string {
  if (primitive.shape === 'compound' && primitive.parts && primitive.parts.length > 0) {
    const partList = primitive.parts
      .map((part) => {
        const label = part.description ? `${part.description}: ` : '';
        if (part.shape === 'sphere') {
          return `${label}sphere (diameter ${part.widthM.toFixed(2)} m)`;
        }
        if (part.shape === 'cylinder') {
          return `${label}cylinder (diameter ${part.widthM.toFixed(2)} m, height ${part.heightM.toFixed(2)} m)`;
        }
        return `${label}box (${part.widthM.toFixed(2)} m W × ${part.heightM.toFixed(2)} m H × ${part.depthM.toFixed(2)} m D)`;
      })
      .join('; ');
    return `a compound mesh with ${primitive.parts.length} parts — ${partList}`;
  }

  if (primitive.shape === 'sphere') {
    return `a sphere with diameter ${primitive.widthM.toFixed(2)} m`;
  }
  if (primitive.shape === 'cylinder') {
    return `a cylinder with diameter ${primitive.widthM.toFixed(2)} m and height ${primitive.heightM.toFixed(2)} m`;
  }
  return `a box measuring ${primitive.widthM.toFixed(2)} m (W) × ${primitive.heightM.toFixed(2)} m (H) × ${primitive.depthM.toFixed(2)} m (D)`;
}

function scoringGuide(isCompound: boolean): string {
  if (isCompound) {
    return [
      '- 90-100: compound mesh closely represents the product structure (e.g. laptop screen + base for a laptop)',
      '- 70-89: compound mesh is a good structural approximation of the product',
      '- 40-69: partial match — some structural aspects are lost',
      '- 0-39: poor match — compound structure does not represent the product',
    ].join('\n');
  }
  return [
    '- 90-100: primitive matches product shape well (e.g. sphere for a ball, cylinder for a candle)',
    '- 70-89: primitive is a rough but acceptable approximation',
    '- 40-69: significant mismatch — product shape features are lost',
    '- 0-39: critical failure — primitive does not resemble the product at all',
  ].join('\n');
}

export function buildVisualQaPrompt(productCategory: string, primitive: GeneratedPrimitive): string {
  const isCompound = primitive.shape === 'compound';
  const [r, g, b] = primitive.baseColor.map((v) => Math.round(v * 255));
  const materialDescription = `roughness ${primitive.roughness.toFixed(2)}, metalness ${primitive.metalness.toFixed(2)}, base colour rgb(${r},${g},${b})`;
  const meshDescription = describeMesh(primitive);

  return (
    `You are a 3D commerce asset quality evaluator.\n\n` +
    `TASK\n` +
    `The source product images show a "${productCategory}" product. ` +
    `A 3D generation pipeline converted those images into ${meshDescription}, ${materialDescription}.\n\n` +
    `Evaluate whether this mesh is an acceptable 3D/AR representation of the product shown in the images for an e-commerce product page.\n\n` +
    `SCORING GUIDE\n` +
    `${scoringGuide(isCompound)}\n\n` +
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
