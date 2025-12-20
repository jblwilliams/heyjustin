import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial, OrthographicCamera } from '@react-three/drei';
import { PhysicsEngine } from '../PhysicsEngine';
import type { RendererProps } from '../types';

// Enhanced refraction shader with chromatic aberration and better lighting
const RefractionMaterial = shaderMaterial(
  {
    tBackground: null,
    uResolution: new THREE.Vector2(),
    uTime: 0,
    uIOR: 1.333, // Index of refraction for water
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec2 vScreenUv;
    varying vec3 vWorldNormal;

    void main() {
      vUv = uv;

      // Calculate screen-space UV for background sampling
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vec4 mvPosition = viewMatrix * worldPos;
      gl_Position = projectionMatrix * mvPosition;

      // Convert from clip space (-1 to 1) to texture space (0 to 1)
      vScreenUv = gl_Position.xy / gl_Position.w * 0.5 + 0.5;

      // Calculate world-space normal for lighting
      vec2 p = uv * 2.0 - 1.0;
      float r2 = dot(p, p);
      if (r2 <= 1.0) {
        vWorldNormal = vec3(p.x, p.y, sqrt(1.0 - r2));
      } else {
        vWorldNormal = vec3(0.0, 0.0, 1.0);
      }
    }
  `,
  // Fragment Shader
  `
    uniform sampler2D tBackground;
    uniform vec2 uResolution;
    uniform float uTime;
    uniform float uIOR;

    varying vec2 vUv;
    varying vec2 vScreenUv;
    varying vec3 vWorldNormal;

    void main() {
      // Create circular droplet shape
      vec2 p = vUv * 2.0 - 1.0;
      float r2 = dot(p, p);

      // Discard pixels outside the circle
      if (r2 > 1.0) discard;

      float r = sqrt(r2);
      vec3 normal = normalize(vWorldNormal);

      // Chromatic aberration - different IOR for R, G, B channels
      float iorR = uIOR * 0.98;  // Red refracts less
      float iorG = uIOR;          // Green is baseline
      float iorB = uIOR * 1.02;   // Blue refracts more

      float refractionStrength = 0.08;

      vec2 refractionR = normal.xy * refractionStrength * iorR;
      vec2 refractionG = normal.xy * refractionStrength * iorG;
      vec2 refractionB = normal.xy * refractionStrength * iorB;

      // Sample background with chromatic aberration
      float red = texture2D(tBackground, vScreenUv - refractionR).r;
      float green = texture2D(tBackground, vScreenUv - refractionG).g;
      float blue = texture2D(tBackground, vScreenUv - refractionB).b;

      vec3 refractedColor = vec3(red, green, blue);

      // Lighting calculations
      vec3 lightDir = normalize(vec3(-0.5, 0.8, 1.0));

      // Specular highlight (shiny spot where light hits)
      float specular = pow(max(dot(normal, lightDir), 0.0), 32.0);

      // Fresnel effect (edges are more reflective)
      float fresnel = pow(1.0 - normal.z, 2.5);

      // Ambient occlusion (subtle shadow for depth)
      float ao = 1.0 - (r * 0.2);

      // Combine all effects
      vec3 finalColor = refractedColor;
      finalColor *= ao;                              // Apply occlusion
      finalColor *= (1.0 - fresnel * 0.3);          // Darken edges slightly
      finalColor += vec3(1.0) * specular * 0.8;     // Add specular highlight
      finalColor += vec3(1.0) * fresnel * 0.15;     // Add edge glow

      gl_FragColor = vec4(finalColor, 0.95);
    }
  `
);

extend({ RefractionMaterial });

const BackgroundPlane: React.FC<{ texture: THREE.Texture }> = ({ texture }) => {
  const { viewport } = useThree();

  return (
    <mesh position={[0, 0, -1]}>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
};

const PhysicsScene: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const { viewport, size } = useThree();
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 960;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#d1d8d9');
    gradient.addColorStop(0.25, '#c9d0d1');
    gradient.addColorStop(0.6, '#bcc4c4');
    gradient.addColorStop(1, '#b5bcbc');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, []);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);

  const engine = useMemo(() => {
    return new PhysicsEngine(width, height);
  }, [width, height]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!instancedMeshRef.current) return;

    const dt = Math.min(delta, 0.1);
    engine.update(dt);

    console.log('Drops:', engine.drops.length, 'First drop:', engine.drops[0]);

    const drops = engine.drops;

    let i = 0;
    for (const drop of drops) {
       if (i >= instancedMeshRef.current.count) break;

       // Convert from physics coordinates (pixels) to Three.js world coordinates
       // Physics: (0,0) is top-left, (width, height) is bottom-right
       // Three.js: (0,0) is center, with viewport.width and viewport.height dimensions

       const x = (drop.x / width) * viewport.width - viewport.width / 2;
       const y = viewport.height / 2 - (drop.y / height) * viewport.height;

       // Scale the drop based on its radius
       // Multiply by 2 because the plane geometry is 1x1 and we need diameter
       const scale = (drop.radius / width) * viewport.width * 2;

       let scaleX = scale;
       let scaleY = scale;

       // Elongate drops when they're flowing
       if (drop.state === 'FLOWING') {
         const velocityFactor = Math.min(drop.vy * 0.1, 1.0);
         scaleY = scale * (1.0 + velocityFactor);
         scaleX = scale * (1.0 - velocityFactor * 0.3);
       }

       dummy.position.set(x, y, 0);
       dummy.scale.set(scaleX, scaleY, 1);
       dummy.rotation.set(0, 0, 0);
       dummy.updateMatrix();

       instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
       i++;
    }

    // Hide unused instances by scaling them to zero
    while (i < instancedMeshRef.current.count) {
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
      i++;
    }

    instancedMeshRef.current.instanceMatrix.needsUpdate = true;

    // Update shader uniforms
    const material = instancedMeshRef.current.material as THREE.ShaderMaterial;
    if (material.uniforms) {
        material.uniforms.uTime.value = state.clock.elapsedTime;
        material.uniforms.uResolution.value.set(size.width, size.height);
    }
  });

  return (
    <>
      <BackgroundPlane texture={texture} />
      <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, 4000]}>
        <planeGeometry args={[1, 1]} />
        {/* @ts-expect-error shaderMaterial creates custom element */}
        <refractionMaterial tBackground={texture} transparent={true} />
      </instancedMesh>
    </>
  );
};

export const PhysicsRenderer: React.FC<RendererProps> = ({ width, height, className }) => {
  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden'
      }}
    >
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: false }}
      >
        {/*
          CRITICAL FIX: Use proper orthographic camera bounds
          The viewport needs to match the pixel dimensions for correct rendering
        */}
        <OrthographicCamera
          makeDefault
          position={[0, 0, 10]}
          zoom={1}
        />
        <PhysicsScene width={width} height={height} />
      </Canvas>
    </div>
  );
};

export default PhysicsRenderer;
