import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial, useTexture, OrthographicCamera } from '@react-three/drei';
import { PhysicsEngine } from '../PhysicsEngine';
import type { RendererProps } from '../types';
import bgUrl from '../../../assets/wallpaper.jpg';

const RefractionMaterial = shaderMaterial(
  {
    tBackground: null,
    uResolution: new THREE.Vector2(),
    uTime: 0,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec2 vScreenUv;

    void main() {
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vec4 mvPosition = viewMatrix * worldPos;
      gl_Position = projectionMatrix * mvPosition;
      vScreenUv = gl_Position.xy / gl_Position.w * 0.5 + 0.5;
    }
  `,
  // Fragment Shader
  `
    uniform sampler2D tBackground;
    uniform vec2 uResolution;
    uniform float uTime;

    varying vec2 vUv;
    varying vec2 vScreenUv;

    void main() {
      vec2 p = vUv * 2.0 - 1.0;
      float r2 = dot(p, p);
      if (r2 > 1.0) discard;

      float r = sqrt(r2);
      vec3 normal = vec3(p.x, p.y, sqrt(1.0 - r2));

      float refractionStrength = 0.05;
      vec2 refractionOffset = normal.xy * refractionStrength;
      vec2 sampleUv = vScreenUv - refractionOffset;
      vec4 bgColor = texture2D(tBackground, sampleUv);

      vec3 lightDir = normalize(vec3(-0.5, 0.8, 1.0));
      float specular = pow(max(dot(normal, lightDir), 0.0), 16.0);
      float fresnel = pow(1.0 - normal.z, 3.0);

      vec3 finalColor = bgColor.rgb;
      finalColor *= (1.0 - fresnel * 0.4);
      finalColor += vec3(1.0) * specular * 0.6;
      gl_FragColor = vec4(finalColor, 0.9);
    }
  `
);

extend({ RefractionMaterial });

const BackgroundPlane: React.FC = () => {
  const texture = useTexture(bgUrl);
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
  const texture = useTexture(bgUrl);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);

  const engine = useMemo(() => {
    return new PhysicsEngine(width, height);
  }, [width, height]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!instancedMeshRef.current) return;

    const dt = Math.min(delta, 0.1);
    engine.update(dt);

    const drops = engine.drops;

    let i = 0;
    for (const drop of drops) {
       if (i >= instancedMeshRef.current.count) break;

       const x = (drop.x / width) * viewport.width - viewport.width / 2;
       const y = viewport.height / 2 - (drop.y / height) * viewport.height;
       const scale = (drop.radius / width) * viewport.width * 2;

       let scaleX = scale;
       let scaleY = scale;
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

    while (i < instancedMeshRef.current.count) {
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
      i++;
    }

    instancedMeshRef.current.instanceMatrix.needsUpdate = true;

    const material = instancedMeshRef.current.material as THREE.ShaderMaterial;
    if (material.uniforms) {
        material.uniforms.uTime.value = state.clock.elapsedTime;
        material.uniforms.uResolution.value.set(size.width, size.height);
    }
  });

  return (
    <>
      <BackgroundPlane />
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
        <OrthographicCamera
          makeDefault
          position={[0, 0, 10]}
          zoom={1}
          left={-width/2}
          right={width/2}
          top={height/2}
          bottom={-height/2}
        />
        <PhysicsScene width={width} height={height} />
      </Canvas>
    </div>
  );
};

export default PhysicsRenderer;
