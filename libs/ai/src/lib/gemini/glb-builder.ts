import type { SceneGraph, ScenePart } from '../types/scene-graph.types.js';

export interface ShapeParams {
  shape: 'box' | 'cylinder' | 'sphere';
  width: number;
  height: number;
  depth: number;
  baseColor: [number, number, number, number];
  roughness: number;
  metalness: number;
}

export interface PartDef {
  shape: 'box' | 'cylinder' | 'sphere' | 'tapered-cylinder' | 'frustum' | 'wedge' | 'torus' | 'extruded-ellipse';
  width: number;
  height: number;
  depth: number;
  baseColor: [number, number, number, number];
  roughness: number;
  metalness: number;
  translation?: [number, number, number];
  /** Rotation as quaternion [x, y, z, w] in glTF convention. */
  quaternion?: [number, number, number, number];
  description?: string;
  /** Frustum: top face dimensions (defaults to width/depth if omitted). */
  topWidth?: number;
  topDepth?: number;
  /** Tapered cylinder: overrides computed radii. */
  radiusBottom?: number;
  radiusTop?: number;
  /** Torus: tube radius. width/2 = major radius. */
  tubeRadius?: number;
  /** Extruded ellipse: Y semi-axis. height = X semi-axis, depth = extrusion length. */
  ry?: number;
  /** Tessellation override (segments for cylinder/torus/ellipse). */
  segments?: number;
  /** Smooth shading — average normals at shared vertices. */
  smooth?: boolean;
  /** Transmission factor for glass-like materials (0–1). */
  transmissionFactor?: number;
  emissiveFactor?: [number, number, number];
}

interface Geometry {
  positions: number[];
  normals: number[];
  uvs: number[];
  indices: number[];
}

// ─── Geometry builders ────────────────────────────────────────────────────────

function buildBoxGeometry(w: number, h: number, d: number): Geometry {
  const hw = w / 2, hh = h / 2, hd = d / 2;
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const faces = [
    { n: [1, 0, 0],  v: [[hw,-hh,-hd],[hw,-hh,hd],[hw,hh,hd],[hw,hh,-hd]] },
    { n: [-1, 0, 0], v: [[-hw,-hh,hd],[-hw,-hh,-hd],[-hw,hh,-hd],[-hw,hh,hd]] },
    { n: [0, 1, 0],  v: [[-hw,hh,hd],[hw,hh,hd],[hw,hh,-hd],[-hw,hh,-hd]] },
    { n: [0, -1, 0], v: [[-hw,-hh,-hd],[hw,-hh,-hd],[hw,-hh,hd],[-hw,-hh,hd]] },
    { n: [0, 0, 1],  v: [[-hw,-hh,hd],[hw,-hh,hd],[hw,hh,hd],[-hw,hh,hd]] },
    { n: [0, 0, -1], v: [[hw,-hh,-hd],[-hw,-hh,-hd],[-hw,hh,-hd],[hw,hh,-hd]] },
  ];
  const faceUvs = [[0,0],[1,0],[1,1],[0,1]];

  for (let fi = 0; fi < faces.length; fi++) {
    const { n, v } = faces[fi];
    const base = fi * 4;
    for (let vi = 0; vi < 4; vi++) {
      positions.push(v[vi][0], v[vi][1], v[vi][2]);
      normals.push(n[0], n[1], n[2]);
      uvs.push(faceUvs[vi][0], faceUvs[vi][1]);
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  return { positions, normals, uvs, indices };
}

function buildCylinderGeometry(diameter: number, h: number, segments = 16): Geometry {
  const r = diameter / 2;
  const hh = h / 2;
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < segments; i++) {
    const t0 = (i / segments) * 2 * Math.PI;
    const t1 = ((i + 1) / segments) * 2 * Math.PI;
    const x0 = Math.cos(t0), z0 = Math.sin(t0);
    const x1 = Math.cos(t1), z1 = Math.sin(t1);
    const base = positions.length / 3;
    positions.push(r*x0,-hh,r*z0, r*x1,-hh,r*z1, r*x1,hh,r*z1, r*x0,hh,r*z0);
    normals.push(x0,0,z0, x1,0,z1, x1,0,z1, x0,0,z0);
    uvs.push(i/segments,1, (i+1)/segments,1, (i+1)/segments,0, i/segments,0);
    indices.push(base, base+1, base+2, base, base+2, base+3);
  }

  const topCenter = positions.length / 3;
  positions.push(0, hh, 0); normals.push(0,1,0); uvs.push(0.5,0.5);
  for (let i = 0; i < segments; i++) {
    const t0 = (i / segments) * 2 * Math.PI, t1 = ((i+1) / segments) * 2 * Math.PI;
    const base = positions.length / 3;
    positions.push(r*Math.cos(t0),hh,r*Math.sin(t0), r*Math.cos(t1),hh,r*Math.sin(t1));
    normals.push(0,1,0, 0,1,0);
    uvs.push(Math.cos(t0)*.5+.5,Math.sin(t0)*.5+.5, Math.cos(t1)*.5+.5,Math.sin(t1)*.5+.5);
    indices.push(topCenter, base+1, base);
  }

  const botCenter = positions.length / 3;
  positions.push(0,-hh,0); normals.push(0,-1,0); uvs.push(0.5,0.5);
  for (let i = 0; i < segments; i++) {
    const t0 = (i / segments) * 2 * Math.PI, t1 = ((i+1) / segments) * 2 * Math.PI;
    const base = positions.length / 3;
    positions.push(r*Math.cos(t0),-hh,r*Math.sin(t0), r*Math.cos(t1),-hh,r*Math.sin(t1));
    normals.push(0,-1,0, 0,-1,0);
    uvs.push(Math.cos(t0)*.5+.5,Math.sin(t0)*.5+.5, Math.cos(t1)*.5+.5,Math.sin(t1)*.5+.5);
    indices.push(botCenter, base, base+1);
  }
  return { positions, normals, uvs, indices };
}

function buildSphereGeometry(diameter: number, lat = 12, lon = 16): Geometry {
  const r = diameter / 2;
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= lat; i++) {
    const phi = (i / lat) * Math.PI;
    for (let j = 0; j <= lon; j++) {
      const theta = (j / lon) * 2 * Math.PI;
      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.cos(phi);
      const z = Math.sin(phi) * Math.sin(theta);
      positions.push(r*x, r*y, r*z);
      normals.push(x, y, z);
      uvs.push(j/lon, i/lat);
    }
  }
  for (let i = 0; i < lat; i++) {
    for (let j = 0; j < lon; j++) {
      const a = i*(lon+1)+j, b = a+lon+1;
      indices.push(a, b, a+1, b, b+1, a+1);
    }
  }
  return { positions, normals, uvs, indices };
}

