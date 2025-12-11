/**
 * WebGL Renderer (Three.js)
 *
 * Renders water droplets using Three.js with physics-based materials.
 * Features:
 * - MeshPhysicalMaterial for realistic glass refraction
 * - Proper IOR (Index of Refraction) for water/glass
 * - Fresnel effects at material boundaries
 * - Environment mapping for reflections
 */

import React, { useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import type { RendererProps, Drop } from '../types';

/**
 * A single water droplet mesh
 */
const DropletMesh: React.FC<{
  drop: Drop;
  viewWidth: number;
  viewHeight: number;
}> = ({ drop, viewWidth, viewHeight }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Convert normalized coordinates to 3D space
  // Map 0-1 to centered coordinates based on aspect ratio
  const x = (drop.x - 0.5) * viewWidth;
  const y = (0.5 - drop.y) * viewHeight; // Flip Y for 3D
  const z = 0;

  // Scale radius to 3D units
  // viewWidth/viewHeight are already in Three.js world units (not pixels)
  // drop.radius is in "design units" where ~20 is a large drop on a 640-wide canvas
  // So we scale: (drop.radius / 640) * viewWidth to get world units
  const r = (drop.radius / 640) * viewWidth;
  const sx = drop.stretchX ?? 1;
  const sy = drop.stretchY ?? 1;

  // Create material with glass-like properties
  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xffffff),
      metalness: 0,
      roughness: 0.05,
      transmission: 0.95, // Glass-like transmission
      thickness: r * 2, // Affects refraction
      ior: 1.4, // Index of refraction (water ~1.33, glass ~1.5)
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      envMapIntensity: 0.5,
      transparent: true,
      opacity: drop.opacity,
    });
  }, [r, drop.opacity]);

  return (
    <mesh
      ref={meshRef}
      position={[x, y, z]}
      rotation={[0, 0, drop.rotation ?? 0]}
      scale={[r * sx, r * sy, r * 0.5]} // Flatten in Z for 2D-like appearance
    >
      <sphereGeometry args={[1, 32, 32]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

/**
 * Scene containing all droplets
 */
const DropletScene: React.FC<{
  drops: Drop[];
}> = ({ drops }) => {
  const { viewport } = useThree();

  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.4} />

      {/* Main directional light (simulates sky/window light from top-left) */}
      <directionalLight
        position={[-5, 8, 10]}
        intensity={1.2}
        color="#ffffff"
      />

      {/* Secondary fill light */}
      <directionalLight
        position={[3, -2, 5]}
        intensity={0.3}
        color="#a0c0d0"
      />

      {/* Environment for reflections */}
      <Environment preset="city" />

      {/* Render all droplets */}
      {drops.map((drop) => (
        <DropletMesh
          key={drop.id}
          drop={drop}
          viewWidth={viewport.width}
          viewHeight={viewport.height}
        />
      ))}
    </>
  );
};

/**
 * Background plane that shows through the glass droplets
 */
const BackgroundPlane: React.FC = () => {
  const { viewport } = useThree();

  // Create gradient texture
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 512);
      gradient.addColorStop(0, '#4fa5b5');
      gradient.addColorStop(0.08, '#6aacb8');
      gradient.addColorStop(0.2, '#88b5bb');
      gradient.addColorStop(0.4, '#a0baba');
      gradient.addColorStop(0.6, '#afbfbf');
      gradient.addColorStop(0.8, '#b8c2c2');
      gradient.addColorStop(1, '#bec6c6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 512);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  return (
    <mesh position={[0, 0, -2]}>
      <planeGeometry args={[viewport.width * 1.5, viewport.height * 1.5]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
};

/**
 * WebGL Renderer Component
 */
export const WebGLRenderer: React.FC<RendererProps> = ({
  drops,
  className,
}) => {
  // Calculate camera position based on aspect ratio
  const cameraZ = 10;

  return (
    <div
      className={`wallpaper__webgl ${className || ''}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{
          position: [0, 0, cameraZ],
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 2]} // Limit pixel ratio for performance
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <BackgroundPlane />
        <DropletScene drops={drops} />
      </Canvas>
    </div>
  );
};

export default WebGLRenderer;
