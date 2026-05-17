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
  shape: 'box' | 'cylinder' | 'sphere';
  width: number;
  height: number;
  depth: number;
  baseColor: [number, number, number, number];
  roughness: number;
  metalness: number;
  translation?: [number, number, number];
  quaternion?: [number, number, number, number]; // [x, y, z, w]
  description?: string;
}

interface Geometry {
  positions: number[];
  normals: number[];
  uvs: number[];
  indices: number[];
}

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
  positions.push(0, hh, 0);
  normals.push(0, 1, 0);
  uvs.push(0.5, 0.5);
  for (let i = 0; i < segments; i++) {
    const t0 = (i / segments) * 2 * Math.PI;
    const t1 = ((i + 1) / segments) * 2 * Math.PI;
    const base = positions.length / 3;
    positions.push(r*Math.cos(t0),hh,r*Math.sin(t0), r*Math.cos(t1),hh,r*Math.sin(t1));
    normals.push(0,1,0, 0,1,0);
    uvs.push(Math.cos(t0)*0.5+0.5,Math.sin(t0)*0.5+0.5, Math.cos(t1)*0.5+0.5,Math.sin(t1)*0.5+0.5);
    indices.push(topCenter, base+1, base);
  }

  const bottomCenter = positions.length / 3;
  positions.push(0, -hh, 0);
  normals.push(0, -1, 0);
  uvs.push(0.5, 0.5);
  for (let i = 0; i < segments; i++) {
    const t0 = (i / segments) * 2 * Math.PI;
    const t1 = ((i + 1) / segments) * 2 * Math.PI;
    const base = positions.length / 3;
    positions.push(r*Math.cos(t0),-hh,r*Math.sin(t0), r*Math.cos(t1),-hh,r*Math.sin(t1));
    normals.push(0,-1,0, 0,-1,0);
    uvs.push(Math.cos(t0)*0.5+0.5,Math.sin(t0)*0.5+0.5, Math.cos(t1)*0.5+0.5,Math.sin(t1)*0.5+0.5);
    indices.push(bottomCenter, base, base+1);
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
      positions.push(r * x, r * y, r * z);
      normals.push(x, y, z);
      uvs.push(j / lon, i / lat);
    }
  }

  for (let i = 0; i < lat; i++) {
    for (let j = 0; j < lon; j++) {
      const a = i * (lon + 1) + j;
      const b = a + lon + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  return { positions, normals, uvs, indices };
}

function buildGeometry(part: PartDef | ShapeParams): Geometry {
  const w = Math.max(part.width, 0.001);
  const h = Math.max(part.height, 0.001);
  const d = Math.max(part.depth, 0.001);
  if (part.shape === 'cylinder') return buildCylinderGeometry(w, h);
  if (part.shape === 'sphere') return buildSphereGeometry(w);
  return buildBoxGeometry(w, h, d);
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

// --- Category-specific compound shape builders ---

function buildElectronicsParts(p: ShapeParams): PartDef[] {
  const w = Math.max(p.width, 0.15);
  const h = Math.max(p.height, 0.10);
  const d = Math.max(p.depth, 0.12);
  const c = p.baseColor;

  // Detect phone/tablet (portrait aspect) vs laptop (landscape)
  if (h > w * 1.2) {
    // Phone/tablet: single flat slab, no compound needed
    return [{ shape: 'box', width: w, height: h, depth: Math.min(d, 0.012), baseColor: c, roughness: p.roughness, metalness: p.metalness, description: 'device body' }];
  }

  // Laptop: keyboard base + angled screen panel
  const baseH = Math.min(h * 0.15, 0.025);
  const screenH = h * 0.82;
  const screenD = Math.max(d * 0.04, 0.007);

  const df = 0.65;
  const screenColor: [number, number, number, number] = [c[0] * df, c[1] * df, c[2] * df, 1.0];

  // Screen open at 110° from base → 20° past vertical → tilt -20° around X
  const tiltRad = 20 * Math.PI / 180;
  const qx = Math.sin(-tiltRad / 2);
  const qw = Math.cos(-tiltRad / 2);

  const hingeY = baseH;
  const hingeZ = -d / 2;
  const screenCenterY = hingeY + (screenH / 2) * Math.cos(tiltRad);
  const screenCenterZ = hingeZ - (screenH / 2) * Math.sin(tiltRad);

  return [
    {
      shape: 'box', width: w, height: baseH, depth: d,
      baseColor: c, roughness: p.roughness, metalness: p.metalness,
      translation: [0, baseH / 2, 0],
      description: 'keyboard base',
    },
    {
      shape: 'box', width: w, height: screenH, depth: screenD,
      baseColor: screenColor,
      roughness: Math.max(0, p.roughness - 0.1),
      metalness: Math.min(1, p.metalness + 0.15),
      translation: [0, screenCenterY, screenCenterZ],
      quaternion: [qx, 0, 0, qw],
      description: 'screen panel',
    },
  ];
}

function buildFurnitureParts(p: ShapeParams): PartDef[] {
  const w = Math.max(p.width, 0.3);
  const h = Math.max(p.height, 0.3);
  const d = Math.max(p.depth, 0.3);
  const c = p.baseColor;

  const topH = Math.max(h * 0.08, 0.02);
  const legH = h - topH;
  const legDia = Math.min(w, d) * 0.08;
  const legOffX = w / 2 - legDia * 0.7;
  const legOffZ = d / 2 - legDia * 0.7;
  const legColor: [number, number, number, number] = [
    Math.min(1, c[0] * 1.1), Math.min(1, c[1] * 1.1), Math.min(1, c[2] * 1.1), 1.0,
  ];

  return [
    {
      shape: 'box', width: w, height: topH, depth: d,
      baseColor: c, roughness: p.roughness, metalness: p.metalness,
      translation: [0, legH + topH / 2, 0],
      description: 'tabletop',
    },
    ...([[-1, -1], [1, -1], [1, 1], [-1, 1]] as Array<[number, number]>).map(([sx, sz], i) => ({
      shape: 'cylinder' as const,
      width: legDia, height: legH, depth: legDia,
      baseColor: legColor,
      roughness: Math.min(1, p.roughness + 0.05),
      metalness: p.metalness,
      translation: [sx * legOffX, legH / 2, sz * legOffZ] as [number, number, number],
      description: `leg ${i + 1}`,
    })),
  ];
}

function buildBagParts(p: ShapeParams): PartDef[] {
  const w = Math.max(p.width, 0.2);
  const h = Math.max(p.height, 0.2);
  const d = Math.max(p.depth, 0.1);
  const c = p.baseColor;

  const bodyH = h * 0.72;
  const handleH = h * 0.38;
  const handleDia = Math.max(w * 0.035, 0.008);
  const spread = w * 0.22;

  return [
    {
      shape: 'box', width: w, height: bodyH, depth: d,
      baseColor: c, roughness: p.roughness, metalness: p.metalness,
      translation: [0, bodyH / 2, 0],
      description: 'bag body',
    },
    {
      shape: 'cylinder', width: handleDia, height: handleH, depth: handleDia,
      baseColor: c, roughness: Math.min(1, p.roughness + 0.1), metalness: p.metalness,
      translation: [-spread, bodyH + handleH * 0.35, 0],
      description: 'left handle',
    },
    {
      shape: 'cylinder', width: handleDia, height: handleH, depth: handleDia,
      baseColor: c, roughness: Math.min(1, p.roughness + 0.1), metalness: p.metalness,
      translation: [spread, bodyH + handleH * 0.35, 0],
      description: 'right handle',
    },
  ];
}

/** Returns category-appropriate parts array. Single-element = use simple GLB path. */
export function buildCategoryParts(category: string, params: ShapeParams): PartDef[] {
  switch (category) {
    case 'electronics': return buildElectronicsParts(params);
    case 'furniture':   return buildFurnitureParts(params);
    case 'bags':        return buildBagParts(params);
    default:
      return [{ shape: params.shape, width: params.width, height: params.height, depth: params.depth, baseColor: params.baseColor, roughness: params.roughness, metalness: params.metalness }];
  }
}

// --- GLB encoding ---

export function buildGlbFromShape(params: ShapeParams): Uint8Array {
  const safeW = Math.max(params.width, 0.001);
  const safeH = Math.max(params.height, 0.001);
  const safeD = Math.max(params.depth, 0.001);

  let geometry: Geometry;
  if (params.shape === 'cylinder') {
    geometry = buildCylinderGeometry(safeW, safeH);
  } else if (params.shape === 'sphere') {
    geometry = buildSphereGeometry(safeW);
  } else {
    geometry = buildBoxGeometry(safeW, safeH, safeD);
  }

  const { positions, normals, uvs, indices } = geometry;
  const vertexCount = positions.length / 3;
  const indexCount = indices.length;

  const posArr = new Float32Array(positions);
  const normArr = new Float32Array(normals);
  const uvArr = new Float32Array(uvs);
  const idxArr = new Uint16Array(indices);

  const posBytes = posArr.byteLength;
  const normBytes = normArr.byteLength;
  const uvBytes = uvArr.byteLength;
  const idxBytes = idxArr.byteLength;
  const idxPad = (4 - (idxBytes % 4)) % 4;
  const binLength = posBytes + normBytes + uvBytes + idxBytes + idxPad;

  const binData = new Uint8Array(binLength);
  let off = 0;
  const posOffset = off; binData.set(new Uint8Array(posArr.buffer), off); off += posBytes;
  const normOffset = off; binData.set(new Uint8Array(normArr.buffer), off); off += normBytes;
  const uvOffset = off; binData.set(new Uint8Array(uvArr.buffer), off); off += uvBytes;
  const idxOffset = off; binData.set(new Uint8Array(idxArr.buffer), off);

  const { min: posMin, max: posMax } = calcMinMax(positions, 3);

  const gltfJson = {
    asset: { version: '2.0', generator: 'minimalblock-glb-builder' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 }, indices: 3, material: 0 }] }],
    materials: [{
      pbrMetallicRoughness: {
        baseColorFactor: params.baseColor,
        metallicFactor: params.metalness,
        roughnessFactor: params.roughness,
      },
      doubleSided: false,
    }],
    accessors: [
      { bufferView: 0, byteOffset: 0, componentType: 5126, count: vertexCount, type: 'VEC3', min: posMin, max: posMax },
      { bufferView: 1, byteOffset: 0, componentType: 5126, count: vertexCount, type: 'VEC3' },
      { bufferView: 2, byteOffset: 0, componentType: 5126, count: vertexCount, type: 'VEC2' },
      { bufferView: 3, byteOffset: 0, componentType: 5123, count: indexCount,  type: 'SCALAR' },
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

export function buildCompoundGlb(parts: PartDef[]): Uint8Array {
  if (parts.length === 0) throw new Error('buildCompoundGlb: no parts provided');
  if (parts.length === 1 && !parts[0].translation && !parts[0].quaternion) {
    return buildGlbFromShape(parts[0]);
  }

  const geometries = parts.map(buildGeometry);
  const typed = geometries.map((g) => ({
    posArr:  new Float32Array(g.positions),
    normArr: new Float32Array(g.normals),
    uvArr:   new Float32Array(g.uvs),
    idxArr:  new Uint16Array(g.indices),
  }));

  // Compute binary layout: each part is [pos][norm][uv][idx][pad]
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

  const accessors: object[] = [];
  const bufferViews: object[] = [];
  const meshes: object[] = [];
  const materials: object[] = [];
  const nodes: object[] = [];

  geometries.forEach((g, i) => {
    const t = typed[i];
    const lo = layout[i];
    const p = parts[i];
    const vertexCount = g.positions.length / 3;
    const indexCount  = g.indices.length;
    const { min: posMin, max: posMax } = calcMinMax(g.positions, 3);
    const accBase = i * 4;
    const bvBase  = i * 4;

    bufferViews.push(
      { buffer: 0, byteOffset: lo.posOffset,  byteLength: t.posArr.byteLength,  target: 34962 },
      { buffer: 0, byteOffset: lo.normOffset, byteLength: t.normArr.byteLength, target: 34962 },
      { buffer: 0, byteOffset: lo.uvOffset,   byteLength: t.uvArr.byteLength,   target: 34962 },
      { buffer: 0, byteOffset: lo.idxOffset,  byteLength: t.idxArr.byteLength,  target: 34963 },
    );

    accessors.push(
      { bufferView: bvBase,     byteOffset: 0, componentType: 5126, count: vertexCount, type: 'VEC3', min: posMin, max: posMax },
      { bufferView: bvBase + 1, byteOffset: 0, componentType: 5126, count: vertexCount, type: 'VEC3' },
      { bufferView: bvBase + 2, byteOffset: 0, componentType: 5126, count: vertexCount, type: 'VEC2' },
      { bufferView: bvBase + 3, byteOffset: 0, componentType: 5123, count: indexCount,  type: 'SCALAR' },
    );

    meshes.push({
      primitives: [{
        attributes: { POSITION: accBase, NORMAL: accBase + 1, TEXCOORD_0: accBase + 2 },
        indices: accBase + 3,
        material: i,
      }],
    });

    materials.push({
      pbrMetallicRoughness: {
        baseColorFactor: p.baseColor,
        metallicFactor: p.metalness,
        roughnessFactor: p.roughness,
      },
      doubleSided: false,
    });

    const node: Record<string, unknown> = { mesh: i };
    if (p.translation) node['translation'] = p.translation;
    if (p.quaternion)  node['rotation']    = p.quaternion;
    nodes.push(node);
  });

  const gltfJson = {
    asset: { version: '2.0', generator: 'minimalblock-glb-builder' },
    scene: 0,
    scenes: [{ nodes: parts.map((_, i) => i) }],
    nodes,
    meshes,
    materials,
    accessors,
    bufferViews,
    buffers: [{ byteLength: binOff }],
  };

  return encodeGlb(gltfJson, binData);
}

function encodeGlb(gltfJson: object, binData: Uint8Array): Uint8Array {
  const jsonBytes = new TextEncoder().encode(JSON.stringify(gltfJson));
  const jsonPad = (4 - (jsonBytes.length % 4)) % 4;
  const jsonChunkLen = jsonBytes.length + jsonPad;

  const HEADER = 12;
  const CHUNK_HDR = 8;
  const totalLength = HEADER + CHUNK_HDR + jsonChunkLen + CHUNK_HDR + binData.length;

  const glb = new Uint8Array(totalLength);
  const dv = new DataView(glb.buffer);

  dv.setUint32(0, 0x46546C67, true); // "glTF"
  dv.setUint32(4, 2, true);
  dv.setUint32(8, totalLength, true);

  dv.setUint32(12, jsonChunkLen, true);
  dv.setUint32(16, 0x4E4F534A, true); // "JSON"
  glb.set(jsonBytes, 20);
  glb.fill(0x20, 20 + jsonBytes.length, 20 + jsonChunkLen);

  const binStart = 20 + jsonChunkLen;
  dv.setUint32(binStart,     binData.length, true);
  dv.setUint32(binStart + 4, 0x004E4942, true); // "BIN\0"
  glb.set(binData, binStart + 8);

  return glb;
}