// ─── Vector helpers ───────────────────────────────────────────────────────────

function v3cross(a: [number,number,number], b: [number,number,number]): [number,number,number] {
  return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
}

function v3norm(v: [number,number,number]): [number,number,number] {
  const len = Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]) || 1;
  return [v[0]/len, v[1]/len, v[2]/len];
}

function faceNormal(p0: number[], p1: number[], p2: number[]): [number,number,number] {
  const a: [number,number,number] = [p1[0]-p0[0], p1[1]-p0[1], p1[2]-p0[2]];
  const b: [number,number,number] = [p2[0]-p0[0], p2[1]-p0[1], p2[2]-p0[2]];
  return v3norm(v3cross(a, b));
}

// ─── New geometry builders ────────────────────────────────────────────────────

/**
 * Frustum (truncated pyramid): bottom is w×d, top is topW×topD, height is h.
 * All geometry centered at origin (Y: -h/2 to +h/2).
 */
function buildFrustumGeometry(w: number, h: number, d: number, topW: number, topD: number): Geometry {
  const hw = w/2, hh = h/2, hd = d/2;
  const tw = topW/2, td = topD/2;
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  function addQuad(p0: number[], p1: number[], p2: number[], p3: number[], u0=0, u1=1) {
    const n = faceNormal(p0, p1, p2);
    const base = positions.length / 3;
    for (const p of [p0, p1, p2, p3]) positions.push(p[0], p[1], p[2]);
    for (let i = 0; i < 4; i++) normals.push(n[0], n[1], n[2]);
    uvs.push(u0,0, u1,0, u1,1, u0,1);
    indices.push(base, base+1, base+2, base, base+2, base+3);
  }

  // Bottom face (normal down)
  addQuad([-hw,-hh,-hd],[hw,-hh,-hd],[hw,-hh,hd],[-hw,-hh,hd]);
  // Top face (normal up)
  addQuad([-tw,hh,-td],[hw>tw?tw:tw,hh,-td],[tw,hh,td],[-tw,hh,td]);
  const topFaceN = faceNormal([-tw,hh,-td],[tw,hh,-td],[tw,hh,td]);
  // Fix top face normal to always point up
  const lastBase = (positions.length / 3) - 4;
  for (let i = 0; i < 4; i++) { normals[lastBase*3+i*3] = 0; normals[lastBase*3+i*3+1] = 1; normals[lastBase*3+i*3+2] = 0; }
  void topFaceN;
  // Front face (+Z)
  addQuad([-hw,-hh,hd],[hw,-hh,hd],[tw,hh,td],[-tw,hh,td]);
  // Back face (-Z)
  addQuad([hw,-hh,-hd],[-hw,-hh,-hd],[-tw,hh,-td],[tw,hh,-td]);
  // Right face (+X)
  addQuad([hw,-hh,hd],[hw,-hh,-hd],[tw,hh,-td],[tw,hh,td]);
  // Left face (-X)
  addQuad([-hw,-hh,-hd],[-hw,-hh,hd],[-tw,hh,td],[-tw,hh,-td]);

  return { positions, normals, uvs, indices };
}

/**
 * Tapered cylinder: rBottom at bottom, rTop at top.
 * Centered at origin. Height along Y.
 */
function buildTaperedCylinderGeometry(rBottom: number, rTop: number, h: number, segments = 20): Geometry {
  const hh = h / 2;
  const dr = rTop - rBottom;
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Side
  for (let i = 0; i < segments; i++) {
    const t0 = (i / segments) * 2 * Math.PI;
    const t1 = ((i+1) / segments) * 2 * Math.PI;
    const c0 = Math.cos(t0), s0 = Math.sin(t0);
    const c1 = Math.cos(t1), s1 = Math.sin(t1);
    // Normals: outward and tilted based on taper (N = normalize(h*cosθ, -dr, h*sinθ))
    const sn0 = v3norm([h*c0, -dr, h*s0]);
    const sn1 = v3norm([h*c1, -dr, h*s1]);
    const base = positions.length / 3;
    positions.push(rBottom*c0,-hh,rBottom*s0, rBottom*c1,-hh,rBottom*s1, rTop*c1,hh,rTop*s1, rTop*c0,hh,rTop*s0);
    normals.push(sn0[0],sn0[1],sn0[2], sn1[0],sn1[1],sn1[2], sn1[0],sn1[1],sn1[2], sn0[0],sn0[1],sn0[2]);
    uvs.push(i/segments,0, (i+1)/segments,0, (i+1)/segments,1, i/segments,1);
    indices.push(base, base+1, base+2, base, base+2, base+3);
  }

  // Top cap
  if (rTop > 0.0001) {
    const topCenter = positions.length / 3;
    positions.push(0, hh, 0); normals.push(0,1,0); uvs.push(0.5,0.5);
    for (let i = 0; i < segments; i++) {
      const t0 = (i/segments)*2*Math.PI, t1 = ((i+1)/segments)*2*Math.PI;
      const base = positions.length / 3;
      positions.push(rTop*Math.cos(t0),hh,rTop*Math.sin(t0), rTop*Math.cos(t1),hh,rTop*Math.sin(t1));
      normals.push(0,1,0, 0,1,0);
      uvs.push(Math.cos(t0)*.5+.5,Math.sin(t0)*.5+.5, Math.cos(t1)*.5+.5,Math.sin(t1)*.5+.5);
      indices.push(topCenter, base+1, base);
    }
  }

  // Bottom cap
  if (rBottom > 0.0001) {
    const botCenter = positions.length / 3;
    positions.push(0, -hh, 0); normals.push(0,-1,0); uvs.push(0.5,0.5);
    for (let i = 0; i < segments; i++) {
      const t0 = (i/segments)*2*Math.PI, t1 = ((i+1)/segments)*2*Math.PI;
      const base = positions.length / 3;
      positions.push(rBottom*Math.cos(t0),-hh,rBottom*Math.sin(t0), rBottom*Math.cos(t1),-hh,rBottom*Math.sin(t1));
      normals.push(0,-1,0, 0,-1,0);
      uvs.push(Math.cos(t0)*.5+.5,Math.sin(t0)*.5+.5, Math.cos(t1)*.5+.5,Math.sin(t1)*.5+.5);
      indices.push(botCenter, base, base+1);
    }
  }

  return { positions, normals, uvs, indices };
}

/**
 * Torus: major circle in the XZ plane (Y-up).
 * majorRadius = distance from center to tube center; tubeRadius = tube cross-section radius.
 */
