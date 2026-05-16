export type ProductCategory = 'house' | 'furniture' | 'vehicle' | 'appliance' | 'other';

export interface Hotspot {
  id: string;
  label: string;
  position: string;
  normal: string;
}

export interface AiInsight {
  risk: string;
  recommendation: string;
}

export interface ProductProps {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  ownerId: string;
  hotspots: Hotspot[];
  aiInsights?: AiInsight[];
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: ProductCategory;
  readonly ownerId: string;
  readonly hotspots: Hotspot[];
  readonly aiInsights: AiInsight[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: ProductProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.category = props.category;
    this.ownerId = props.ownerId;
    this.hotspots = props.hotspots;
    this.aiInsights = props.aiInsights ?? [];
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isOwnedBy(userId: string): boolean {
    return this.ownerId === userId;
  }

  withUpdatedName(name: string): Product {
    return new Product({ ...this, name, updatedAt: new Date() });
  }

  withUpdatedHotspots(hotspots: Hotspot[]): Product {
    return new Product({ ...this, hotspots, updatedAt: new Date() });
  }

  withAiInsights(aiInsights: AiInsight[]): Product {
    return new Product({ ...this, aiInsights, updatedAt: new Date() });
  }
}
