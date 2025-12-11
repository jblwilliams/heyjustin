/**
 * Wallpaper Component
 *
 * A scalable recreation of the iconic iOS 6 water droplet wallpaper.
 * Supports multiple rendering backends selectable via environment variable:
 *
 * VITE_WALLPAPER_RENDERER=svg     - SVG with gradients (default)
 * VITE_WALLPAPER_RENDERER=canvas  - Canvas 2D
 * VITE_WALLPAPER_RENDERER=webgl   - Three.js/WebGL
 * VITE_WALLPAPER_RENDERER=rainyday - rainyday.js library
 */

import React, { useMemo, useRef, useEffect, useState } from 'react';
import './Wallpaper.css';
import { createDrops } from './raindrops';
import { SVGRenderer, CanvasRenderer, WebGLRenderer, RainyDayRenderer } from './renderers';
import type { WallpaperProps, RendererType, RendererComponent, Drop } from './types';

/**
 * Get the renderer type from environment variable
 */
const getRendererType = (): RendererType => {
  const env = import.meta.env.VITE_WALLPAPER_RENDERER as string | undefined;
  if (env === 'canvas' || env === 'webgl' || env === 'rainyday' || env === 'svg') {
    return env;
  }
  return 'svg'; // Default fallback
};

/**
 * Map of renderer types to components
 */
const renderers: Record<RendererType, RendererComponent> = {
  svg: SVGRenderer,
  canvas: CanvasRenderer,
  webgl: WebGLRenderer,
  rainyday: RainyDayRenderer,
};

/**
 * Main Wallpaper Component
 *
 * Renders the iOS 6 raindrop wallpaper using the configured renderer.
 */
export const Wallpaper: React.FC<WallpaperProps> = ({
  children,
  className,
  dropCount = 300,
  seed = 42,
  variant = 'default',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 640, height: 960 });

  // Get the renderer component based on env var
  const rendererType = getRendererType();
  const Renderer = renderers[rendererType];

  // Generate drops (memoized for performance)
  const drops = useMemo<Drop[]>(
    () => createDrops(dropCount, seed),
    [dropCount, seed]
  );

  // Track container dimensions for renderers that need them
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width || 640,
          height: rect.height || 960,
        });
      }
    };

    updateDimensions();

    // Update on resize
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const containerClasses = [
    'wallpaper-container',
    variant === 'dark' ? 'wallpaper-container--dark' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div ref={containerRef} className={containerClasses}>
      {/* Renderer indicator (dev only) */}
      {import.meta.env.DEV && (
        <div
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            fontSize: 9,
            color: 'rgba(255,255,255,0.4)',
            zIndex: 999,
            fontFamily: 'monospace',
            pointerEvents: 'none',
          }}
        >
          {rendererType}
        </div>
      )}

      {/* Render drops using selected renderer */}
      <Renderer
        drops={drops}
        width={dimensions.width}
        height={dimensions.height}
      />

      {/* Content layer */}
      {children && <div className="wallpaper__content">{children}</div>}
    </div>
  );
};

export default Wallpaper;