function buildTorusGeometry(majorRadius: number, tubeRadius: number, majorSegments = 24, tubeSegments = 12): Geometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= majorSegments; i++) {
    const theta = (i / majorSegments) * 2 * Math.PI;
    const cosT = Math.cos(theta), sinT = Math.sin(theta);
    for (let j = 0; j <= tubeSegments; j++) {
      const phi = (j / tubeSegments) * 2 * Math.PI;
      const cosP = Math.cos(phi), sinP = Math.sin(phi);
      const x = (majorRadius + tubeRadius * cosP) * cosT;
      const y = tubeRadius * sinP;
      const z = (majorRadius + tubeRadius * cosP) * sinT;
      positions.push(x, y, z);
      // Outward normal from tube center
      normals.push(cosP * cosT, sinP, cosP * sinT);
      uvs.push(i / majorSegments, j / tubeSegments);
    }
  }

  const stride = tubeSegments + 1;
  for (let i = 0; i < majorSegments; i++) {
    for (let j = 0; j < tubeSegments; j++) {
      const a = i * stride + j;
      const b = (i + 1) * stride + j;
      indices.push(a, b, b+1, a, b+1, a+1);
    }
  }

  return { positions, normals, uvs, indices };
}

/**
 * Extruded ellipse: ellipse with X semi-axis rx and Y semi-axis ry, extruded along Z by depth.
 * Centered at origin.
 */
function buildExtrudedEllipseGeometry(rx: number, ry: number, depth: number, segments = 24): Geometry {
  const hd = depth / 2;
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Side
  for (let i = 0; i < segments; i++) {
    const t0 = (i / segments) * 2 * Math.PI;
    const t1 = ((i+1) / segments) * 2 * Math.PI;
    const x0 = rx*Math.cos(t0), y0 = ry*Math.sin(t0);
    const x1 = rx*Math.cos(t1), y1 = ry*Math.sin(t1);
    // Ellipse outward normal: (y/rx², x/ry²)... wait: d/dθ of (rx*cosθ, ry*sinθ) is (-rx*sinθ, ry*cosθ)
    // Normal perpendicular: (ry*cosθ, rx*sinθ) normalized  → (cosθ/rx, sinθ/ry) normalized
    const nn0 = v3norm([Math.cos(t0)/rx, Math.sin(t0)/ry, 0] as [number,number,number]);
    const nn1 = v3norm([Math.cos(t1)/rx, Math.sin(t1)/ry, 0] as [number,number,number]);
    const base = positions.length / 3;
    positions.push(x0,-hd,y0, x1,-hd,y1, x1,hd,y1, x0,hd,y0);
    normals.push(nn0[0],0,nn0[1], nn1[0],0,nn1[1], nn1[0],0,nn1[1], nn0[0],0,nn0[1]);
    uvs.push(i/segments,0, (i+1)/segments,0, (i+1)/segments,1, i/segments,1);
    indices.push(base, base+1, base+2, base, base+2, base+3);
  }

  // Front cap (+Z) — fan from center
  const frontCenter = positions.length / 3;
  positions.push(0, hd, 0); normals.push(0,0,1); uvs.push(0.5,0.5);
  for (let i = 0; i < segments; i++) {
    const t0 = (i/segments)*2*Math.PI, t1 = ((i+1)/segments)*2*Math.PI;
    const base = positions.length / 3;
    positions.push(rx*Math.cos(t0),hd,ry*Math.sin(t0), rx*Math.cos(t1),hd,ry*Math.sin(t1));
    normals.push(0,0,1, 0,0,1);
    uvs.push(Math.cos(t0)*.5+.5,Math.sin(t0)*.5+.5, Math.cos(t1)*.5+.5,Math.sin(t1)*.5+.5);
    indices.push(frontCenter, base, base+1);
  }

  // Back cap (-Z)
  const backCenter = positions.length / 3;
  positions.push(0, -hd, 0); normals.push(0,0,-1); uvs.push(0.5,0.5);
  for (let i = 0; i < segments; i++) {
    const t0 = (i/segments)*2*Math.PI, t1 = ((i+1)/segments)*2*Math.PI;
    const base = positions.length / 3;
    positions.push(rx*Math.cos(t0),-hd,ry*Math.sin(t0), rx*Math.cos(t1),-hd,ry*Math.sin(t1));
    normals.push(0,0,-1, 0,0,-1);
    uvs.push(Math.cos(t0)*.5+.5,Math.sin(t0)*.5+.5, Math.cos(t1)*.5+.5,Math.sin(t1)*.5+.5);
    indices.push(backCenter, base+1, base);
  }

  return { positions, normals, uvs, indices };
}

function buildGeometry(part: PartDef | ShapeParams): Geometry {
  const w = Math.max(part.width, 0.001);
  const h = Math.max(part.height, 0.001);
  const d = Math.max(part.depth, 0.001);
  const pd = part as PartDef;
  const segs = pd.segments;

  switch (part.shape) {
    case 'cylinder':
      return buildCylinderGeometry(w, h, segs ?? 16);
    case 'sphere':
      return buildSphereGeometry(w);
    case 'tapered-cylinder': {
      const rBot = pd.radiusBottom ?? w / 2;
      const rTop = pd.radiusTop   ?? 0;
      return buildTaperedCylinderGeometry(rBot, rTop, h, segs ?? 20);
    }
    case 'frustum': {
      const topW = pd.topWidth  ?? w * 0.6;
      const topD = pd.topDepth  ?? d * 0.6;
      return buildFrustumGeometry(w, h, d, topW, topD);
    }
    case 'wedge':
      // Wedge = frustum with zero-width top
      return buildFrustumGeometry(w, h, d, 0.001, d);
    case 'torus': {
      const maj = w / 2;
      const tube = pd.tubeRadius ?? maj * 0.35;
      return buildTorusGeometry(maj, tube, segs ?? 24, 12);
    }
    case 'extruded-ellipse': {
      const ry = pd.ry ?? h / 2;
      return buildExtrudedEllipseGeometry(w / 2, ry, d, segs ?? 24);
    }
    default:
      return buildBoxGeometry(w, h, d);
  }
}

function calcMinMax(arr: number[], stride: number): { min: number[]; max: number[] } {
  const min = Array(stride).fill(Infinity) as number[];
  const max = Array(stride).fill(-Infinity) as number[];
  for (let i = 0; i < arr.length; i++) {
    const c = i % stride;
    if (arr[i] < min[c]) min[c] = arr[i];
    if (arr[i] > max[c]) max[c] = arr[i];
  }
  return { min, max };
}

