export interface ShapeParams {
  shape: 'box' | 'cylinder' | 'sphere';
  width: number;
  height: number;
  depth: number;
  baseColor: [number, number, number, number];
  roughness: number;
  metalness: number;
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

  const jsonBytes = new TextEncoder().encode(JSON.stringify(gltfJson));
  const jsonPad = (4 - (jsonBytes.length % 4)) % 4;
  const jsonChunkLen = jsonBytes.length + jsonPad;

  const HEADER = 12;
  const CHUNK_HDR = 8;
  const totalLength = HEADER + CHUNK_HDR + jsonChunkLen + CHUNK_HDR + binLength;

  const glb = new Uint8Array(totalLength);
  const dv = new DataView(glb.buffer);

  dv.setUint32(0, 0x46546C67, true); // magic "glTF"
  dv.setUint32(4, 2, true);           // version
  dv.setUint32(8, totalLength, true); // total length

  dv.setUint32(12, jsonChunkLen, true);   // JSON chunk length
  dv.setUint32(16, 0x4E4F534A, true);     // "JSON"
  glb.set(jsonBytes, 20);
  glb.fill(0x20, 20 + jsonBytes.length, 20 + jsonChunkLen); // pad with spaces

  const binStart = 20 + jsonChunkLen;
  dv.setUint32(binStart,     binLength, true);     // BIN chunk length
  dv.setUint32(binStart + 4, 0x004E4942, true);    // "BIN\0"
  glb.set(binData, binStart + 8);

  return glb;
}
