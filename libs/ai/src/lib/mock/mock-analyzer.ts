import type { ProductAiAnalysis } from '@minimalblock/core';

export function getMockAnalysis(scenario: 'failed' | 'success' | 'warning'): ProductAiAnalysis {
  if (scenario === 'failed') {
    return {
      categorySuggestion: 'electronics',
      detectedCategory: 'electronics',
      expectedCategory: 'electronics',
      materials: ['plastic', 'aluminum', 'rubber keyboard'],
      confidenceScore: 0.23,
      readinessScore: 22,
      visualMatchScore: 18,
      commerceReadinessScore: 15,
      finalQualityScore: 22,
      conversionResult: 'fail',
      missingVisuals: ['keyboard detail', 'side profile', 'hinge area'],
      blockingReasons: [
        '3D model does not preserve laptop silhouette',
        'Critical product parts missing from generated model',
        'Model geometry is too simplified for commercial use',
      ],
      missingParts: ['keyboard', 'trackpad', 'hinge', 'screen panel detail'],
      sellerExplanation:
        "The 3D model doesn't look like your laptop photos. Key parts like the keyboard, trackpad, and hinge are missing or oversimplified. Buyers will immediately notice the mismatch — this will increase returns and hurt your listing. Re-upload with clearer photos from at least 4 angles before trying again.",
      suggestedCopy: {
        seoTitle: 'Laptop Computer | High Performance',
        bullets: [
          'High-performance processor for fast multitasking',
          'Long battery life for all-day productivity',
          'Lightweight design for easy portability',
        ],
        description: 'A high-performance laptop designed for productivity and portability.',
      },
      returnRiskFactors: [
        {
          risk: 'Keyboard and trackpad not visible in 3D model',
          fix: 'Regenerate model with higher-detail source images showing keyboard layout clearly',
        },
        {
          risk: '3D silhouette does not match product shape',
          fix: 'Upload a manual GLB or provide side-profile and overhead shots for regeneration',
        },
      ],
      qualityRecommendations: [
        'Use manual GLB upload as a fallback for complex electronics',
        'Regenerate with stricter constraints and more image angles',
        'Upload detailed photos showing keyboard, hinge, and ports',
        'Remove invalid auto-generated hotspots that point to empty areas',
      ],
      merchantRecommendations: [
        'Do not publish this product until the 3D model is corrected',
        'Consider replacing with a manufacturer-supplied GLB file',
      ],
      analysisVersion: '1.0',
      lastUpdatedAt: new Date().toISOString(),
      analysisHistory: [],
    };
  }

  if (scenario === 'warning') {
    return {
      categorySuggestion: 'home-decor',
      detectedCategory: 'home-decor',
      expectedCategory: 'home-decor',
      materials: ['marble', 'brushed brass', 'fabric shade'],
      confidenceScore: 0.62,
      readinessScore: 58,
      visualMatchScore: 61,
      commerceReadinessScore: 54,
      finalQualityScore: 58,
      conversionResult: 'warning',
      missingVisuals: ['close-up of marble base', 'lamp head adjustment range'],
      blockingReasons: [],
      missingParts: ['adjustable arm detail', 'base connection point'],
      sellerExplanation:
        'The 3D model captures the general shape of the arc lamp, but the marble base texture and arm adjustment range are not faithfully reproduced. This may confuse buyers about the marble pattern variation. Fix the flagged issues or provide an override reason to approve anyway.',
      suggestedCopy: {
        seoTitle: 'Modern Arc Floor Lamp with Marble Base | Adjustable',
        bullets: [
          'Natural marble base provides stable, elegant foundation',
          'Adjustable arc head positions light exactly where needed',
          'Compatible with standard E27 bulbs up to 60W',
        ],
        description:
          'A sculptural arc lamp that doubles as a statement piece — the marble base grounds the space while the fabric shade diffuses warm light.',
      },
      returnRiskFactors: [
        {
          risk: 'Marble pattern variation not communicated',
          fix: 'Add a disclaimer and multiple base photos showing variation',
        },
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
      analysisVersion: '1.0',
      lastUpdatedAt: new Date().toISOString(),
      analysisHistory: [
        {
          timestamp: new Date(Date.now() - 3_600_000).toISOString(),
          version: '1.0',
          readinessScore: 44,
          visualMatchScore: 48,
          commerceReadinessScore: 41,
          finalQualityScore: 44,
        },
      ],
    };
  }

  // scenario === 'success'
  return {
    categorySuggestion: 'bags',
    detectedCategory: 'bags',
    expectedCategory: 'bags',
    materials: ['full-grain leather', 'brass hardware', 'cotton lining'],
    confidenceScore: 0.94,
    readinessScore: 91,
    visualMatchScore: 89,
    commerceReadinessScore: 93,
    finalQualityScore: 91,
    conversionResult: 'pass',
    missingVisuals: [],
    blockingReasons: [],
    missingParts: [],
    sellerExplanation:
      'The 3D model closely matches your source images. All major product details — leather grain, brass hardware, and stitching — are faithfully reproduced. This product is ready for merchant review and publishing.',
    suggestedCopy: {
      seoTitle: 'Italian Full-Grain Leather Tote Bag | Handcrafted',
      bullets: [
        'Full-grain Italian leather that develops a rich patina over time',
        'Spacious interior fits a 13" laptop with room to spare',
        'Solid brass hardware for lifetime durability',
      ],
      description:
        'A timeless tote handcrafted by Italian artisans from premium full-grain leather — built to last decades.',
    },
    returnRiskFactors: [],
    qualityRecommendations: [
      'Consider adding an interior organization shot to highlight pocket layout',
    ],
    merchantRecommendations: [
      'Emphasize the patina development story in the product description',
      'Cross-sell with the matching wallet and cardholders',
    ],
    analysisVersion: '1.0',
    lastUpdatedAt: new Date().toISOString(),
    analysisHistory: [
      {
        timestamp: new Date(Date.now() - 7_200_000).toISOString(),
        version: '1.0',
        readinessScore: 74,
        visualMatchScore: 71,
        commerceReadinessScore: 78,
        finalQualityScore: 74,
      },
    ],
  };
}