// Euler XYZ → quaternion [x, y, z, w]
function eulerToQuat(rx: number, ry: number, rz: number): [number, number, number, number] {
  const cx = Math.cos(rx/2), sx = Math.sin(rx/2);
  const cy = Math.cos(ry/2), sy = Math.sin(ry/2);
  const cz = Math.cos(rz/2), sz = Math.sin(rz/2);
  return [
    sx*cy*cz + cx*sy*sz,
    cx*sy*cz - sx*cy*sz,
    cx*cy*sz + sx*sy*cz,
    cx*cy*cz - sx*sy*sz,
  ];
}

// Shorthand: tilt around X only
const tiltX = (deg: number): [number, number, number, number] => eulerToQuat(deg * Math.PI / 180, 0, 0);
// 90° around Z (cylinder → face sideways on X axis)
const CYL_SIDEWAYS: [number, number, number, number] = [0, 0, 0.7071068, 0.7071068];

// ─── Product-type compound templates ─────────────────────────────────────────

function laptop(p: ShapeParams): PartDef[] {
  const w = Math.max(p.width, 0.25);
  const h = Math.max(p.height, 0.18);   // open height (base to top of screen)
  const d = Math.max(p.depth, 0.16);
  const c = p.baseColor;

  const baseH   = Math.min(h * 0.12, 0.024);
  const screenH = h - baseH;
  const screenD = 0.007;

  const sc: [number,number,number,number] = [c[0]*.65, c[1]*.65, c[2]*.65, 1];
  const tilt = tiltX(-20);

  const hingeY = baseH;
  const hingeZ = -d / 2;
  const sh2 = screenH / 2;
  const rad = 20 * Math.PI / 180;
  const scy = hingeY + sh2 * Math.cos(rad);
  const scz = hingeZ - sh2 * Math.sin(rad);

  return [
    { shape: 'box', width: w,        height: baseH,   depth: d,       baseColor: c,  roughness: p.roughness,       metalness: p.metalness,       translation: [0, baseH/2, 0],  description: 'keyboard base' },
    { shape: 'box', width: w * 0.97, height: screenH, depth: screenD, baseColor: sc, roughness: Math.max(0, p.roughness-.1), metalness: Math.min(1, p.metalness+.2), translation: [0, scy, scz], quaternion: tilt, description: 'screen panel' },
  ];
}

function phone(p: ShapeParams): PartDef[] {
  const w = Math.max(p.width,  0.065);
  const h = Math.max(p.height, 0.135);
  const d = Math.min(Math.max(p.depth, 0.007), 0.012);
  return [
    { shape: 'box', width: w, height: h, depth: d, baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, h/2, 0], description: 'phone body' },
  ];
}

function tablet(p: ShapeParams): PartDef[] {
  const w = Math.max(p.width,  0.17);
  const h = Math.max(p.height, 0.25);
  const d = Math.min(Math.max(p.depth, 0.006), 0.010);
  return [
    { shape: 'box', width: w, height: h, depth: d, baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, h/2, 0], description: 'tablet body' },
  ];
}

function monitor(p: ShapeParams): PartDef[] {
  const w = Math.max(p.width,  0.45);
  const h = Math.max(p.height, 0.40);
  const d = Math.max(p.depth,  0.15);

  const screenH  = h * 0.78;
  const screenD  = 0.018;
  const neckH    = h * 0.14;
  const neckDia  = w * 0.035;
  const baseW    = w * 0.38;
  const baseH    = h * 0.04;
  const baseD    = d * 0.65;
  const sc: [number,number,number,number] = [0.06, 0.06, 0.06, 1];

  return [
    { shape: 'box',      width: w,       height: screenH, depth: screenD, baseColor: sc,         roughness: 0.15, metalness: 0.5, translation: [0, baseH+neckH+screenH/2, 0], description: 'screen' },
    { shape: 'cylinder', width: neckDia, height: neckH,   depth: neckDia, baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, baseH+neckH/2, 0], description: 'stand neck' },
    { shape: 'box',      width: baseW,   height: baseH,   depth: baseD,   baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, baseH/2, 0],       description: 'stand base' },
  ];
}

function speaker(p: ShapeParams): PartDef[] {
  const w = Math.max(p.width,  0.10);
  const h = Math.max(p.height, 0.22);
  const d = Math.max(p.depth,  0.10);
  const coneR = Math.min(w, d) * 0.35;
  const coneD = 0.012;
  const sc: [number,number,number,number] = [0.1, 0.1, 0.1, 1];

  return [
    { shape: 'box',      width: w,      height: h,    depth: d,    baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, h/2, 0], description: 'cabinet' },
    { shape: 'cylinder', width: coneR*2, height: coneD, depth: coneR*2, baseColor: sc, roughness: 0.6, metalness: 0.1, translation: [0, h*.6, d/2+coneD/2], description: 'woofer cone' },
  ];
}

function headphones(p: ShapeParams): PartDef[] {
  const w  = Math.max(p.width,  0.18);
  const h  = Math.max(p.height, 0.22);
  const cd = w * 0.14; // ear cup depth (axis along X after rotation)
  const cr = w * 0.13; // ear cup radius
  const bh = h * 0.10;
  const bd = cd * 0.4;
  const cupY = h * 0.15;

  return [
    { shape: 'cylinder', width: cr*2, height: cd, depth: cr*2, baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [-(w/2-cd/2), cupY, 0], quaternion: CYL_SIDEWAYS, description: 'left ear cup' },
    { shape: 'cylinder', width: cr*2, height: cd, depth: cr*2, baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [ (w/2-cd/2), cupY, 0], quaternion: CYL_SIDEWAYS, description: 'right ear cup' },
    { shape: 'box',      width: w*.65, height: bh, depth: bd,   baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, h-bh/2, 0], description: 'headband' },
  ];
}

