import { createHash } from 'crypto';

// No es criptográfico: no importa acá, solo necesitamos que sea determinista
// y esté bien distribuido, no impredecible frente a un atacante.
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: T[], seed: string): T[] {
  const hash = createHash('sha256').update(seed).digest('hex');
  const seedNumber = parseInt(hash.substring(0, 8), 16);
  const rng = mulberry32(seedNumber);

  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
