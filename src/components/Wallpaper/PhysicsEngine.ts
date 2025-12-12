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
  spawnRate: number; // drops per second
  criticalMass: number; // mass at which drops start sliding
  friction: number; // velocity multiplier
  trailDensity: number; // chance to leave a trail drop
  k: number; // viscosity constant
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

    // Bounds check
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

export class PhysicsEngine {
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
      spawnRate: 10,
      criticalMass: 225, // r=15
      friction: 0.9,
      trailDensity: 0.1,
      k: 0.1, // Viscosity constant
      terminalVelocity: 10,
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
    this.timeAccumulator += dt;
    const spawnInterval = 1 / this.config.spawnRate;
    while (this.timeAccumulator >= spawnInterval) {
      this.spawnDrop();
      this.timeAccumulator -= spawnInterval;
    }

    this.grid.clear();
    for (const drop of this.drops) {
      this.grid.insert(drop);
    }

    const activeDrops: PhysicsDrop[] = [];
    const mergedIds = new Set<number>();

    for (const drop of this.drops) {
      if (mergedIds.has(drop.id)) continue;

      if (drop.mass >= this.config.criticalMass) {
        const targetV = this.config.k * (drop.mass - this.config.criticalMass);
        drop.vy = Math.min(targetV, this.config.terminalVelocity);
        drop.state = 'FLOWING';
      } else {
        drop.vy = 0;
        drop.state = 'STATIC';
      }

      drop.y += drop.vy;

      if (drop.y > this.height + drop.radius) {
        continue;
      }

      if (drop.state === 'FLOWING') {
        const neighbors = this.grid.getNeighbors(drop);

        for (const other of neighbors) {
          if (mergedIds.has(other.id)) continue;

          const dx = drop.x - other.x;
          const dy = drop.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < (drop.radius + other.radius)) {
            const totalMass = drop.mass + other.mass;
            const ratioDrop = drop.mass / totalMass;
            const ratioOther = other.mass / totalMass;

            drop.x = drop.x * ratioDrop + other.x * ratioOther;
            drop.y = drop.y * ratioDrop + other.y * ratioOther;

            drop.mass = totalMass;
            drop.radius = Math.sqrt(drop.mass);
            mergedIds.add(other.id);
          }
        }
      }

      if (drop.state === 'FLOWING' && drop.mass > this.config.criticalMass) {
        drop.trailCounter += drop.vy;
        const trailThreshold = drop.radius * 1.5;

        if (drop.trailCounter > trailThreshold) {
           if (Math.random() < this.config.trailDensity) {
             const trailMass = 2 + Math.random() * 5; // Small trail drop
             if (drop.mass > this.config.criticalMass + trailMass) {
                drop.mass -= trailMass;
                drop.radius = Math.sqrt(drop.mass);
                activeDrops.push({
                  id: this.nextId++,
                  x: drop.x,
                  y: drop.y - drop.radius, // Behind the drop
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

    this.drops = activeDrops.filter(d => !mergedIds.has(d.id));
  }

  spawnDrop() {
    const x = Math.random() * this.width;
    const y = Math.random() * this.height;
    const mass = 2 + Math.random() * 10;

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
}