function chair(p: ShapeParams): PartDef[] {
  const w = Math.max(p.width,  0.48);
  const h = Math.max(p.height, 0.88);
  const d = Math.max(p.depth,  0.48);

  const seatY  = h * 0.50;
  const seatH  = h * 0.07;
  const backH  = h * 0.43;
  const backD  = seatH;
  const legDia = Math.min(w, d) * 0.06;
  const legH   = seatY - seatH / 2;

  const tilt    = tiltX(-8);
  const backCY  = seatY + seatH/2 + (backH/2)*Math.cos(8*Math.PI/180);
  const backCZ  = -d/2 + backD/2 - (backH/2)*Math.sin(8*Math.PI/180);

  const legC: [number,number,number,number] = [p.baseColor[0]*.9, p.baseColor[1]*.9, p.baseColor[2]*.9, 1];
  const lox = w/2 - legDia;
  const loz = d/2 - legDia;

  return [
    { shape: 'box', width: w,       height: seatH, depth: d,     baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, seatY, 0], description: 'seat' },
    { shape: 'box', width: w * .95, height: backH, depth: backD, baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, backCY, backCZ], quaternion: tilt, description: 'backrest' },
    ...([[-1,-1],[1,-1],[1,1],[-1,1]] as [number,number][]).map(([sx,sz],i) => ({
      shape: 'cylinder' as const, width: legDia, height: legH, depth: legDia,
      baseColor: legC, roughness: Math.min(1, p.roughness+.05), metalness: p.metalness,
      translation: [sx*lox, legH/2, sz*loz] as [number,number,number],
      description: `leg ${i+1}`,
    })),
  ];
}

function table(p: ShapeParams): PartDef[] {
  const w = Math.max(p.width,  0.60);
  const h = Math.max(p.height, 0.74);
  const d = Math.max(p.depth,  0.60);

  const topH   = Math.max(h * 0.07, 0.025);
  const legH   = h - topH;
  const legDia = Math.min(w, d) * 0.07;
  const lox    = w/2 - legDia*.7;
  const loz    = d/2 - legDia*.7;
  const legC: [number,number,number,number] = [Math.min(1,p.baseColor[0]*1.1), Math.min(1,p.baseColor[1]*1.1), Math.min(1,p.baseColor[2]*1.1), 1];

  return [
    { shape: 'box', width: w, height: topH, depth: d, baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, legH+topH/2, 0], description: 'tabletop' },
    ...([[-1,-1],[1,-1],[1,1],[-1,1]] as [number,number][]).map(([sx,sz],i) => ({
      shape: 'cylinder' as const, width: legDia, height: legH, depth: legDia,
      baseColor: legC, roughness: Math.min(1,p.roughness+.05), metalness: p.metalness,
      translation: [sx*lox, legH/2, sz*loz] as [number,number,number],
      description: `leg ${i+1}`,
    })),
  ];
}

function sofa(p: ShapeParams): PartDef[] {
  const w = Math.max(p.width,  1.80);
  const h = Math.max(p.height, 0.85);
  const d = Math.max(p.depth,  0.85);

  const armW  = w * 0.08;
  const armH  = h * 0.55;
  const seatH = h * 0.22;
  const seatY = h * 0.27;
  const backH = h * 0.48;
  const backD = d * 0.14;
  const seatD = d - backD;
  const inner = w - armW*2;
  const cush: [number,number,number,number] = [Math.min(1,p.baseColor[0]*1.04), Math.min(1,p.baseColor[1]*1.04), Math.min(1,p.baseColor[2]*1.04), 1];

  return [
    { shape: 'box', width: inner, height: seatH, depth: seatD,  baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, seatY, (d-seatD)/2],  description: 'seat cushion' },
    { shape: 'box', width: inner, height: backH, depth: backD,  baseColor: cush,        roughness: p.roughness, metalness: p.metalness, translation: [0, seatY+seatH/2+backH/2, -(d-backD)/2], description: 'backrest' },
    { shape: 'box', width: armW,  height: armH,  depth: d*.8,   baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [-(inner+armW)/2, armH/2, 0], description: 'left armrest' },
    { shape: 'box', width: armW,  height: armH,  depth: d*.8,   baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [ (inner+armW)/2, armH/2, 0], description: 'right armrest' },
  ];
}

function desk(p: ShapeParams): PartDef[] {
  // Wide table with a modesty panel / pedestal base
  const w = Math.max(p.width,  1.20);
  const h = Math.max(p.height, 0.74);
  const d = Math.max(p.depth,  0.60);

  const topH   = Math.max(h * 0.05, 0.022);
  const legH   = h - topH;
  const legDia = Math.min(w*.06, d*.1);
  const lox    = w/2 - legDia;
  const loz    = d/2 - legDia;
  const legC: [number,number,number,number] = [p.baseColor[0]*.85, p.baseColor[1]*.85, p.baseColor[2]*.85, 1];

  return [
    { shape: 'box', width: w, height: topH, depth: d, baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, legH+topH/2, 0], description: 'desktop' },
    ...([[-1,-1],[1,-1],[1,1],[-1,1]] as [number,number][]).map(([sx,sz],i) => ({
      shape: 'cylinder' as const, width: legDia, height: legH, depth: legDia,
      baseColor: legC, roughness: p.roughness, metalness: p.metalness,
      translation: [sx*lox, legH/2, sz*loz] as [number,number,number], description: `leg ${i+1}`,
    })),
  ];
}

function bag(p: ShapeParams): PartDef[] {
  const w = Math.max(p.width,  0.28);
  const h = Math.max(p.height, 0.30);
  const d = Math.max(p.depth,  0.12);

  const bodyH  = h * 0.72;
  const handleH = h * 0.38;
  const hDia   = Math.max(w * 0.035, 0.009);
  const spread = w * 0.22;

  return [
    { shape: 'box',      width: w,    height: bodyH,   depth: d,    baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, bodyH/2, 0],                description: 'bag body' },
    { shape: 'cylinder', width: hDia, height: handleH, depth: hDia, baseColor: p.baseColor, roughness: Math.min(1,p.roughness+.1), metalness: p.metalness, translation: [-spread, bodyH+handleH*.35, 0], description: 'left handle' },
    { shape: 'cylinder', width: hDia, height: handleH, depth: hDia, baseColor: p.baseColor, roughness: Math.min(1,p.roughness+.1), metalness: p.metalness, translation: [ spread, bodyH+handleH*.35, 0], description: 'right handle' },
  ];
}

function backpack(p: ShapeParams): PartDef[] {
  const w = Math.max(p.width,  0.30);
  const h = Math.max(p.height, 0.45);
  const d = Math.max(p.depth,  0.18);

  const pocketW = w * 0.60;
  const pocketH = h * 0.28;
  const pocketD = d * 0.15;
  const topHandleH = h * 0.06;
  const handleDia  = w * 0.04;

  return [
    { shape: 'box', width: w,       height: h,          depth: d,       baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, h/2, 0],                description: 'main body' },
    { shape: 'box', width: pocketW, height: pocketH,    depth: pocketD, baseColor: [Math.min(1,p.baseColor[0]+.06), Math.min(1,p.baseColor[1]+.06), Math.min(1,p.baseColor[2]+.06), 1], roughness: p.roughness, metalness: p.metalness, translation: [0, h*.28, d/2+pocketD/2], description: 'front pocket' },
    { shape: 'cylinder', width: handleDia, height: topHandleH, depth: handleDia, baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, h+topHandleH/2, 0], description: 'top handle' },
  ];
}

