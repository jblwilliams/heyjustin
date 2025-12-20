export interface PhysicsDrop {
  id: number;
  x: number;
  y: number;
  mass: number;
  radius: number;
  vy: number;
  state: 'STATIC' | 'FLOWING';
  trailCounter: number;
}

export interface PhysicsConfig {
  spawnRate: number;
  criticalMass: number;
  friction: number;
  trailDensity: number;
  k: number;
  terminalVelocity: number;
}

export class SpatialHashGrid {
  private cells: PhysicsDrop[][];
  private cellSize: number;
  private cols: number;
  private rows: number;

  constructor(width: number, height: number, cellSize: number) {
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);
    this.cells = new Array(this.cols * this.rows).fill(null).map(() => []);
  }

  clear() {
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i] = [];
    }
  }

  insert(drop: PhysicsDrop) {
    const col = Math.floor(drop.x / this.cellSize);
    const row = Math.floor(drop.y / this.cellSize);

    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      const index = row * this.cols + col;
      this.cells[index].push(drop);
    }
  }

  getNeighbors(drop: PhysicsDrop): PhysicsDrop[] {
    const col = Math.floor(drop.x / this.cellSize);
    const row = Math.floor(drop.y / this.cellSize);
    const neighbors: PhysicsDrop[] = [];

    const startCol = Math.max(0, col - 1);
    const endCol = Math.min(this.cols - 1, col + 1);
    const startRow = Math.max(0, row - 1);
    const endRow = Math.min(this.rows - 1, row + 1);

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const index = r * this.cols + c;
        const cell = this.cells[index];
        for (const other of cell) {
          if (other.id !== drop.id) {
            neighbors.push(other);
          }
        }
      }
    }
    return neighbors;
  }
}

/**
 * Improved Physics Engine
 * 
 * Key improvements:
 * 1. Drops spawn only at the top (y = 0 to y = height * 0.1)
 * 2. Better gravity simulation
 * 3. Improved merging behavior
 * 4. More realistic trail drops
 */
export class ImprovedPhysicsEngine {
  public drops: PhysicsDrop[] = [];
  private grid: SpatialHashGrid;
  private width: number;
  private height: number;
  private config: PhysicsConfig;
  private nextId = 0;
  private timeAccumulator = 0;

  constructor(width: number, height: number, config?: Partial<PhysicsConfig>) {
    this.width = width;
    this.height = height;

    this.config = {
      spawnRate: 15,
      criticalMass: 200,
      friction: 0.92,
      trailDensity: 0.15,
      k: 0.12,
      terminalVelocity: 12,
      ...config
    };

    this.grid = new SpatialHashGrid(width, height, 60);
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.grid = new SpatialHashGrid(width, height, 60);
  }

  update(dt: number) {
    // Spawn new drops
    this.timeAccumulator += dt;
    const spawnInterval = 1 / this.config.spawnRate;
    while (this.timeAccumulator >= spawnInterval) {
      this.spawnDrop();
      this.timeAccumulator -= spawnInterval;
    }

    // Update spatial grid
    this.grid.clear();
    for (const drop of this.drops) {
      this.grid.insert(drop);
    }

    const activeDrops: PhysicsDrop[] = [];
    const mergedIds = new Set<number>();

    for (const drop of this.drops) {
      if (mergedIds.has(drop.id)) continue;

      // Determine if drop should flow based on critical mass
      if (drop.mass >= this.config.criticalMass) {
        // Calculate velocity based on mass (heavier drops fall faster)
        const targetV = this.config.k * (drop.mass - this.config.criticalMass);
        drop.vy = Math.min(targetV, this.config.terminalVelocity);
        drop.state = 'FLOWING';
      } else {
        drop.vy = 0;
        drop.state = 'STATIC';
      }

      // Apply velocity
      drop.y += drop.vy;

      // Remove drops that have fallen off screen
      if (drop.y > this.height + drop.radius * 2) {
        continue;
      }

      // Check for merging with nearby drops
      if (drop.state === 'FLOWING') {
        const neighbors = this.grid.getNeighbors(drop);

        for (const other of neighbors) {
          if (mergedIds.has(other.id)) continue;

          const dx = drop.x - other.x;
          const dy = drop.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Merge if drops are overlapping
          if (dist < (drop.radius + other.radius) * 0.9) {
            const totalMass = drop.mass + other.mass;
            const ratioDrop = drop.mass / totalMass;
            const ratioOther = other.mass / totalMass;

            // Weighted average of positions
            drop.x = drop.x * ratioDrop + other.x * ratioOther;
            drop.y = drop.y * ratioDrop + other.y * ratioOther;

            drop.mass = totalMass;
            drop.radius = Math.sqrt(drop.mass);
            mergedIds.add(other.id);
          }
        }
      }

      // Leave trail drops for flowing drops
      if (drop.state === 'FLOWING' && drop.mass > this.config.criticalMass * 1.2) {
        drop.trailCounter += drop.vy;
        const trailThreshold = drop.radius * 2;

        if (drop.trailCounter > trailThreshold) {
          if (Math.random() < this.config.trailDensity) {
            const trailMass = 3 + Math.random() * 8;
            if (drop.mass > this.config.criticalMass + trailMass) {
              drop.mass -= trailMass;
              drop.radius = Math.sqrt(drop.mass);
              
              // Create trail drop behind the flowing drop
              activeDrops.push({
                id: this.nextId++,
                x: drop.x + (Math.random() - 0.5) * drop.radius * 0.5,
                y: drop.y - drop.radius * 1.2,
                mass: trailMass,
                radius: Math.sqrt(trailMass),
                vy: 0,
                state: 'STATIC',
                trailCounter: 0
              });
            }
          }
          drop.trailCounter = 0;
        }
      }

      activeDrops.push(drop);
    }

    // Filter out merged drops
    this.drops = activeDrops.filter(d => !mergedIds.has(d.id));
  }

  /**
   * Improved spawn behavior: drops only spawn at the top of the screen
   */
  spawnDrop() {
    // Spawn across the full width
    const x = Math.random() * this.width;
    
    // Spawn only in the top 10% of the screen
    const y = Math.random() * (this.height * 0.1);
    
    // Vary drop sizes
    const mass = 3 + Math.random() * 12;

    this.drops.push({
      id: this.nextId++,
      x,
      y,
      mass,
      radius: Math.sqrt(mass),
      vy: 0,
      state: 'STATIC',
      trailCounter: 0
    });
  }

  /**
   * Manually add a drop (useful for testing or special effects)
   */
  addDrop(x: number, y: number, mass: number = 10) {
    this.drops.push({
      id: this.nextId++,
      x,
      y,
      mass,
      radius: Math.sqrt(mass),
      vy: 0,
      state: 'STATIC',
      trailCounter: 0
    });
  }

  /**
   * Clear all drops
   */
  clear() {
    this.drops = [];
  }
}
