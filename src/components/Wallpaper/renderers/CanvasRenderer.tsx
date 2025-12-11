/**
 * Canvas 2D Renderer
 *
 * Renders water droplets using HTML5 Canvas for pixel-level control.
 * Key features:
 * - Bezier curves for organic shapes
 * - Radial gradients for 3D depth
 * - Compositing modes for realistic layering
 * - Optional pixel displacement for subtle refraction
 */

import React, { useRef, useEffect, useCallback } from 'react';
import type { RendererProps, Drop } from '../types';

/**
 * Draw a single droplet on the canvas
 */
function drawDroplet(
  ctx: CanvasRenderingContext2D,
  drop: Drop,
  width: number,
  height: number
): void {
  const cx = drop.x * width;
  const cy = drop.y * height;
  const r = drop.radius * (width / 640);
  const sx = drop.stretchX ?? 1;
  const sy = drop.stretchY ?? 1;
  const rotation = drop.rotation ?? 0;

  ctx.save();
  ctx.globalAlpha = drop.opacity;
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  const rx = r * sx;
  const ry = r * sy;

  if (drop.type === 'large' || drop.type === 'medium') {
    // Draw shadow
    ctx.save();
    ctx.globalAlpha = drop.opacity * 0.15;
    ctx.translate(r * 0.08, r * 0.4);
    ctx.scale(1, 0.35);
    ctx.beginPath();
    ctx.arc(0, 0, rx * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.filter = 'blur(3px)';
    ctx.fill();
    ctx.filter = 'none';
    ctx.restore();

    // Draw main body with gradient edge
    const bodyGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(rx, ry));
    bodyGradient.addColorStop(0, 'rgba(255,255,255,0.06)');
    bodyGradient.addColorStop(0.6, 'rgba(255,255,255,0.02)');
    bodyGradient.addColorStop(0.82, 'rgba(255,255,255,0.01)');
    bodyGradient.addColorStop(0.88, 'rgba(60,80,90,0.15)');
    bodyGradient.addColorStop(0.94, 'rgba(40,60,70,0.35)');
    bodyGradient.addColorStop(1, 'rgba(30,50,60,0.25)');

    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = bodyGradient;
    ctx.fill();

    // Inner lens brightening
    ctx.globalAlpha = drop.opacity * 0.5;
    const lensGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(rx, ry) * 0.6);
    lensGradient.addColorStop(0, 'rgba(255,255,255,0.08)');
    lensGradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 0.6, ry * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = lensGradient;
    ctx.fill();

    // Caustic at bottom
    ctx.globalAlpha = drop.opacity * 0.7;
    const causticGradient = ctx.createRadialGradient(
      0, ry * 0.4, 0,
      0, ry * 0.4, rx * 0.5
    );
    causticGradient.addColorStop(0, 'rgba(255,255,255,0.25)');
    causticGradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.ellipse(0, ry * 0.4, rx * 0.45, ry * 0.12, 0, 0, Math.PI * 2);
    ctx.fillStyle = causticGradient;
    ctx.fill();

    // Main highlight arc
    ctx.globalAlpha = drop.opacity;
    const highlightGradient = ctx.createRadialGradient(
      -rx * 0.28, -ry * 0.28, 0,
      -rx * 0.28, -ry * 0.28, rx * 0.45
    );
    highlightGradient.addColorStop(0, 'rgba(255,255,255,0.9)');
    highlightGradient.addColorStop(0.5, 'rgba(255,255,255,0.35)');
    highlightGradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.ellipse(-rx * 0.28, -ry * 0.28, rx * 0.38, ry * 0.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = highlightGradient;
    ctx.fill();

    // Sharp specular highlight
    ctx.globalAlpha = drop.opacity;
    ctx.beginPath();
    ctx.ellipse(-rx * 0.35, -ry * 0.35, rx * 0.1, ry * 0.08, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fill();

    // Secondary small highlight
    if (drop.type === 'large') {
      ctx.beginPath();
      ctx.arc(-rx * 0.42, -ry * 0.28, r * 0.04, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fill();
    }
  } else {
    // Small drops - simpler rendering
    const smallGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(rx, ry));
    smallGradient.addColorStop(0, 'rgba(255,255,255,0.08)');
    smallGradient.addColorStop(0.6, 'rgba(255,255,255,0.03)');
    smallGradient.addColorStop(0.85, 'rgba(50,70,80,0.2)');
    smallGradient.addColorStop(1, 'rgba(40,60,70,0.15)');

    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = smallGradient;
    ctx.fill();

    // Small highlight
    const smallHighlight = ctx.createRadialGradient(
      -rx * 0.2, -ry * 0.2, 0,
      -rx * 0.2, -ry * 0.2, rx * 0.4
    );
    smallHighlight.addColorStop(0, 'rgba(255,255,255,0.7)');
    smallHighlight.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.ellipse(-rx * 0.2, -ry * 0.2, rx * 0.3, ry * 0.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = smallHighlight;
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Canvas 2D Renderer Component
 */
export const CanvasRenderer: React.FC<RendererProps> = ({
  drops,
  width,
  height,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const canvasWidth = width * dpr;
    const canvasHeight = height * dpr;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const sortedDrops = [...drops].sort((a, b) => a.radius - b.radius);

    for (const drop of sortedDrops) {
      drawDroplet(ctx, drop, width, height);
    }
  }, [drops, width, height]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const handleResize = () => {
      requestAnimationFrame(draw);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className={`wallpaper__canvas ${className || ''}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
};

export default CanvasRenderer;