function watch(p: ShapeParams): PartDef[] {
  const caseDia = Math.max(p.width, 0.042);
  const caseH   = Math.max(p.height * 0.18, 0.011);
  const bandW   = caseDia * 0.62;
  const bandH   = Math.max(p.height * 0.38, 0.09);
  const bandD   = caseH * 0.55;
  const bandC: [number,number,number,number] = [p.baseColor[0]*.7, p.baseColor[1]*.7, p.baseColor[2]*.7, 1];

  return [
    { shape: 'cylinder', width: caseDia, height: caseH,  depth: caseDia, baseColor: p.baseColor, roughness: p.roughness, metalness: Math.min(1,p.metalness+.3), translation: [0, bandH+caseH/2, 0], description: 'watch case' },
    { shape: 'box',      width: bandW,   height: bandH,  depth: bandD,   baseColor: bandC, roughness: Math.min(1,p.roughness+.1), metalness: 0, translation: [0, bandH/2+caseH, 0], description: 'upper band' },
    { shape: 'box',      width: bandW,   height: bandH,  depth: bandD,   baseColor: bandC, roughness: Math.min(1,p.roughness+.1), metalness: 0, translation: [0, -bandH/2, 0],        description: 'lower band' },
  ];
}

function bottle(p: ShapeParams): PartDef[] {
  const dia  = Math.max(p.width, 0.065);
  const h    = Math.max(p.height, 0.22);

  const bodyH  = h * 0.77;
  const neckD  = dia * 0.40;
  const neckH  = h * 0.17;
  const capD   = neckD * 1.15;
  const capH   = h * 0.06;
  const capC: [number,number,number,number] = [Math.min(1,p.baseColor[0]+.18), Math.min(1,p.baseColor[1]+.18), Math.min(1,p.baseColor[2]+.18), 1];

  return [
    { shape: 'cylinder', width: dia,   height: bodyH, depth: dia,  baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, bodyH/2, 0],             description: 'body' },
    { shape: 'cylinder', width: neckD, height: neckH, depth: neckD, baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, bodyH+neckH/2, 0],       description: 'neck' },
    { shape: 'cylinder', width: capD,  height: capH,  depth: capD,  baseColor: capC,        roughness: 0.5,         metalness: 0,           translation: [0, bodyH+neckH+capH/2, 0], description: 'cap' },
  ];
}

function cup(p: ShapeParams): PartDef[] {
  const dia = Math.max(p.width,  0.075);
  const h   = Math.max(p.height, 0.095);
  const handleW  = dia * 0.35;
  const handleH  = h  * 0.55;
  const handleD  = dia * 0.08;

  return [
    { shape: 'cylinder', width: dia,      height: h,       depth: dia,     baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, h/2, 0],               description: 'cup body' },
    { shape: 'box',      width: handleD,  height: handleH, depth: handleW, baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [dia/2+handleD/2, h*.42, 0], description: 'handle' },
  ];
}

function vase(p: ShapeParams): PartDef[] {
  const dia = Math.max(p.width,  0.12);
  const h   = Math.max(p.height, 0.25);

  const bodyH  = h * 0.75;
  const neckH  = h * 0.25;
  const neckD  = dia * 0.45;

  return [
    { shape: 'cylinder', width: dia,   height: bodyH, depth: dia,  baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, bodyH/2, 0],      description: 'vase body' },
    { shape: 'cylinder', width: neckD, height: neckH, depth: neckD, baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, bodyH+neckH/2, 0], description: 'neck' },
  ];
}

function shoe(p: ShapeParams): PartDef[] {
  const w = Math.max(p.width,  0.095);
  const h = Math.max(p.height, 0.115);
  const d = Math.max(p.depth,  0.280);

  const soleH  = h * 0.14;
  const upperH = h * 0.55;
  const heelH  = h * 0.31;
  const heelD  = d * 0.22;
  const soleC: [number,number,number,number] = [0.08, 0.08, 0.08, 1];

  return [
    { shape: 'box', width: w,      height: soleH,  depth: d,     baseColor: soleC,        roughness: 0.92, metalness: 0, translation: [0, soleH/2,            0],         description: 'sole' },
    { shape: 'box', width: w*.92,  height: upperH, depth: d*.75, baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, soleH+upperH/2,   d*.12],  description: 'upper' },
    { shape: 'box', width: w*.85,  height: heelH,  depth: heelD, baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, soleH+heelH/2,  -d/2+heelD/2], description: 'heel counter' },
  ];
}

function lamp(p: ShapeParams): PartDef[] {
  const w = Math.max(p.width,  0.35);
  const h = Math.max(p.height, 0.55);

  const baseH  = h * 0.07;
  const poleH  = h * 0.68;
  const poleDia = w * 0.04;
  const shadeH = h * 0.25;
  const shadeD = w * 0.85;
  const shadeC: [number,number,number,number] = [Math.min(1,p.baseColor[0]+.25), Math.min(1,p.baseColor[1]+.25), Math.min(1,p.baseColor[2]+.15), 1];

  return [
    { shape: 'cylinder', width: w*.45,    height: baseH,  depth: w*.45,    baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, baseH/2, 0],               description: 'base' },
    { shape: 'cylinder', width: poleDia,  height: poleH,  depth: poleDia,  baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, baseH+poleH/2, 0],          description: 'pole' },
    { shape: 'cylinder', width: shadeD,   height: shadeH, depth: shadeD,   baseColor: shadeC,      roughness: 0.55,        metalness: 0.05,        translation: [0, baseH+poleH+shadeH/2, 0], description: 'shade' },
  ];
}

function bookshelf(p: ShapeParams): PartDef[] {
  const w = Math.max(p.width,  0.80);
  const h = Math.max(p.height, 1.80);
  const d = Math.max(p.depth,  0.30);

  const panelT = Math.max(w * 0.025, 0.018);
  const shelves = 4;
  const gap = (h - panelT) / shelves;

  const parts: PartDef[] = [
    // Left side
    { shape: 'box', width: panelT, height: h, depth: d, baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [-(w-panelT)/2, h/2, 0], description: 'left side' },
    // Right side
    { shape: 'box', width: panelT, height: h, depth: d, baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [ (w-panelT)/2, h/2, 0], description: 'right side' },
    // Back panel (thin)
    { shape: 'box', width: w, height: h, depth: panelT, baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, h/2, -(d-panelT)/2], description: 'back panel' },
  ];
  // Horizontal shelves
  for (let i = 0; i <= shelves; i++) {
    parts.push({ shape: 'box', width: w-panelT*2, height: panelT, depth: d, baseColor: p.baseColor, roughness: p.roughness, metalness: p.metalness, translation: [0, i*gap + panelT/2, 0], description: `shelf ${i+1}` });
  }
  return parts;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Select the right compound template for a detected product type. */
