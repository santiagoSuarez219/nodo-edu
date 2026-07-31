import { createHash } from 'crypto';

// Mulberry32 PRNG: determinista, fast, buen distribute. No cryptographic.
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
  // Derivar número desde el hash del seed (primeros 8 chars hex → número)
  const hash = createHash('sha256').update(seed).digest('hex');
  const seedNumber = parseInt(hash.substring(0, 8), 16);
  const rng = mulberry32(seedNumber);

  // Fisher-Yates: shuffle en una copia, sin mutar original
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
