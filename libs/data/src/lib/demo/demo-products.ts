import type { ProductProps, SourceImageEntry } from '@minimalblock/core';

const DEMO_ASSET_BASE = 'https://images.unsplash.com/photo';

function demoEntry(
  storageKey: string,
  viewLabel: SourceImageEntry['viewLabel'],
  warnings: SourceImageEntry['warnings'] = [],
  sizeBytes = 220_000,
): SourceImageEntry {
  return {
    storageKey,
    url: `${DEMO_ASSET_BASE}-placeholder/${storageKey}`,
    sizeBytes,
    viewLabel,
    warnings,
  };
}

export const DEMO_PRODUCT_FAILED: ProductProps = {
  id: 'demo-failed-0001-0000-0000-000000000001',
  name: 'Wireless Headphones (Demo — Failed QA)',
  description: 'Over-ear wireless headphones with active noise cancellation and 30-hour battery life.',
  category: 'electronics',
  ownerId: 'demo-seller',
  slug: 'wireless-headphones-demo-failed',
  hotspots: [
    { id: 'demo-hs-0001', label: '', type: 'feature', approved: false },
    { id: 'demo-hs-0002', label: 'test', description: 'test', type: undefined, position: '0.1 0.2 0.3', normal: '0 1 0', approved: false },
    { id: 'demo-hs-0003', label: 'hotspot', description: 'click here', type: undefined, approved: false },
  ],
  hotspotsSuggested: [
    { id: 'demo-hs-0004', title: 'ANC Microphone Array', description: 'Four-microphone setup actively cancels ambient noise for immersive listening.', type: 'feature', status: 'pending' },
    { id: 'demo-hs-0005', title: 'USB-C Charging Port', description: 'Universal USB-C port supports 30-minute fast-charge for 10 hours of playback.', type: 'feature', status: 'pending' },
  ],
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
    sourceImageEntries: [
      demoEntry('demo/headphones-image001.jpg', 'unknown', ['angle_unclear'], 28_000),
      demoEntry('demo/headphones-image002.jpg', 'unknown', ['low_resolution', 'likely_duplicate'], 31_000),
    ],
  },
  createdAt: new Date('2026-05-18T07:00:00.000Z'),
  updatedAt: new Date('2026-05-18T08:00:00.000Z'),
};

export const DEMO_PRODUCT_SUCCESS: ProductProps = {
  id: 'demo-success-0002-0000-0000-000000000002',
  name: 'Leather Tote Bag (Demo — Approved)',
  description: 'Full-grain leather tote bag handcrafted in Italy, with a spacious interior and magnetic closure.',
  category: 'bags',
  ownerId: 'demo-seller',
  slug: 'leather-tote-bag-demo-approved',
  hotspots: [
    {
      id: 'demo-hs-0010',
      label: 'Full-Grain Italian Leather',
      description: 'Sourced from Tuscan tanneries — develops a rich patina with age and daily use.',
      type: 'material',
      position: '0.0500 0.1200 0.2300',
      normal: '0 0 1',
      approved: true,
    },
    {
      id: 'demo-hs-0011',
      label: 'Solid Brass Hardware',
      description: 'Solid brass D-rings and clasps resist tarnish and outlast the bag itself.',
      type: 'material',
      position: '-0.0300 0.0800 0.2800',
      normal: '0 0 1',
      approved: true,
    },
    {
      id: 'demo-hs-0012',
      label: 'Magnetic Closure',
      description: 'Strong neodymium magnet keeps the bag securely shut without slowing you down.',
      type: 'feature',
      position: '0.0000 0.2100 0.1500',
      normal: '0 1 0',
      approved: true,
    },
    {
      id: 'demo-hs-0013',
      label: 'Interior Width — 34 cm',
      description: 'Wide enough for a 13″ laptop, A4 documents, and daily essentials side by side.',
      type: 'dimension',
      position: '0.0200 0.0500 0.1800',
      normal: '1 0 0',
      approved: true,
    },
  ],
  hotspotsSuggested: [
    { id: 'demo-hs-0014', title: 'Cotton Canvas Lining', description: 'Woven cotton lining protects contents and resists tearing under heavy loads.', type: 'material', status: 'accepted' },
    { id: 'demo-hs-0015', title: 'Open Slip Pocket', description: 'External slip pocket fits a phone or transit card for quick access.', type: 'feature', status: 'accepted' },
  ],
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
    sourceImageEntries: [
      demoEntry('demo/tote-front.jpg', 'front', []),
      demoEntry('demo/tote-back.jpg', 'back', []),
      demoEntry('demo/tote-detail.jpg', 'detail', []),
      demoEntry('demo/tote-scale.jpg', 'scale', []),
    ],
  },
  createdAt: new Date('2026-05-18T09:00:00.000Z'),
  updatedAt: new Date('2026-05-18T09:30:00.000Z'),
};

