/**
 * Wallpaper Types
 *
 * Shared TypeScript interfaces for the iOS 6 raindrop wallpaper
 * and all renderer implementations.
 */

/**
 * A single water droplet with position, size, and shape data
 */
export interface Drop {
  id: number;
  /** X position (0-1 normalized, left to right) */
  x: number;
  /** Y position (0-1 normalized, top to bottom) */
  y: number;
  /** Base radius in SVG/canvas units */
  radius: number;
  /** Transparency level (0-1) */
  opacity: number;
  /** Droplet size category */
  type: 'small' | 'medium' | 'large';
  /** Horizontal stretch ratio for organic shapes (1.0 = circle) */
  stretchX?: number;
  /** Vertical stretch ratio for organic shapes */
  stretchY?: number;
  /** Rotation angle in radians for non-circular shapes */
  rotation?: number;
  /** Optional depth-of-field blur amount */
  blur?: number;
}

/**
 * Props shared by all renderer implementations
 */
export interface RendererProps {
  /** Array of drops to render */
  drops: Drop[];
  /** Viewport width for coordinate mapping */
  width: number;
  /** Viewport height for coordinate mapping */
  height: number;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Props for the main Wallpaper component
 */
export interface WallpaperProps {
  /** Content to render on top of wallpaper */
  children?: React.ReactNode;
  /** Optional CSS class name */
  className?: string;
  /** Number of droplets to generate (default: 300) */
  dropCount?: number;
  /** Random seed for reproducible patterns (default: 42) */
  seed?: number;
  /** Color variant */
  variant?: 'default' | 'dark';
}

/**
 * Available renderer types
 */
export type RendererType = 'svg' | 'canvas' | 'webgl' | 'rainyday' | 'physics';

/**
 * Renderer component type
 */
export type RendererComponent = React.FC<RendererProps>;
