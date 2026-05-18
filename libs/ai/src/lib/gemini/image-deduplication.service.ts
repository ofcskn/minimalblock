export class ImageDeduplicationService {
  computeHash(imageBytes: Uint8Array): string {
    const size = 8;
    const step = Math.max(1, Math.floor(imageBytes.length / (size * size)));
    const samples: number[] = [];
    for (let i = 0; i < size * size; i++) {
      const offset = Math.min(i * step, imageBytes.length - 1);
      samples.push(imageBytes[offset]);
    }
    const mean = samples.reduce((acc, v) => acc + v, 0) / samples.length;
    let bits = 0n;
    for (let i = 0; i < samples.length; i++) {
      if (samples[i] >= mean) bits |= (1n << BigInt(i));
    }
    return bits.toString(16).padStart(16, '0').slice(0, 16);
  }

  hammingDistance(a: string, b: string): number {
    if (a.length !== b.length) return 64;
    const aVal = BigInt(`0x${a}`);
    const bVal = BigInt(`0x${b}`);
    let dist = 0;
    let xor = aVal ^ bVal;
    while (xor > 0n) {
      dist += Number(xor & 1n);
      xor >>= 1n;
    }
    return dist;
  }

  findDuplicates(hashes: string[], hammingThreshold = 6): number[] {
    const duplicateIndexes: number[] = [];
    for (let i = 0; i < hashes.length; i++) {
      for (let j = 0; j < i; j++) {
        if (duplicateIndexes.includes(j)) continue;
        if (this.hammingDistance(hashes[i], hashes[j]) <= hammingThreshold) {
          duplicateIndexes.push(i);
          break;
        }
      }
    }
    return duplicateIndexes;
  }
}
