import { generateId } from '../../utils/id-generator.js';
import { ProductWorkflowStatus, type ProductWorkflowStatusValue } from '../value-objects/product-workflow-status.vo.js';

export type ProductCategory = 'furniture' | 'home-decor' | 'bags' | 'accessories' | 'electronics' | 'other';
export type SuggestedHotspotType = 'material' | 'dimension' | 'feature' | 'warning' | 'assembly';
export type SuggestedHotspotStatus = 'pending' | 'accepted' | 'rejected';

export interface Hotspot {
  id: string;
  label: string;
  description?: string;
  type?: SuggestedHotspotType;
  position?: string;
  normal?: string;
}

export interface SuggestedHotspot {
  id: string;
  title: string;
  description: string;
  type: SuggestedHotspotType;
  status: SuggestedHotspotStatus;
  acceptedHotspotId?: string;
}

export interface ProductAiCopy {
  seoTitle: string;
  bullets: string[];
  description: string;
}

export interface ReturnRiskFactor {
  risk: string;
  fix: string;
}

export interface ProductAiAnalysis {
  categorySuggestion?: ProductCategory;
  materials: string[];
  confidenceScore: number;
  missingVisuals: string[];
  suggestedCopy: ProductAiCopy | null;
  returnRiskFactors: ReturnRiskFactor[];
  qualityRecommendations: string[];
  merchantRecommendations: string[];
  readinessScore?: number;
  lastUpdatedAt?: string;
}

export interface ProductProps {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  ownerId: string;
  slug?: string | null;
  hotspots: Hotspot[];
  hotspotsSuggested?: SuggestedHotspot[];
  aiAnalysis?: ProductAiAnalysis | null;
  workflowStatus?: ProductWorkflowStatusValue;
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: ProductCategory;
  readonly ownerId: string;
  readonly slug: string | null;
  readonly hotspots: Hotspot[];
  readonly hotspotsSuggested: SuggestedHotspot[];
  readonly aiAnalysis: ProductAiAnalysis | null;
  readonly workflowStatus: ProductWorkflowStatusValue;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: ProductProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.category = props.category;
    this.ownerId = props.ownerId;
    this.slug = props.slug ?? null;
    this.hotspots = props.hotspots;
    this.hotspotsSuggested = props.hotspotsSuggested ?? [];
    this.aiAnalysis = props.aiAnalysis ?? null;
    this.workflowStatus = props.workflowStatus ?? 'draft';
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isOwnedBy(userId: string): boolean {
    return this.ownerId === userId;
  }

  isPublishable(): boolean {
    return ProductWorkflowStatus.from(this.workflowStatus).isPublishable();
  }

  withWorkflowStatus(s: ProductWorkflowStatusValue): Product {
    return new Product({ ...this, workflowStatus: s, updatedAt: new Date() });
  }

  get publicUrl(): string {
    return `/p/${this.slug ?? this.id}`;
  }

  withUpdatedName(name: string): Product {
    return new Product({ ...this, name, updatedAt: new Date() });
  }

  withUpdatedMeta(patch: { name?: string; description?: string; category?: ProductCategory }): Product {
    return new Product({
      ...this,
      name: patch.name ?? this.name,
      description: patch.description ?? this.description,
      category: patch.category ?? this.category,
      updatedAt: new Date(),
    });
  }

  withSlug(slug: string | null): Product {
    return new Product({ ...this, slug, updatedAt: new Date() });
  }

  withUpdatedHotspots(hotspots: Hotspot[]): Product {
    return new Product({ ...this, hotspots, updatedAt: new Date() });
  }

  withAiAnalysis(aiAnalysis: ProductAiAnalysis | null): Product {
    return new Product({ ...this, aiAnalysis, updatedAt: new Date() });
  }

  withSuggestedHotspots(hotspotsSuggested: SuggestedHotspot[]): Product {
    return new Product({ ...this, hotspotsSuggested, updatedAt: new Date() });
  }

  acceptSuggestedHotspot(suggestedHotspotId: string): Product {
    const suggestion = this.hotspotsSuggested.find((item) => item.id === suggestedHotspotId);
    if (!suggestion || suggestion.status !== 'pending') {
      return this;
    }

    const newHotspotId = generateId();
    const nextHotspots = [
      ...this.hotspots,
      {
        id: newHotspotId,
        label: suggestion.title,
        description: suggestion.description,
        type: suggestion.type,
      },
    ];

    const nextSuggestions = this.hotspotsSuggested.map((item) =>
      item.id === suggestedHotspotId
        ? { ...item, status: 'accepted' as const, acceptedHotspotId: newHotspotId }
        : item,
    );

    return new Product({
      ...this,
      hotspots: nextHotspots,
      hotspotsSuggested: nextSuggestions,
      updatedAt: new Date(),
    });
  }

  rejectSuggestedHotspot(suggestedHotspotId: string): Product {
    return new Product({
      ...this,
      hotspotsSuggested: this.hotspotsSuggested.map((item) =>
        item.id === suggestedHotspotId ? { ...item, status: 'rejected' as const } : item,
      ),
      updatedAt: new Date(),
    });
  }
}
