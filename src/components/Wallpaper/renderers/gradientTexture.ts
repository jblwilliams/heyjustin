import * as THREE from 'three';

const readCssVar = (name: string, fallback: string): string => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return fallback;
  const wallpaperElement = document.querySelector('.wallpaper-container');
  const source = (wallpaperElement instanceof Element ? wallpaperElement : document.documentElement) as Element;
  const value = getComputedStyle(source).getPropertyValue(name).trim();
  return value || fallback;
};

export const createWallpaperGradientTexture = (width = 512, height = 1024) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  // Mirror `src/components/Wallpaper/Wallpaper.css` so the CSS fallback and the
  // shader renderer don't "pop" between two different gradients on first paint.
  gradient.addColorStop(0.0, readCssVar('--wallpaper-top', '#4fa5b5'));
  gradient.addColorStop(0.06, readCssVar('--wallpaper-upper', '#6aacb8'));
  gradient.addColorStop(0.16, readCssVar('--wallpaper-mid-upper', '#88b5bb'));
  gradient.addColorStop(0.36, readCssVar('--wallpaper-mid', '#a0baba'));
  gradient.addColorStop(0.56, readCssVar('--wallpaper-mid-lower', '#afbfbf'));
  gradient.addColorStop(0.76, readCssVar('--wallpaper-lower', '#b8c2c2'));
  gradient.addColorStop(0.92, readCssVar('--wallpaper-bottom', '#bec6c6'));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  // `texLod()` in the shader expects mipmaps to exist for higher "blur" levels.
  // Using a power-of-two canvas keeps WebGL1 + WebGL2 happy here.
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};
