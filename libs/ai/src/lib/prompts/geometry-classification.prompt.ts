import type { ProductUnderstanding } from '../types/product-understanding.types.js';

export function buildGeometryClassificationPrompt(understanding: ProductUnderstanding): string {
  const partsJson = JSON.stringify(
    understanding.structuralParts.map(p => ({ partId: p.partId, label: p.label, geometryHint: p.geometryHint, relativeSize: p.relativeSize })),
    null, 2,
  );

  return `You are a 3D topology expert. Given the following product understanding, return tessellation and shading instructions for each part.

PRODUCT:
- Category: ${understanding.detectedCategory}
- Subtype: ${understanding.detectedSubtype}
- Geometry family: ${understanding.geometryFamily}

STRUCTURAL PARTS:
${partsJson}

YOUR TASK:
1. Confirm or refine the geometryFamily.
2. For each part, specify the recommended segment count (number of side faces for cylinders/spheres/tori).
3. Classify each part as smooth-shaded or flat-shaded.
4. Note any critical topology constraints (e.g. "wheels must be circular, not faceted").

SEGMENT GUIDE:
- Wheels/tires: 32 (must look circular)
- Round bottles/cans: 24
- Cylindrical legs: 12–16
- Spherical objects: lat=12, lon=16
- Extruded ellipses (car body): 32
- Tapered shapes (bottle neck): 20
- Flat box surfaces: ignore (N/A)

SMOOTH SHADING GUIDE:
- Smooth: organic shapes, car body, spheres, cylindrical surfaces, human-worn items
- Flat (hard edge): furniture boards, electronic panels, packaging boxes, frames

OUTPUT: Return ONLY valid JSON, no markdown. Schema:
{
  "geometryFamily": string,
  "recommendedSegments": { "<partId>": number },
  "smoothShadingParts": string[],
  "hardEdgeParts": string[],
  "criticalTopologyNotes": string[]
}`;
}
