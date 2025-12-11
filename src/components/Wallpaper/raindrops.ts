/**
 * Raindrop Generator
 *
 * Creates procedural water droplets for the iOS 6 wallpaper.
 * Uses a seeded PRNG for consistent SSR/CSR hydration and stable patterns.
 *
 * Key characteristics from original iOS 6 wallpaper:
 * - Drops are LARGER at the top, SMALLER toward bottom (rain falls down)
 * - Very high density of tiny drops scattered everywhere
 * - Drops have organic, slightly irregular shapes (not perfect circles)
 */

import type { Drop } from './types';

/**
 * Mulberry32 - A simple, fast 32-bit seeded PRNG
 * Produces deterministic sequences for consistent droplet layouts
 */
function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Creates a distribution of water droplets
 * Mimics rain on glass: large drops at top, smaller as they fall down
 *
 * @param count - Number of droplets to generate
 * @param seed - Random seed for reproducibility
 * @returns Array of Drop objects with normalized coordinates
 */
export function createDrops(count: number, seed: number = 42): Drop[] {
  const random = mulberry32(seed);
  const drops: Drop[] = [];

  let id = 0;

  // Layer 1: Large drops concentrated at the very top (0-25%)
  const largeCount = Math.floor(count * 0.08);
  for (let i = 0; i < largeCount; i++) {
    const y = random() * 0.25;
    drops.push({
      id: id++,
      x: 0.05 + random() * 0.9,
      y: 0.03 + y,
      radius: 12 + random() * 10,
      opacity: 0.7 + random() * 0.25,
      type: 'large',
      // Organic shape: slight stretch and rotation
      stretchX: 0.85 + random() * 0.3,
      stretchY: 0.9 + random() * 0.2,
      rotation: (random() - 0.5) * 0.3, // ±0.15 radians
    });
  }

  // Layer 2: Medium-large drops in upper third (0-35%)
  const medLargeCount = Math.floor(count * 0.12);
  for (let i = 0; i < medLargeCount; i++) {
    const y = random() * 0.35;
    drops.push({
      id: id++,
      x: 0.03 + random() * 0.94,
      y: 0.05 + y,
      radius: 7 + random() * 6,
      opacity: 0.6 + random() * 0.3,
      type: 'medium',
      stretchX: 0.88 + random() * 0.24,
      stretchY: 0.92 + random() * 0.16,
      rotation: (random() - 0.5) * 0.25,
    });
  }

  // Layer 3: Medium drops in upper half (0-55%)
  const mediumCount = Math.floor(count * 0.15);
  for (let i = 0; i < mediumCount; i++) {
    const y = random() * 0.55;
    drops.push({
      id: id++,
      x: 0.02 + random() * 0.96,
      y: 0.08 + y,
      radius: 4 + random() * 4,
      opacity: 0.5 + random() * 0.35,
      type: 'medium',
      stretchX: 0.9 + random() * 0.2,
      stretchY: 0.9 + random() * 0.2,
      rotation: (random() - 0.5) * 0.2,
    });
  }

  // Layer 4: Small drops throughout (biased toward middle/lower)
  const smallCount = Math.floor(count * 0.25);
  for (let i = 0; i < smallCount; i++) {
    const y = 0.15 + random() * 0.75;
    drops.push({
      id: id++,
      x: random(),
      y: y,
      radius: 2.5 + random() * 2.5,
      opacity: 0.4 + random() * 0.4,
      type: 'small',
      stretchX: 0.92 + random() * 0.16,
      stretchY: 0.92 + random() * 0.16,
      rotation: (random() - 0.5) * 0.15,
    });
  }

  // Layer 5: Tiny drops - LOTS of them, scattered everywhere
  const tinyCount = Math.floor(count * 0.4);
  for (let i = 0; i < tinyCount; i++) {
    drops.push({
      id: id++,
      x: random(),
      y: random(),
      radius: 1 + random() * 1.8,
      opacity: 0.35 + random() * 0.45,
      type: 'small',
      // Tiny drops stay more circular
      stretchX: 0.95 + random() * 0.1,
      stretchY: 0.95 + random() * 0.1,
      rotation: 0,
    });
  }

  // Sort by size so larger drops render on top
  return drops.sort((a, b) => a.radius - b.radius);
}

/**
 * Creates water streaks - elongated drops that have run down the surface
 */
export function createStreaks(count: number, seed: number = 123): Drop[] {
  const random = mulberry32(seed);
  const streaks: Drop[] = [];

  for (let i = 0; i < count; i++) {
    const startY = random() * 0.3;

    streaks.push({
      id: 1000 + i,
      x: random(),
      y: startY + random() * 0.4,
      radius: 2 + random() * 3,
      opacity: 0.15 + random() * 0.25,
      type: 'small',
      stretchX: 0.3 + random() * 0.2, // Very narrow
      stretchY: 3 + random() * 2, // Very tall
      rotation: (random() - 0.5) * 0.1, // Mostly vertical
    });
  }

  return streaks;
}
