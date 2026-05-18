import type { GeometryFamily, PrimitiveShape } from './scene-graph.types.js';

export interface ProductStructuralPart {
  partId: string;
  label: string;
  geometryHint: PrimitiveShape;
  relativeSize: 'dominant' | 'large' | 'medium' | 'small' | 'detail';
  relativePosition: string;
  material: string;
  isVisible: boolean;
  symmetricCounterpart?: string;
}

export interface ProductUnderstanding {
  detectedCategory: string;
  detectedSubtype: string;
  geometryFamily: GeometryFamily;
  structuralParts: ProductStructuralPart[];
  symmetryAxis: 'x' | 'z' | 'none';
  estimatedBoundingBox: { width: number; height: number; depth: number };
  viewAnglesDetected: string[];
  confidence: number;
  structuralWarnings: string[];
}

export interface GeometryIntelligence {
  geometryFamily: GeometryFamily;
  recommendedSegments: Record<string, number>;
  smoothShadingParts: string[];
  hardEdgeParts: string[];
  criticalTopologyNotes: string[];
}

export interface ScaleBounds {
  widthM: { min: number; best: number; max: number };
  heightM: { min: number; best: number; max: number };
  depthM: { min: number; best: number; max: number };
  confidence: 'high' | 'medium' | 'low';
  referenceSource: 'declared-dimensions' | 'category-knowledge' | 'visual-estimate';
}

export interface PbrMaterialEntry {
  partId: string;
  baseColor: [number, number, number, number];
  roughness: number;
  metalness: number;
  transmissionFactor?: number;
  ior?: number;
  clearcoat?: number;
  emissiveFactor?: [number, number, number];
  dominantMaterial: string;
}

export interface PbrMaterialMap {
  parts: PbrMaterialEntry[];
}

export interface ProductUnderstandingInput {
  productCategory: string;
  productTitle?: string;
  productDimensions?: string;
  inferredMaterial?: string;
}
