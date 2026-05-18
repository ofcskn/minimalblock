import type { ProductAiAnalysis } from '@minimalblock/core';

export function getMockAnalysis(scenario: 'failed' | 'success' | 'warning'): ProductAiAnalysis {
  if (scenario === 'failed') {
    return {
      categorySuggestion: 'electronics',
      materials: ['plastic', 'memory foam', 'stainless steel'],
      confidenceScore: 0.25,
      readinessScore: 22,
      missingVisuals: ['back view', 'detail shot'],
      suggestedCopy: {
        seoTitle: 'Wireless Noise-Cancelling Headphones | 30-Hour Battery',
        bullets: [
          'Active noise cancellation for immersive listening',
          '30-hour battery life with USB-C charging',
          'Foldable design for easy portability',
        ],
        description: 'Experience studio-quality sound with these over-ear headphones featuring ANC technology.',
      },
      returnRiskFactors: [
        { risk: 'Color appears darker in product images than in real life', fix: 'Reshoot under consistent daylight-balanced lighting' },
        { risk: 'Ear cup size not visible from listing images', fix: 'Add a comparison image showing headphones on a mannequin head' },
      ],
      qualityRecommendations: [
        'Add a 360° turntable video to reduce return rate',
        'Include a close-up of the control buttons on the ear cup',
        'Show the folded travel configuration',
      ],
      merchantRecommendations: [
        'Highlight the USB-C charging port in a dedicated image',
        'Compare battery life against competing models in the copy',
      ],
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  if (scenario === 'warning') {
    return {
      categorySuggestion: 'home-decor',
      materials: ['marble', 'brushed brass', 'fabric shade'],
      confidenceScore: 0.62,
      readinessScore: 58,
      missingVisuals: ['close-up of marble base', 'lamp head adjustment range'],
      suggestedCopy: {
        seoTitle: 'Modern Arc Floor Lamp with Marble Base | Adjustable',
        bullets: [
          'Natural marble base provides stable, elegant foundation',
          'Adjustable arc head positions light exactly where needed',
          'Compatible with standard E27 bulbs up to 60W',
        ],
        description: 'A sculptural arc lamp that doubles as a statement piece — the marble base grounds the space while the fabric shade diffuses warm light.',
      },
      returnRiskFactors: [
        { risk: 'Marble pattern variation not communicated', fix: 'Add a disclaimer and multiple base photos showing variation' },
      ],
      qualityRecommendations: [
        'Photograph the lamp both lit and unlit to show shade translucency',
        'Add a room-scale photo to communicate the 180cm height',
        'Show the arc adjustment range with before/after positions',
      ],
      merchantRecommendations: [
        'Bundle with recommended bulb types in the listing',
        'Add assembly time estimate to reduce support inquiries',
      ],
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  // scenario === 'success'
  return {
    categorySuggestion: 'bags',
    materials: ['full-grain leather', 'brass hardware', 'cotton lining'],
    confidenceScore: 0.94,
    readinessScore: 91,
    missingVisuals: [],
    suggestedCopy: {
      seoTitle: 'Italian Full-Grain Leather Tote Bag | Handcrafted',
      bullets: [
        'Full-grain Italian leather that develops a rich patina over time',
        'Spacious interior fits a 13" laptop with room to spare',
        'Solid brass hardware for lifetime durability',
      ],
      description: 'A timeless tote handcrafted by Italian artisans from premium full-grain leather — built to last decades.',
    },
    returnRiskFactors: [],
    qualityRecommendations: [
      'Consider adding an interior organization shot to highlight pocket layout',
    ],
    merchantRecommendations: [
      'Emphasize the patina development story in the product description',
      'Cross-sell with the matching wallet and cardholders',
    ],
    lastUpdatedAt: new Date().toISOString(),
  };
}
