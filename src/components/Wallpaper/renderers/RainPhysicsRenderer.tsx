import React, { useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { RendererProps } from '../types';
import { createWallpaperGradientTexture } from './gradientTexture';

const parseFlag = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on') {
    return true;
  }
  if (normalized === 'false' || normalized === '0' || normalized === 'no' || normalized === 'off') {
    return false;
  }
  return fallback;
};

const parseNumber = (value: string | undefined, fallback: number) => {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
};

const ENABLE_THUNDER = parseFlag(import.meta.env.VITE_WALLPAPER_THUNDER, true);
const ENABLE_ZOOM = parseFlag(import.meta.env.VITE_WALLPAPER_ZOOM, true);
const FADE_SECONDS = parseNumber(import.meta.env.VITE_WALLPAPER_FADE_SECONDS, 10);
const REFERENCE_HEIGHT = 960;

const RainPlane: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const { size, gl } = useThree();

  const windowTexture = useMemo(() => createWallpaperGradientTexture(), []);

  const material = useMemo(() => {
    const shader = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector3(0, 0, 1) },
        iChannel0: { value: windowTexture },
        uEnableThunder: { value: ENABLE_THUNDER ? 1 : 0 },
        uEnableZoom: { value: ENABLE_ZOOM ? 1 : 0 },
        uFadeSeconds: { value: Math.max(0, FADE_SECONDS) },
        uReferenceHeight: { value: REFERENCE_HEIGHT }
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D iChannel0;
        uniform vec3 iResolution;
        uniform float iTime;
        uniform float uEnableThunder;
        uniform float uEnableZoom;
        uniform float uFadeSeconds;
        uniform float uReferenceHeight;

        varying vec2 vUv;

        #define S(a, b, t) smoothstep(a, b, t)

        vec3 N13(float p) {
          vec3 p3 = fract(vec3(p) * vec3(.1031,.11369,.13787));
          p3 += dot(p3, p3.yzx + 19.19);
          return fract(vec3((p3.x + p3.y) * p3.z, (p3.x + p3.z) * p3.y, (p3.y + p3.z) * p3.x));
        }

        float N(float t) {
          return fract(sin(t * 12345.564) * 7658.76);
        }

        float Saw(float b, float t) {
          return S(0., b, t) * S(1., b, t);
        }

        vec2 DropLayer2(vec2 uv, float t) {
          vec2 UV = uv;

          uv.y += t * 0.75;
          vec2 a = vec2(6., 1.);
          vec2 grid = a * 2.;
          vec2 id = floor(uv * grid);

          float colShift = N(id.x);
          uv.y += colShift;

          id = floor(uv * grid);
          vec3 n = N13(id.x * 35.2 + id.y * 2376.1);
          vec2 st = fract(uv * grid) - vec2(.5, 0);

          float x = n.x - .5;

          float y = UV.y * 20.;
          float wiggle = sin(y + sin(y));
          x += wiggle * (.5 - abs(x)) * (n.z - .5);
          x *= .7;
          float ti = fract(t + n.z);
          y = (Saw(.85, ti) - .5) * .9 + .5;
          vec2 p = vec2(x, y);

          float d = length((st - p) * a.yx);

          float mainDrop = S(.4, .0, d);

          float r = sqrt(S(1., y, st.y));
          float cd = abs(st.x - x);
          float trail = S(.23 * r, .15 * r * r, cd);
          float trailFront = S(-.02, .02, st.y - y);
          trail *= trailFront * r * r;

          y = UV.y;
          float trail2 = S(.2 * r, .0, cd);
          float droplets = max(0., (sin(y * (1. - y) * 120.) - st.y)) * trail2 * trailFront * n.z;
          y = fract(y * 10.) + (st.y - .5);
          float dd = length(st - vec2(x, y));
          droplets = S(.3, 0., dd);
          float m = mainDrop + droplets * r * trailFront;

          return vec2(m, trail);
        }

        float StaticDrops(vec2 uv, float t) {
          uv *= 40.;

          vec2 id = floor(uv);
          uv = fract(uv) - .5;
          vec3 n = N13(id.x * 107.45 + id.y * 3543.654);
          vec2 p = (n.xy - .5) * .7;
          float d = length(uv - p);

          float fade = Saw(.025, fract(t + n.z));
          float c = S(.3, 0., d) * fract(n.z * 10.) * fade;
          return c;
        }

        vec2 Drops(vec2 uv, float t, float l0, float l1, float l2) {
          float s = StaticDrops(uv, t) * l0;
          vec2 m1 = DropLayer2(uv, t) * l1;
          vec2 m2 = DropLayer2(uv * 1.85, t) * l2;

          float c = s + m1.x + m2.x;
          c = S(.3, 1., c);

          return vec2(c, max(m1.y * l0, m2.y * l1));
        }

        vec4 texLod(sampler2D sampler, vec2 uv, float lod) {
          #ifdef GL_EXT_shader_texture_lod
            return texture2DLodEXT(sampler, uv, lod);
          #else
            return texture2D(sampler, uv);
          #endif
        }

        void main() {
          vec2 frag = gl_FragCoord.xy - (iResolution.xy * 0.5);
          vec2 uv = frag / uReferenceHeight;
          vec2 UV = vUv;
          float T = iTime;

          float t = T * .2;
          float rainAmount = sin(T * .05) * .3 + .7;

          float maxBlur = mix(3., 6., rainAmount);
          float minBlur = 2.;

          float zoom = mix(0., -cos(T * .2), uEnableZoom);
          uv *= .7 + zoom * .3;
          UV = (UV - .5) * (.9 + zoom * .1) + .5;

          float staticDrops = S(-.5, 1., rainAmount) * 2.;
          float layer1 = S(.25, .75, rainAmount);
          float layer2 = S(.0, .5, rainAmount);

          vec2 c = Drops(uv, t, staticDrops, layer1, layer2);

          vec2 e = vec2(.001, 0.);
          float cx = Drops(uv + e, t, staticDrops, layer1, layer2).x;
          float cy = Drops(uv + e.yx, t, staticDrops, layer1, layer2).x;
          vec2 n = vec2(cx - c.x, cy - c.x);

          float focus = mix(maxBlur - c.y, minBlur, S(.1, .2, c.x));
          vec3 col = texLod(iChannel0, UV + n, focus).rgb;

          float t2 = (T + 3.) * .5;
          float colFade = sin(t2 * .2) * .5 + .5;
          float thunderMix = colFade * uEnableThunder;
          col *= mix(vec3(1.), vec3(.8, .9, 1.3), thunderMix);
          float fadeSeconds = max(uFadeSeconds, 0.0);
          float fade = fadeSeconds <= 0.0 ? 1.0 : S(0., fadeSeconds, T);
          float lightning = sin(t2 * sin(t2 * 10.));
          lightning *= pow(max(0., sin(t2 + sin(t2))), 10.);
          col *= 1. + lightning * fade * uEnableThunder;
          col *= 1. - dot(UV - .5, UV - .5);
          col *= fade;

          gl_FragColor = vec4(col, 1.);
        }
      `,
      transparent: false,
      depthWrite: false
    });

    (shader as THREE.ShaderMaterial & { extensions: { shaderTextureLOD?: boolean } }).extensions = {
      ...(shader.extensions || {}),
      shaderTextureLOD: true
    };

    return shader;
  }, [windowTexture]);

  useFrame((_, delta) => {
    material.uniforms.iTime.value += delta;
    const dpr = gl.getPixelRatio();
    material.uniforms.iResolution.value.set(
      size.width * dpr,
      size.height * dpr,
      (size.width * dpr) / Math.max(1, size.height * dpr)
    );
  });

  return (
    <mesh material={material} position={[0, 0, 0]}>
      <planeGeometry args={[width, height]} />
    </mesh>
  );
};

export const RainPhysicsRenderer: React.FC<RendererProps> = ({ width, height, className }) => {
  return (
    <div
      className={className}
      style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
    >
      <Canvas
        orthographic
        camera={{ position: [0, 0, 10], zoom: 1 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
      >
        <RainPlane width={width} height={height} />
      </Canvas>
    </div>
  );
};

export default RainPhysicsRenderer;
