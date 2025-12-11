/**
 * RainyDay-style Animated Renderer
 *
 * A custom implementation inspired by rainyday.js with physics-based
 * raindrop animation. Features non-linear gravity, trail drops, and
 * collision detection.
 */

import React, { useRef, useEffect } from 'react';
import type { RendererProps } from '../types';

/**
 * Animated droplet with physics properties matching rainyday.js behavior
 */
interface AnimatedDrop {
  id: number;
  x: number;
  y: number;
  r: number;
  xspeed: number;
  yspeed: number;
  opacity: number;
  seed: number;
  skipping: boolean;
  slowing: boolean;
}

const GRAVITY_THRESHOLD = 3;
const FPS = 30;
const GRAVITY_FORCE_Y = FPS * 0.001 / 25;
const GRAVITY_FORCE_X = 0;

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawDroplet(
  ctx: CanvasRenderingContext2D,
  drop: AnimatedDrop,
  reflectionCanvas: HTMLCanvasElement | null
): void {
  const { x, y, r, yspeed, opacity } = drop;

  ctx.save();
  ctx.globalAlpha = opacity;

  ctx.beginPath();

  if (r < 3) {
    ctx.arc(x, y, r, 0, Math.PI * 2);
  } else if (yspeed > 2) {
    const yr = 1 + 0.1 * yspeed;
    ctx.moveTo(x - r / yr, y);
    ctx.bezierCurveTo(x - r, y - r * 2, x + r, y - r * 2, x + r / yr, y);
    ctx.bezierCurveTo(x + r, y + yr * r, x - r, y + yr * r, x - r / yr, y);
  } else {
    ctx.arc(x, y, r * 0.9, 0, Math.PI * 2);
  }

  ctx.closePath();

  ctx.save();
  ctx.clip();

  if (reflectionCanvas) {
    const scale = 2;
    const srcX = Math.max(0, x - r * 4);
    const srcY = Math.max(0, y - r * 4);
    const srcW = r * 8;
    const srcH = r * 8;

    ctx.drawImage(
      reflectionCanvas,
      srcX / 5, srcY / 5, srcW / 5, srcH / 5,
      x - r * scale, y - r * scale, r * scale * 2, r * scale * 2
    );
  } else {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, 'rgba(255,255,255,0.2)');
    gradient.addColorStop(0.5, 'rgba(200,220,230,0.15)');
    gradient.addColorStop(0.8, 'rgba(100,140,160,0.2)');
    gradient.addColorStop(1, 'rgba(60,90,110,0.3)');
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  ctx.restore();

  const edgeGradient = ctx.createRadialGradient(x, y, r * 0.7, x, y, r);
  edgeGradient.addColorStop(0, 'rgba(0,0,0,0)');
  edgeGradient.addColorStop(0.8, 'rgba(40,60,70,0.15)');
  edgeGradient.addColorStop(1, 'rgba(30,50,60,0.25)');

  ctx.beginPath();
  if (r < 3) {
    ctx.arc(x, y, r, 0, Math.PI * 2);
  } else if (yspeed > 2) {
    const yr = 1 + 0.1 * yspeed;
    ctx.moveTo(x - r / yr, y);
    ctx.bezierCurveTo(x - r, y - r * 2, x + r, y - r * 2, x + r / yr, y);
    ctx.bezierCurveTo(x + r, y + yr * r, x - r, y + yr * r, x - r / yr, y);
  } else {
    ctx.arc(x, y, r * 0.9, 0, Math.PI * 2);
  }
  ctx.fillStyle = edgeGradient;
  ctx.fill();

  if (r > 4) {
    const hlX = x - r * 0.3;
    const hlY = y - r * 0.3;
    const hlGradient = ctx.createRadialGradient(hlX, hlY, 0, hlX, hlY, r * 0.4);
    hlGradient.addColorStop(0, 'rgba(255,255,255,0.8)');
    hlGradient.addColorStop(0.5, 'rgba(255,255,255,0.3)');
    hlGradient.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.beginPath();
    ctx.arc(hlX, hlY, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = hlGradient;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fill();
  }

  ctx.restore();
}

export const RainyDayRenderer: React.FC<RendererProps> = ({
  width,
  height,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropsRef = useRef<AnimatedDrop[]>([]);
  const reflectionRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>(0);
  const nextIdRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0 || height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const reflection = document.createElement('canvas');
    reflection.width = Math.floor(width / 5);
    reflection.height = Math.floor(height / 5);
    const reflCtx = reflection.getContext('2d');
    if (reflCtx) {
      const gradient = reflCtx.createLinearGradient(0, 0, 0, reflection.height);
      gradient.addColorStop(0, '#4fa5b5');
      gradient.addColorStop(0.08, '#6aacb8');
      gradient.addColorStop(0.2, '#88b5bb');
      gradient.addColorStop(0.4, '#a0baba');
      gradient.addColorStop(0.6, '#afbfbf');
      gradient.addColorStop(0.8, '#b8c2c2');
      gradient.addColorStop(1, '#bec6c6');
      reflCtx.fillStyle = gradient;
      reflCtx.fillRect(0, 0, reflection.width, reflection.height);
    }
    reflectionRef.current = reflection;

    const random = mulberry32(42);
    const drops: AnimatedDrop[] = [];

    for (let i = 0; i < 15; i++) {
      drops.push({
        id: nextIdRef.current++,
        x: random() * width,
        y: random() * height * 0.3,
        r: 8 + random() * 12,
        xspeed: 0,
        yspeed: 0,
        opacity: 0.7 + random() * 0.3,
        seed: Math.floor(random() * FPS * 10),
        skipping: false,
        slowing: false,
      });
    }

    for (let i = 0; i < 40; i++) {
      drops.push({
        id: nextIdRef.current++,
        x: random() * width,
        y: random() * height * 0.6,
        r: 4 + random() * 6,
        xspeed: 0,
        yspeed: 0,
        opacity: 0.5 + random() * 0.4,
        seed: Math.floor(random() * FPS * 10),
        skipping: random() > 0.5,
        slowing: false,
      });
    }

    for (let i = 0; i < 150; i++) {
      drops.push({
        id: nextIdRef.current++,
        x: random() * width,
        y: random() * height,
        r: 1 + random() * 2.5,
        xspeed: 0,
        yspeed: 0,
        opacity: 0.4 + random() * 0.4,
        seed: 0,
        skipping: false,
        slowing: false,
      });
    }

    dropsRef.current = drops;

    function createTrailDrop(parentDrop: AnimatedDrop): void {
      if (parentDrop.r < 4) return;

      const trailDrop: AnimatedDrop = {
        id: nextIdRef.current++,
        x: parentDrop.x + (Math.random() * 2 - 1),
        y: parentDrop.y - parentDrop.r - 5,
        r: Math.max(1, parentDrop.r / 5),
        xspeed: 0,
        yspeed: 0,
        opacity: parentDrop.opacity * 0.8,
        seed: 0,
        skipping: false,
        slowing: false,
      };

      dropsRef.current.push(trailDrop);
    }

    function applyGravity(drop: AnimatedDrop): boolean {
      if (drop.r <= GRAVITY_THRESHOLD) return true;

      if (drop.y - drop.r > height || drop.x - drop.r > width || drop.x + drop.r < 0) {
        return true;
      }

      if (drop.seed <= 0) {
        drop.seed = Math.floor(drop.r * Math.random() * FPS);
        drop.skipping = !drop.skipping;
        drop.slowing = true;
      }
      drop.seed--;

      if (drop.yspeed) {
        if (drop.slowing) {
          drop.yspeed /= 1.1;
          drop.xspeed /= 1.1;
          if (drop.yspeed < GRAVITY_FORCE_Y) {
            drop.slowing = false;
          }
        } else if (drop.skipping) {
          drop.yspeed = GRAVITY_FORCE_Y;
          drop.xspeed = GRAVITY_FORCE_X;
        } else {
          drop.yspeed += GRAVITY_FORCE_Y * drop.r;
          drop.xspeed += GRAVITY_FORCE_X * drop.r;
        }
      } else {
        drop.yspeed = GRAVITY_FORCE_Y;
        drop.xspeed = GRAVITY_FORCE_X;
      }

      drop.xspeed += (Math.random() - 0.5) * 0.1;

      drop.y += drop.yspeed;
      drop.x += drop.xspeed;

      if (drop.yspeed > 0.5 && Math.random() < 0.1) {
        createTrailDrop(drop);
      }

      return false;
    }

    function animate(): void {
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      const activeDrops: AnimatedDrop[] = [];

      for (const drop of dropsRef.current) {
        const stopped = applyGravity(drop);

        if (!stopped) {
          activeDrops.push(drop);
        } else if (drop.r > GRAVITY_THRESHOLD) {
          drop.y = -drop.r - Math.random() * 50;
          drop.x = Math.random() * width;
          drop.yspeed = 0;
          drop.xspeed = 0;
          drop.seed = Math.floor(drop.r * Math.random() * FPS);
          drop.skipping = Math.random() > 0.5;
          drop.slowing = false;
          activeDrops.push(drop);
        } else {
          activeDrops.push(drop);
        }
      }

      if (activeDrops.length > 500) {
        activeDrops.sort((a, b) => b.r - a.r);
        dropsRef.current = activeDrops.slice(0, 400);
      } else {
        dropsRef.current = activeDrops;
      }

      const sortedDrops = [...dropsRef.current].sort((a, b) => a.r - b.r);
      for (const drop of sortedDrops) {
        drawDroplet(ctx, drop, reflectionRef.current);
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      className={`wallpaper__rainyday ${className || ''}`}
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

export default RainyDayRenderer;