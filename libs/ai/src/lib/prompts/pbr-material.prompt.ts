export function buildPbrMaterialPrompt(partIds: string[], partLabels: string[]): string {
  const partList = partIds.map((id, i) => `  { "partId": "${id}", "label": "${partLabels[i] ?? id}" }`).join(',\n');

  return `You are a 3D materials expert. Analyze the provided product image(s) and determine the PBR material properties for each part listed below.

PARTS TO ANALYZE:
[
${partList}
]

FOR EACH PART:
1. Identify the dominant material (e.g. "painted-steel", "rubber", "glass", "fabric", "leather", "chrome", "matte-plastic", "wood", "ceramic")
2. Sample the dominant color from the image region that corresponds to this part
3. Estimate PBR properties:
   - roughness: 0 (mirror) to 1 (completely matte)
   - metalness: 0 (non-metal) to 1 (full metal)
   - transmissionFactor: 0–1 (only for glass/transparent parts, otherwise null)
   - emissiveFactor: [r,g,b] 0–2 range (only for emissive parts like screens/lights, otherwise null)

MATERIAL QUICK REFERENCE:
- Painted metal (car body): roughness 0.2–0.4, metalness 0.7–0.9
- Chrome (bumpers, trim): roughness 0.05, metalness 1.0, color [0.85,0.85,0.85,1]
- Rubber (tires, grips): roughness 0.85–0.95, metalness 0.0, color [0.1,0.1,0.1,1]
- Glass (windows, screens): roughness 0.05, metalness 0.1, transmissionFactor 0.85
- Fabric (upholstery, clothing): roughness 0.75–0.9, metalness 0.0
- Matte plastic: roughness 0.6–0.8, metalness 0.0
- Wood: roughness 0.65–0.8, metalness 0.0
- Screen (off): roughness 0.1, metalness 0.1, color [0.05,0.05,0.05,1]

OUTPUT: Return ONLY valid JSON, no markdown. Schema:
{
  "parts": [
    {
      "partId": string,
      "baseColor": [r, g, b, a],
      "roughness": number,
      "metalness": number,
      "transmissionFactor": number | null,
      "ior": number | null,
      "clearcoat": number | null,
      "emissiveFactor": [r, g, b] | null,
      "dominantMaterial": string
    }
  ]
}`;
}
