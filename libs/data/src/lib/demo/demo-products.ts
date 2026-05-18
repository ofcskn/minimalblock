import { generateId } from '@minimalblock/core';
import type { ProductProps } from '@minimalblock/core';

export const DEMO_PRODUCT_FAILED: ProductProps = {
  id: generateId(),
  name: 'Wireless Headphones (Demo — Failed QA)',
  description: 'Over-ear wireless headphones with active noise cancellation and 30-hour battery life.',
  category: 'electronics',
  ownerId: 'demo-seller',
  slug: 'wireless-headphones-demo-failed',
  hotspots: [],
  hotspotsSuggested: [],
  workflowStatus: 'failed_qa',
  aiAnalysis: {
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
    lastUpdatedAt: '2026-05-18T08:00:00.000Z',
  },
  createdAt: new Date('2026-05-18T07:00:00.000Z'),
  updatedAt: new Date('2026-05-18T08:00:00.000Z'),
};

export const DEMO_PRODUCT_SUCCESS: ProductProps = {
  id: generateId(),
  name: 'Leather Tote Bag (Demo — Approved)',
  description: 'Full-grain leather tote bag handcrafted in Italy, with a spacious interior and magnetic closure.',
  category: 'bags',
  ownerId: 'demo-seller',
  slug: 'leather-tote-bag-demo-approved',
  hotspots: [],
  hotspotsSuggested: [],
  workflowStatus: 'approved',
  aiAnalysis: {
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
    lastUpdatedAt: '2026-05-18T09:30:00.000Z',
  },
  createdAt: new Date('2026-05-18T09:00:00.000Z'),
  updatedAt: new Date('2026-05-18T09:30:00.000Z'),
};

export const DEMO_PRODUCT_WARNING: ProductProps = {
  id: generateId(),
  name: 'Modern Floor Lamp (Demo — Needs Fix)',
  description: 'Minimalist arc floor lamp with a marble base and adjustable head, suitable for reading and ambient lighting.',
  category: 'home-decor',
  ownerId: 'demo-seller',
  slug: 'modern-floor-lamp-demo-needs-fix',
  hotspots: [],
  hotspotsSuggested: [],
  workflowStatus: 'needs_fix',
  aiAnalysis: {
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
      description: 'A sculptural arc lamp that doubles as a statement piece — the marble base grounds the space while the fabric shade diffuses warm, inviting light.',
    },
    returnRiskFactors: [
      { risk: 'Marble pattern variation not communicated — customers may expect identical veining', fix: 'Add a disclaimer and multiple base photos showing variation' },
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
    lastUpdatedAt: '2026-05-18T10:15:00.000Z',
  },
  createdAt: new Date('2026-05-18T10:00:00.000Z'),
  updatedAt: new Date('2026-05-18T10:15:00.000Z'),
};
