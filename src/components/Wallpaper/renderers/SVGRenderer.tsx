/**
 * SVG Renderer
 *
 * Renders water droplets using SVG with improved gradients and organic shapes.
 * Key improvements over original:
 * - No thick stroke outlines - uses gradient-based edges
 * - Organic elliptical shapes with rotation
 * - Multi-layer gradients for lens illusion
 * - Sharp highlight at 10-11 o'clock position
 * - Caustic glow at bottom of drops
 */

import React from 'react';
import type { RendererProps, Drop } from '../types';

// SVG viewBox dimensions
const VIEWBOX_WIDTH = 640;
const VIEWBOX_HEIGHT = 960;

/**
 * Renders a single water droplet with realistic glass-like appearance
 */
const Droplet: React.FC<{ drop: Drop }> = ({ drop }) => {
  const cx = drop.x * VIEWBOX_WIDTH;
  const cy = drop.y * VIEWBOX_HEIGHT;
  const r = drop.radius;
  const sx = drop.stretchX ?? 1;
  const sy = drop.stretchY ?? 1;
  const rotation = (drop.rotation ?? 0) * (180 / Math.PI); // Convert to degrees

  // Create unique gradient IDs for this drop
  const bodyGradientId = `drop-body-${drop.id}`;
  const edgeGradientId = `drop-edge-${drop.id}`;

  // Large drops - full detail with subtle edge, lens effect, and highlights
  if (drop.type === 'large') {
    return (
      <g
        opacity={drop.opacity}
        transform={`rotate(${rotation} ${cx} ${cy})`}
      >
        <defs>
          {/* Body gradient - transparent center with subtle dark edge */}
          <radialGradient id={bodyGradientId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="82%" stopColor="rgba(255,255,255,0.01)" />
            <stop offset="88%" stopColor="rgba(60,80,90,0.15)" />
            <stop offset="94%" stopColor="rgba(40,60,70,0.35)" />
            <stop offset="100%" stopColor="rgba(30,50,60,0.25)" />
          </radialGradient>
          {/* Edge enhancement gradient */}
          <radialGradient id={edgeGradientId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="85%" stopColor="transparent" />
            <stop offset="95%" stopColor="rgba(40,55,65,0.2)" />
            <stop offset="100%" stopColor="rgba(30,45,55,0.1)" />
          </radialGradient>
        </defs>

        {/* Shadow beneath drop */}
        <ellipse
          cx={cx + r * 0.08}
          cy={cy + r * 0.45}
          rx={r * sx * 0.7}
          ry={r * sy * 0.25}
          fill="rgba(0,0,0,0.12)"
          filter="url(#shadow-blur)"
        />

        {/* Main drop body with integrated edge */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={r * sx}
          ry={r * sy}
          fill={`url(#${bodyGradientId})`}
        />

        {/* Subtle edge enhancement layer */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={r * sx}
          ry={r * sy}
          fill={`url(#${edgeGradientId})`}
        />

        {/* Inner lens effect - slight brightness in center */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={r * sx * 0.6}
          ry={r * sy * 0.6}
          fill="rgba(255,255,255,0.04)"
        />

        {/* Caustic at bottom - light focusing through drop */}
        <ellipse
          cx={cx}
          cy={cy + r * sy * 0.4}
          rx={r * sx * 0.45}
          ry={r * sy * 0.12}
          fill="rgba(255,255,255,0.18)"
        />

        {/* Main highlight arc - soft glow at top-left */}
        <ellipse
          cx={cx - r * sx * 0.28}
          cy={cy - r * sy * 0.28}
          rx={r * sx * 0.38}
          ry={r * sy * 0.25}
          fill="url(#highlight-arc)"
        />

        {/* Sharp specular highlight - bright point */}
        <ellipse
          cx={cx - r * sx * 0.35}
          cy={cy - r * sy * 0.35}
          rx={r * sx * 0.1}
          ry={r * sy * 0.08}
          fill="rgba(255,255,255,0.95)"
        />

        {/* Secondary smaller highlight */}
        <circle
          cx={cx - r * sx * 0.42}
          cy={cy - r * sy * 0.28}
          r={r * 0.04}
          fill="rgba(255,255,255,0.7)"
        />
      </g>
    );
  }

  // Medium drops - similar but simpler
  if (drop.type === 'medium') {
    return (
      <g
        opacity={drop.opacity}
        transform={`rotate(${rotation} ${cx} ${cy})`}
      >
        <defs>
          <radialGradient id={bodyGradientId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="65%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="85%" stopColor="rgba(60,80,90,0.12)" />
            <stop offset="95%" stopColor="rgba(40,60,70,0.3)" />
            <stop offset="100%" stopColor="rgba(35,55,65,0.2)" />
          </radialGradient>
        </defs>

        {/* Subtle shadow */}
        <ellipse
          cx={cx + r * 0.05}
          cy={cy + r * 0.35}
          rx={r * sx * 0.6}
          ry={r * sy * 0.2}
          fill="rgba(0,0,0,0.08)"
          filter="url(#shadow-blur)"
        />

        {/* Drop body */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={r * sx}
          ry={r * sy}
          fill={`url(#${bodyGradientId})`}
        />

        {/* Caustic */}
        <ellipse
          cx={cx}
          cy={cy + r * sy * 0.35}
          rx={r * sx * 0.35}
          ry={r * sy * 0.1}
          fill="rgba(255,255,255,0.15)"
        />

        {/* Highlight arc */}
        <ellipse
          cx={cx - r * sx * 0.25}
          cy={cy - r * sy * 0.25}
          rx={r * sx * 0.32}
          ry={r * sy * 0.2}
          fill="url(#highlight-soft)"
        />

        {/* Specular point */}
        <ellipse
          cx={cx - r * sx * 0.32}
          cy={cy - r * sy * 0.32}
          rx={r * sx * 0.08}
          ry={r * sy * 0.06}
          fill="rgba(255,255,255,0.9)"
        />
      </g>
    );
  }

  // Small/tiny drops - simplified with gradient edge
  return (
    <g
      opacity={drop.opacity}
      transform={`rotate(${rotation} ${cx} ${cy})`}
    >
      <defs>
        <radialGradient id={bodyGradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0.03)" />
          <stop offset="85%" stopColor="rgba(50,70,80,0.2)" />
          <stop offset="100%" stopColor="rgba(40,60,70,0.15)" />
        </radialGradient>
      </defs>

      {/* Drop body with integrated edge */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={r * sx}
        ry={r * sy}
        fill={`url(#${bodyGradientId})`}
      />

      {/* Small highlight */}
      <ellipse
        cx={cx - r * sx * 0.25}
        cy={cy - r * sy * 0.25}
        rx={r * sx * 0.3}
        ry={r * sy * 0.25}
        fill="rgba(255,255,255,0.65)"
      />
    </g>
  );
};

/**
 * SVG Renderer Component
 */
export const SVGRenderer: React.FC<RendererProps> = ({
  drops,
  className,
}) => {
  return (
    <svg
      className={`wallpaper__svg ${className || ''}`}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
    >
      <defs>
        {/* Shared gradient definitions */}

        {/* Highlight arc gradient */}
        <radialGradient id="highlight-arc" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>

        {/* Softer highlight for medium drops */}
        <radialGradient id="highlight-soft" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.75)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0.2)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>

        {/* Shadow blur filter */}
        <filter id="shadow-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>

      {/* Render all droplets */}
      {drops.map((drop) => (
        <Droplet key={drop.id} drop={drop} />
      ))}
    </svg>
  );
};

export default SVGRenderer;