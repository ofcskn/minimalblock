export interface MaterialInferenceInput {
  productTitle?: string;
  knownMaterials?: string[];
}

export interface MaterialInferenceResult {
  materialFinish: 'matte' | 'glossy' | 'brushed-metal' | 'fabric' | 'glass' | 'wood' | 'ceramic' | 'leather' | 'unknown';
  geometryComplexity: 'simple' | 'moderate' | 'complex' | 'compound';
  geometrySymmetry: 'symmetric' | 'asymmetric' | 'radial';
  inferredMaterials: string[];
  confidence: 'high' | 'medium' | 'low';
}

export function buildMaterialInferencePrompt(input: MaterialInferenceInput): string {
  const knownMats = input.knownMaterials?.length ? `\nKnown materials from listing: ${input.knownMaterials.join(', ')}` : '';
  const title = input.productTitle ? `\nProduct title: ${input.productTitle}` : '';
  return [
    'You are an AI material and geometry analyst for a 3D product generation platform.',
    'Analyze the provided product images to extract surface, material, and geometric properties.',
    'This data will feed into AI 3D generation systems — accuracy is critical.',
    '',
    'MATERIAL FINISH — identify the dominant surface appearance:',
    '- matte: flat, non-reflective surface (chalk paint, matte plastic, stone)',
    '- glossy: high-shine reflective surface (lacquered wood, polished chrome, glass)',
    '- brushed-metal: directional texture on metal (brushed steel, anodized aluminum)',
    '- fabric: textile surface (cotton, linen, velvet, bouclé, woven)',
    '- glass: transparent or translucent material (clear, frosted, tinted)',
    '- wood: visible wood grain (oak, walnut, pine, MDF with veneer)',
    '- ceramic: fired clay material (porcelain, terracotta, stoneware)',
    '- leather: natural or synthetic leather (full-grain, PU, bonded)',
    '- unknown: cannot determine from images',
    '',
    'GEOMETRY COMPLEXITY:',
    '- simple: basic box/cylinder/sphere form, minimal detail (mug, cube storage box)',
    '- moderate: recognizable shape with some detail (chair with straight legs, basic lamp)',
    '- complex: multiple distinct parts, curved surfaces, compound shapes (ergonomic chair)',
    '- compound: clearly multiple separate components assembled (shelving unit + brackets)',
    '',
    'GEOMETRY SYMMETRY:',
    '- symmetric: left-right mirror symmetry (most chairs, vases, mugs)',
    '- asymmetric: no clear axis of symmetry (organic shapes, designer objects)',
    '- radial: symmetry around a central axis (round table, cylinder lamp)',
    '',
    title,
    knownMats,
    '',
    'Respond with JSON only:',
    '{"materialFinish":"matte","geometryComplexity":"moderate","geometrySymmetry":"symmetric","inferredMaterials":["oak","fabric"],"confidence":"high"}',
  ].join('\n');
}
