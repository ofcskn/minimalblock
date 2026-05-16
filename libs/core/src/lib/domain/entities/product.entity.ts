export type ProductCategory = 'house' | 'furniture' | 'vehicle' | 'appliance' | 'other';

export interface ProductProps {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: ProductCategory;
  readonly ownerId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: ProductProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.category = props.category;
    this.ownerId = props.ownerId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isOwnedBy(userId: string): boolean {
    return this.ownerId === userId;
  }

  withUpdatedName(name: string): Product {
    return new Product({ ...this, name, updatedAt: new Date() });
  }
}
