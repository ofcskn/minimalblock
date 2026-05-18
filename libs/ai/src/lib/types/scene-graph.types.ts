export type GeometryFamily =
  | 'hard-surface'
  | 'organic'
  | 'cloth-fabric'
  | 'cylindrical'
  | 'mechanical'
  | 'soft-body';

export type PrimitiveShape =
  | 'box'
  | 'cylinder'
  | 'sphere'
  | 'tapered-cylinder'
  | 'frustum'
  | 'wedge'
  | 'torus'
  | 'extruded-ellipse';

export interface ScenePartMaterial {
  baseColor: [number, number, number, number];
  roughness: number;
  metalness: number;
  transmissionFactor?: number;
  ior?: number;
  clearcoat?: number;
  emissiveFactor?: [number, number, number];
}

export interface ScenePartDimensions {
  width: number;
  height: number;
  depth: number;
  topWidth?: number;
  topHeight?: number;
  topDepth?: number;
  radiusTop?: number;
  radiusBottom?: number;
  tubeRadius?: number;
  majorRadius?: number;
  rx?: number;
  ry?: number;
}

export interface ScenePart {
  id: string;
  label: string;
  shape: PrimitiveShape;
  dimensions: ScenePartDimensions;
  position: [number, number, number];
  rotation: [number, number, number, number];
  material: ScenePartMaterial;
  smooth?: boolean;
  segments?: number;
  symmetryMirror?: 'x' | 'z';
}

export interface SceneGraph {
  schemaVersion: '2.0';
  productCategory: string;
  productSubtype: string;
  geometryFamily: GeometryFamily;
  symmetryAxis: 'x' | 'z' | 'none';
  boundingBox: { width: number; height: number; depth: number };
  parts: ScenePart[];
  confidence: number;
  sourceViewsUsed: string[];
  structuralWarnings: string[];
}
