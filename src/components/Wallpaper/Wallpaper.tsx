/**
 * Wallpaper Component
 *
 * A scalable recreation of the iconic iOS 6 water droplet wallpaper.
 * VITE_WALLPAPER_THUNDER=true/false - Enable lightning/thunder in shader renderer
 * VITE_WALLPAPER_FADE_SECONDS=10 - Fade-in duration (0 disables)
 * VITE_WALLPAPER_ZOOM=true/false - Enable subtle zoom drift in shader renderer
 */

import React, { useMemo, useRef, useEffect, useState } from 'react';
import './Wallpaper.css';
import { createDrops } from './raindrops';
import { RainPhysicsRenderer } from './renderers/RainPhysicsRenderer';
import type { WallpaperProps, Drop } from './types';

/**
 * Main Wallpaper Component
 *
 * Renders the iOS 6 raindrop wallpaper.
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

  // Generate drops (memoized for performance)
  const drops = useMemo<Drop[]>(
    () => createDrops(dropCount, seed),
    [dropCount, seed]
  );

  // Track container dimensions for the renderer
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
      <RainPhysicsRenderer
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
