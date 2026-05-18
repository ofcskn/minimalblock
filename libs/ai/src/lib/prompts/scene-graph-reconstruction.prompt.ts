import type { ProductUnderstanding, GeometryIntelligence, ScaleBounds } from '../types/product-understanding.types.js';
import type { QualityHint } from '../types/ai-request.types.js';

export function buildSceneGraphReconstructionPrompt(
  understanding: ProductUnderstanding,
  geometryIntelligence: GeometryIntelligence,
  scaleBounds: ScaleBounds,
  quality: QualityHint,
): string {
  const partsJson = JSON.stringify(understanding.structuralParts, null, 2);
  const geomJson  = JSON.stringify(geometryIntelligence, null, 2);
  const bb = understanding.estimatedBoundingBox;

  const depthInstruction = quality === 'quality'
    ? 'Infer hidden and rear geometry from product knowledge. Estimate thickness, depth, and underside carefully.'
    : 'Estimate depth from visible cues and category knowledge. Be reasonable, not exact.';

  const exampleNote = understanding.detectedSubtype.match(/car|suv|truck|sedan|vehicle/) ? `
VEHICLE-SPECIFIC INSTRUCTIONS:
- Car body: use "extruded-ellipse" shape — it produces a rounded cross-section. Alternatively use "box" with large dimensions.
- Wheels: MUST use "torus" shape. Major radius (width/2) ≈ 0.32 m for a car. Tube radius ≈ 0.09 m.
- Wheel positions: front-left, front-right (same X magnitude, opposite signs), rear-left, rear-right.
  - Y = tire major radius (center of wheel at height = tire outer radius from ground)
  - X = ±(body_width/2 + small_offset) ≈ ±0.85 m for a standard car
  - Z front wheels ≈ +1.2 m, rear wheels ≈ -1.2 m (origin at center-bottom)
  - Mark front-left and rear-left with symmetryMirror: "x" (engine will create right-side counterparts)
- Windows (windshield, rear window): use "box" with very small depth (~0.01 m). Set transmissionFactor: 0.85.
- Car body scale: width ≈ 1.8 m, height ≈ 1.4 m, depth ≈ 4.5 m for a sedan.
` : understanding.detectedSubtype.match(/bottle|can|jar|flask/) ? `
BOTTLE-SPECIFIC INSTRUCTIONS:
- Body: use "cylinder". Diameter ≈ 0.07 m, height ≈ 0.22 m for a standard bottle.
- Neck: use "tapered-cylinder". radiusBottom ≈ body_radius, radiusTop ≈ 0.015 m. Height ≈ 0.05 m.
- Cap: use "cylinder". Diameter ≈ neck_top_diameter * 1.2. Height ≈ 0.02 m.
` : understanding.detectedSubtype.match(/t-shirt|shirt|hoodie|jacket|sweater/) ? `
CLOTHING-SPECIFIC INSTRUCTIONS:
- Clothing is FLAT. Body depth ≈ 0.02–0.04 m (fabric thickness when laid flat or on hanger).
- Use "box" for body, sleeves, collar. These are flat panels.
- Roughness MUST be > 0.7. Metalness MUST be 0.
- Symmetry axis = "x" (left/right symmetric).
` : '';

  return `You are a semantic 3D reconstruction AI. Based on the product understanding and geometry intelligence provided, construct a complete SceneGraph JSON describing the 3D structure of this product.

COORDINATE SYSTEM:
- Y = up. Origin at center-bottom of product (on the ground plane).
- Z = forward (front of product faces +Z).
- X = right.
- All dimensions in METRES.

PRODUCT UNDERSTANDING:
Category: ${understanding.detectedCategory} / ${understanding.detectedSubtype}
Geometry family: ${understanding.geometryFamily}
Symmetry axis: ${understanding.symmetryAxis}
Bounding box: ${bb.width}m (W) × ${bb.height}m (H) × ${bb.depth}m (D)
Scale confidence: ${scaleBounds.confidence} (source: ${scaleBounds.referenceSource})
Scale range W: ${scaleBounds.widthM.min}–${scaleBounds.widthM.max} m (best: ${scaleBounds.widthM.best} m)
Scale range H: ${scaleBounds.heightM.min}–${scaleBounds.heightM.max} m (best: ${scaleBounds.heightM.best} m)
Scale range D: ${scaleBounds.depthM.min}–${scaleBounds.depthM.max} m (best: ${scaleBounds.depthM.best} m)

STRUCTURAL PARTS TO RECONSTRUCT:
${partsJson}

GEOMETRY INTELLIGENCE:
${geomJson}
${exampleNote}
DEPTH RECONSTRUCTION: ${depthInstruction}

SYMMETRY RULES:
- Parts with symmetryMirror="x" will be automatically duplicated at the negative X position.
- Use symmetryMirror ONLY for parts that are genuinely symmetric (left wheel ↔ right wheel, left armrest ↔ right armrest).
- Do NOT use symmetryMirror for parts that are centered (body, seat, hood).

ROTATION FORMAT:
- rotation field is quaternion [x, y, z, w].
- No rotation = [0, 0, 0, 1].
- 90° around Y (facing left) = [0, 0.7071, 0, 0.7071].
- For a wheel lying flat in XZ plane and rotating around Y: [0, 0, 0, 1] already works for a torus in XZ.
  But if the torus is in the XY plane by default, rotate 90° around X: [0.7071, 0, 0, 0.7071].

MATERIAL DEFAULTS BY MATERIAL STRING:
- "painted-metal" or "painted-steel": roughness=0.3, metalness=0.8, baseColor from image
- "glass" or "windshield": roughness=0.05, metalness=0.1, transmissionFactor=0.85, baseColor=[0.8,0.9,1.0,0.3]
- "rubber": roughness=0.9, metalness=0.0, baseColor≈[0.1,0.1,0.1,1]
- "fabric" or "cloth": roughness=0.85, metalness=0.0
- "chrome": roughness=0.05, metalness=1.0, baseColor=[0.85,0.85,0.85,1]
- "plastic": roughness=0.5, metalness=0.0
- "wood": roughness=0.7, metalness=0.0

OUTPUT: Return ONLY valid JSON. No markdown. No code fences.

SCHEMA (output exactly this structure):
{
  "schemaVersion": "2.0",
  "productCategory": string,
  "productSubtype": string,
  "geometryFamily": string,
  "symmetryAxis": "x" | "z" | "none",
  "boundingBox": { "width": number, "height": number, "depth": number },
  "parts": [
    {
      "id": string,
      "label": string,
      "shape": "box" | "cylinder" | "sphere" | "tapered-cylinder" | "frustum" | "wedge" | "torus" | "extruded-ellipse",
      "dimensions": {
        "width": number,
        "height": number,
        "depth": number,
        "topWidth": number | null,
        "topDepth": number | null,
        "radiusTop": number | null,
        "radiusBottom": number | null,
        "tubeRadius": number | null,
        "majorRadius": number | null,
        "rx": number | null,
        "ry": number | null
      },
      "position": [x, y, z],
      "rotation": [x, y, z, w],
      "material": {
        "baseColor": [r, g, b, a],
        "roughness": number,
        "metalness": number,
        "transmissionFactor": number | null,
        "ior": number | null,
        "clearcoat": number | null,
        "emissiveFactor": [r, g, b] | null
      },
      "smooth": boolean,
      "segments": number | null,
      "symmetryMirror": "x" | "z" | null
    }
  ],
  "confidence": number,
  "sourceViewsUsed": string[],
  "structuralWarnings": string[]
}`;
}