export function buildProductTypeParts(detectedType: string, params: ShapeParams): PartDef[] {
  switch (detectedType) {
    case 'laptop':      return laptop(params);
    case 'phone':       return phone(params);
    case 'tablet':      return tablet(params);
    case 'monitor':     return monitor(params);
    case 'speaker':     return speaker(params);
    case 'headphones':  return headphones(params);
    case 'chair':       return chair(params);
    case 'table':       return table(params);
    case 'sofa':        return sofa(params);
    case 'desk':        return desk(params);
    case 'bookshelf':   return bookshelf(params);
    case 'lamp':        return lamp(params);
    case 'bag':         return bag(params);
    case 'backpack':    return backpack(params);
    case 'watch':       return watch(params);
    case 'bottle':      return bottle(params);
    case 'cup':
    case 'mug':         return cup(params);
    case 'vase':        return vase(params);
    case 'shoe':
    case 'sneaker':
    case 'boot':        return shoe(params);
    default:
      // Generic single primitive — shape chosen by Gemini
      return [{ shape: params.shape, width: params.width, height: params.height, depth: params.depth, baseColor: params.baseColor, roughness: params.roughness, metalness: params.metalness }];
  }
}

// ─── Scene graph → PartDef conversion ────────────────────────────────────────

function scenePartToPartDef(part: ScenePart): PartDef {
  const { dimensions: dim, material: mat } = part;
  const def: PartDef = {
    shape:    part.shape,
    width:    dim.width,
    height:   dim.height,
    depth:    dim.depth,
    baseColor: mat.baseColor,
    roughness: mat.roughness,
    metalness: mat.metalness,
    translation: part.position,
    quaternion:  part.rotation,
    description: part.label,
    smooth:    part.smooth,
    segments:  part.segments,
    transmissionFactor: mat.transmissionFactor,
    emissiveFactor:     mat.emissiveFactor,
  };

  // Shape-specific dimension fields
  if (part.shape === 'frustum' || part.shape === 'wedge') {
    if (dim.topWidth  != null) def.topWidth  = dim.topWidth;
    if (dim.topDepth  != null) def.topDepth  = dim.topDepth;
  }
  if (part.shape === 'tapered-cylinder') {
    if (dim.radiusBottom != null) def.radiusBottom = dim.radiusBottom;
    if (dim.radiusTop    != null) def.radiusTop    = dim.radiusTop;
  }
  if (part.shape === 'torus') {
    if (dim.tubeRadius != null)  def.tubeRadius  = dim.tubeRadius;
    if (dim.majorRadius != null) def.width = dim.majorRadius * 2;
  }
  if (part.shape === 'extruded-ellipse') {
    if (dim.ry != null) def.ry = dim.ry;
  }

  return def;
}

function mirrorPartDef(def: PartDef, axis: 'x' | 'z'): PartDef {
  const mirrored = { ...def };
  if (def.translation) {
    const t = [...def.translation] as [number, number, number];
    if (axis === 'x') t[0] = -t[0];
    if (axis === 'z') t[2] = -t[2];
    mirrored.translation = t;
  }
  if (def.quaternion) {
    const q = [...def.quaternion] as [number, number, number, number];
    // Mirror the rotation quaternion across the axis
    if (axis === 'x') { q[1] = -q[1]; q[2] = -q[2]; }
    if (axis === 'z') { q[0] = -q[0]; q[1] = -q[1]; }
    mirrored.quaternion = q;
  }
  mirrored.description = (def.description ?? '') + ' (mirrored)';
  return mirrored;
}

/**
 * Convert a SceneGraph (v2 pipeline output) into PartDef[] for buildCompoundGlb().
 * Handles symmetryMirror auto-duplication.
 */
export function sceneGraphToPartDefs(graph: SceneGraph): PartDef[] {
  const result: PartDef[] = [];
  for (const part of graph.parts) {
    const def = scenePartToPartDef(part);
    result.push(def);
    if (part.symmetryMirror) {
      result.push(mirrorPartDef(def, part.symmetryMirror));
    }
  }
  return result;
}

// ─── GLB encoding ─────────────────────────────────────────────────────────────

export function buildGlbFromShape(params: ShapeParams): Uint8Array {
  const safeW = Math.max(params.width,  0.001);
  const safeH = Math.max(params.height, 0.001);
  const safeD = Math.max(params.depth,  0.001);
  let geometry: Geometry;
  if (params.shape === 'cylinder') geometry = buildCylinderGeometry(safeW, safeH);
  else if (params.shape === 'sphere') geometry = buildSphereGeometry(safeW);
  else geometry = buildBoxGeometry(safeW, safeH, safeD);

  const { positions, normals, uvs, indices } = geometry;
  const posArr  = new Float32Array(positions);
  const normArr = new Float32Array(normals);
  const uvArr   = new Float32Array(uvs);
  const idxArr  = new Uint16Array(indices);

  const posBytes  = posArr.byteLength;
  const normBytes = normArr.byteLength;
  const uvBytes   = uvArr.byteLength;
  const idxBytes  = idxArr.byteLength;
  const idxPad    = (4 - (idxBytes % 4)) % 4;
  const binLength = posBytes + normBytes + uvBytes + idxBytes + idxPad;

  const binData = new Uint8Array(binLength);
  let off = 0;
  const posOffset  = off; binData.set(new Uint8Array(posArr.buffer),  off); off += posBytes;
  const normOffset = off; binData.set(new Uint8Array(normArr.buffer), off); off += normBytes;
  const uvOffset   = off; binData.set(new Uint8Array(uvArr.buffer),   off); off += uvBytes;
  const idxOffset  = off; binData.set(new Uint8Array(idxArr.buffer),  off);

  const { min: posMin, max: posMax } = calcMinMax(positions, 3);
  const vc = positions.length / 3;
  const ic = indices.length;

  const gltfJson = {
    asset: { version: '2.0', generator: 'minimalblock-glb-builder' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 }, indices: 3, material: 0 }] }],
    materials: [{ pbrMetallicRoughness: { baseColorFactor: params.baseColor, metallicFactor: params.metalness, roughnessFactor: params.roughness }, doubleSided: false }],
    accessors: [
      { bufferView: 0, byteOffset: 0, componentType: 5126, count: vc, type: 'VEC3', min: posMin, max: posMax },
      { bufferView: 1, byteOffset: 0, componentType: 5126, count: vc, type: 'VEC3' },
      { bufferView: 2, byteOffset: 0, componentType: 5126, count: vc, type: 'VEC2' },
      { bufferView: 3, byteOffset: 0, componentType: 5123, count: ic, type: 'SCALAR' },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: posOffset,  byteLength: posBytes,  target: 34962 },
      { buffer: 0, byteOffset: normOffset, byteLength: normBytes, target: 34962 },
      { buffer: 0, byteOffset: uvOffset,   byteLength: uvBytes,   target: 34962 },
      { buffer: 0, byteOffset: idxOffset,  byteLength: idxBytes,  target: 34963 },
    ],
    buffers: [{ byteLength: binLength }],
  };

  return encodeGlb(gltfJson, binData);
}

