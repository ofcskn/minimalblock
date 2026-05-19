export interface BrandLogoData {
  id: string;
  brandId: string;
  ownerId: string;
  storageKey: string;
  publicUrl: string;
  name: string;
  ordinal: number;
  createdAt: Date;
}

export interface BrandColorData {
  id: string;
  brandId: string;
  ownerId: string;
  hex: string;
  name: string;
  ordinal: number;
  createdAt: Date;
}

export interface BrandData {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  website: string;
  logos: BrandLogoData[];
  colors: BrandColorData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IBrandRepository {
  findByOwnerId(ownerId: string): Promise<BrandData | null>;
  upsert(data: { ownerId: string; name: string; description: string; website: string }): Promise<BrandData>;
  saveLogo(
    brandId: string,
    ownerId: string,
    logo: { storageKey: string; publicUrl: string; name: string; ordinal: number },
  ): Promise<BrandLogoData>;
  removeLogo(id: string, ownerId: string): Promise<void>;
  saveColor(
    brandId: string,
    ownerId: string,
    color: { hex: string; name: string; ordinal: number },
  ): Promise<BrandColorData>;
  removeColor(id: string, ownerId: string): Promise<void>;
}