export const DEMO_PRODUCT_MANUAL_FALLBACK: ProductProps = {
  id: 'demo-manual-0003-0000-0000-000000000003',
  name: 'Ceramic Vase — Manual 3D Fallback (Demo)',
  description: 'Hand-thrown ceramic vase with a matte glaze finish. 3D model uploaded manually as a fallback because AI generation produced unusable geometry.',
  category: 'home-decor',
  ownerId: 'demo-seller',
  slug: 'ceramic-vase-demo-manual-fallback',
  hotspots: [
    {
      id: 'demo-hs-0020',
      label: 'Matte Glaze Finish',
      description: 'Hand-applied matte glaze fired at 1260 °C — smooth to the touch and dishwasher-safe.',
      type: 'material',
      position: '0.0000 0.1500 0.1500',
      normal: '0 0 1',
      approved: false,
    },
    {
      id: 'demo-hs-0021',
      label: 'Watertight Interior',
      description: 'Non-porous interior suitable for fresh flowers with water or dried arrangements.',
      type: 'feature',
      position: '0.0000 0.2200 0.0500',
      normal: '0 1 0',
      approved: false,
    },
  ],
  hotspotsSuggested: [
    { id: 'demo-hs-0022', title: 'Artisan Maker Mark', description: 'Hand-incised maker mark on the base identifies the individual potter who threw this piece.', type: 'feature', status: 'pending' },
  ],
  workflowStatus: 'ready_for_review',
  aiAnalysis: {
    categorySuggestion: 'home-decor',
    materials: ['ceramic', 'matte glaze'],
    confidenceScore: 0.78,
    readinessScore: 74,
    missingVisuals: ['bottom view'],
    suggestedCopy: {
      seoTitle: 'Hand-Thrown Ceramic Vase | Matte Glaze Finish',
      bullets: [
        'Hand-thrown by artisan potters — no two pieces are identical',
        'Matte glaze finish that pairs with any interior style',
        'Watertight interior suitable for fresh or dried flowers',
      ],
      description: 'A minimalist ceramic vase that brings organic texture to any shelf or table. Handcrafted in small batches.',
    },
    returnRiskFactors: [
      { risk: 'Glaze colour may appear slightly different across devices', fix: 'Add a colour-accurate swatch to the listing images' },
    ],
    qualityRecommendations: [
      'Add a scale reference photo showing the vase next to a common object',
      'Capture the bottom mark/signature if present',
    ],
    merchantRecommendations: [
      'Emphasise the handmade, one-of-a-kind nature in copy',
      'Group with matching ceramic items for a collection cross-sell',
    ],
    lastUpdatedAt: '2026-05-18T11:00:00.000Z',
    sourceImageEntries: [
      demoEntry('demo/vase-front.jpg', 'front', []),
      demoEntry('demo/vase-side.jpg', 'right', []),
      demoEntry('demo/vase-top.jpg', 'top', ['low_resolution'], 30_000),
    ],
  },
  createdAt: new Date('2026-05-18T11:00:00.000Z'),
  updatedAt: new Date('2026-05-18T11:10:00.000Z'),
};

export const DEMO_PRODUCT_WARNING: ProductProps = {
  id: 'demo-warning-0004-0000-0000-000000000004',
  name: 'Modern Floor Lamp (Demo — Needs Fix)',
  description: 'Minimalist arc floor lamp with a marble base and adjustable head, suitable for reading and ambient lighting.',
  category: 'home-decor',
  ownerId: 'demo-seller',
  slug: 'modern-floor-lamp-demo-needs-fix',
  hotspots: [
    {
      id: 'demo-hs-0030',
      label: 'Natural Marble Base',
      description: 'Solid Carrara marble base weighs 4 kg — keeps the 180 cm arc stable without wall anchoring.',
      type: 'material',
      position: '0.0000 -0.0500 0.1200',
      normal: '0 -1 0',
      approved: true,
    },
    {
      id: 'demo-hs-0031',
      label: 'Adjustable Arc Head',
      description: undefined,
      type: undefined,
      position: '0.1000 0.3500 0.0800',
      normal: '0 0 1',
      approved: false,
    },
    {
      id: 'demo-hs-0032',
      label: 'E27 Bulb Socket',
      description: 'Compatible with standard E27 bulbs up to 60 W, including Edison-style filament bulbs.',
      type: 'assembly',
      position: '0.0800 0.4000 0.0500',
      normal: '0 1 0',
      approved: false,
    },
  ],
  hotspotsSuggested: [
    { id: 'demo-hs-0033', title: 'Fabric Drum Shade', description: 'Linen drum shade diffuses warm light and reduces glare for reading.', type: 'feature', status: 'pending' },
    { id: 'demo-hs-0034', title: 'Touch-Dimmer Switch', description: 'Inline touch dimmer on the cord provides three brightness levels.', type: 'feature', status: 'rejected' },
  ],
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
    sourceImageEntries: [
      demoEntry('demo/lamp-front.jpg', 'front', ['background_inconsistent']),
      demoEntry('demo/lamp-side.jpg', 'unknown', ['angle_unclear']),
      demoEntry('demo/lamp-top.jpg', 'top', ['low_resolution'], 38_000),
    ],
  },
  createdAt: new Date('2026-05-18T10:00:00.000Z'),
  updatedAt: new Date('2026-05-18T10:15:00.000Z'),
};