const LEGACY_SHAPES = new Set<string>(['box', 'cylinder', 'sphere']);

export function buildCompoundGlb(parts: PartDef[]): Uint8Array {
  if (parts.length === 0) throw new Error('buildCompoundGlb: no parts provided');
  if (parts.length === 1 && !parts[0].translation && !parts[0].quaternion && LEGACY_SHAPES.has(parts[0].shape)) {
    return buildGlbFromShape(parts[0] as ShapeParams);
  }

  const geometries = parts.map(buildGeometry);
  const typed = geometries.map((g) => ({
    posArr:  new Float32Array(g.positions),
    normArr: new Float32Array(g.normals),
    uvArr:   new Float32Array(g.uvs),
    idxArr:  new Uint16Array(g.indices),
  }));

  let binOff = 0;
  const layout = typed.map((t) => {
    const posOffset  = binOff; binOff += t.posArr.byteLength;
    const normOffset = binOff; binOff += t.normArr.byteLength;
    const uvOffset   = binOff; binOff += t.uvArr.byteLength;
    const idxOffset  = binOff; binOff += t.idxArr.byteLength;
    const pad = (4 - (t.idxArr.byteLength % 4)) % 4; binOff += pad;
    return { posOffset, normOffset, uvOffset, idxOffset };
  });

  const binData = new Uint8Array(binOff);
  typed.forEach((t, i) => {
    const lo = layout[i];
    binData.set(new Uint8Array(t.posArr.buffer),  lo.posOffset);
    binData.set(new Uint8Array(t.normArr.buffer), lo.normOffset);
    binData.set(new Uint8Array(t.uvArr.buffer),   lo.uvOffset);
    binData.set(new Uint8Array(t.idxArr.buffer),  lo.idxOffset);
  });

  const accessors:   object[] = [];
  const bufferViews: object[] = [];
  const meshes:      object[] = [];
  const materials:   object[] = [];
  const nodes:       object[] = [];

  geometries.forEach((g, i) => {
    const t  = typed[i];
    const lo = layout[i];
    const p  = parts[i];
    const vc = g.positions.length / 3;
    const ic = g.indices.length;
    const { min: posMin, max: posMax } = calcMinMax(g.positions, 3);
    const ab = i * 4, bb = i * 4;

    bufferViews.push(
      { buffer: 0, byteOffset: lo.posOffset,  byteLength: t.posArr.byteLength,  target: 34962 },
      { buffer: 0, byteOffset: lo.normOffset, byteLength: t.normArr.byteLength, target: 34962 },
      { buffer: 0, byteOffset: lo.uvOffset,   byteLength: t.uvArr.byteLength,   target: 34962 },
      { buffer: 0, byteOffset: lo.idxOffset,  byteLength: t.idxArr.byteLength,  target: 34963 },
    );
    accessors.push(
      { bufferView: bb,   byteOffset: 0, componentType: 5126, count: vc, type: 'VEC3', min: posMin, max: posMax },
      { bufferView: bb+1, byteOffset: 0, componentType: 5126, count: vc, type: 'VEC3' },
      { bufferView: bb+2, byteOffset: 0, componentType: 5126, count: vc, type: 'VEC2' },
      { bufferView: bb+3, byteOffset: 0, componentType: 5123, count: ic, type: 'SCALAR' },
    );
    meshes.push({ primitives: [{ attributes: { POSITION: ab, NORMAL: ab+1, TEXCOORD_0: ab+2 }, indices: ab+3, material: i }] });
    const matDef: Record<string, unknown> = {
      pbrMetallicRoughness: { baseColorFactor: p.baseColor, metallicFactor: p.metalness, roughnessFactor: p.roughness },
      doubleSided: false,
    };
    if ((p as PartDef).transmissionFactor != null) {
      matDef['extensions'] = { KHR_materials_transmission: { transmissionFactor: (p as PartDef).transmissionFactor } };
    }
    if ((p as PartDef).emissiveFactor) matDef['emissiveFactor'] = (p as PartDef).emissiveFactor;
    materials.push(matDef);

    const node: Record<string, unknown> = { mesh: i };
    if (p.translation) node['translation'] = p.translation;
    if (p.quaternion)  node['rotation']    = p.quaternion;
    nodes.push(node);
  });

  const gltfJson = {
    asset: { version: '2.0', generator: 'minimalblock-glb-builder' },
    scene: 0,
    scenes: [{ nodes: parts.map((_, i) => i) }],
    nodes, meshes, materials, accessors, bufferViews,
    buffers: [{ byteLength: binOff }],
  };

  return encodeGlb(gltfJson, binData);
}

function encodeGlb(gltfJson: object, binData: Uint8Array): Uint8Array {
  const jsonBytes   = new TextEncoder().encode(JSON.stringify(gltfJson));
  const jsonPad     = (4 - (jsonBytes.length % 4)) % 4;
  const jsonChunkLen = jsonBytes.length + jsonPad;
  const totalLength  = 12 + 8 + jsonChunkLen + 8 + binData.length;

  const glb = new Uint8Array(totalLength);
  const dv  = new DataView(glb.buffer);
  dv.setUint32(0, 0x46546C67, true);
  dv.setUint32(4, 2, true);
  dv.setUint32(8, totalLength, true);
  dv.setUint32(12, jsonChunkLen, true);
  dv.setUint32(16, 0x4E4F534A, true);
  glb.set(jsonBytes, 20);
  glb.fill(0x20, 20 + jsonBytes.length, 20 + jsonChunkLen);
  const bs = 20 + jsonChunkLen;
  dv.setUint32(bs,     binData.length, true);
  dv.setUint32(bs + 4, 0x004E4942, true);
  glb.set(binData, bs + 8);
  return glb;
}
