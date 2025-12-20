import React, { useEffect, useRef } from 'react';
import {
  Camera,
  Color4,
  DynamicTexture,
  Engine,
  FreeCamera,
  HemisphericLight,
  MeshBuilder,
  Scene,
  Texture,
  Vector3
} from '@babylonjs/core';
import { PBRCustomMaterial } from '@babylonjs/materials/custom/pbrCustomMaterial';
import type { RendererProps } from '../types';

const setupRainMaterial = (scene: Scene) => {
  const material = new PBRCustomMaterial('rainDrop', scene);

  material.metallic = 0;
  material.roughness = 1;

  material.AddUniform('iTime', 'float', 0);
  material.AddUniform('iResolution', 'vec3', new Vector3(0, 0, 1));
  material.AddUniform('iChannel0', 'sampler2D', null);
  material.AddAttribute('uv');

  material.Vertex_Definitions(`
    attribute vec2 uv;
    varying vec2 vUV;
  `);

  material.Vertex_MainEnd(`
    vUV = uv;
  `);

  material.Fragment_Definitions(
    `
    varying vec2 vUV;

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
    `
  );

  material.Fragment_MainEnd(
    `
    vec2 uv = (vUV - 0.5) * iResolution.y / iResolution.x;
    vec2 UV = vUV;
    float T = iTime;

    float t = T * .2;
    float rainAmount = sin(T * .05) * .3 + .7;

    float maxBlur = mix(3., 6., rainAmount);
    float minBlur = 2.;

    float zoom = -cos(T * .2);
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
    vec3 col = texture2D(iChannel0, UV + n).rgb;

    float t2 = (T + 3.) * .5;
    float colFade = sin(t2 * .2) * .5 + .5;
    col *= mix(vec3(1.), vec3(.8, .9, 1.3), colFade);
    float fade = S(0., 10., T);
    float lightning = sin(t2 * sin(t2 * 10.));
    lightning *= pow(max(0., sin(t2 + sin(t2))), 10.);
    col *= 1. + lightning * fade;
    col *= 1. - dot(UV - .5, UV - .5);
    col *= fade;

    gl_FragColor = vec4(col, 1.);
    `
  );

  return material;
};

export const BabylonRenderer: React.FC<RendererProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: false });

    const scene = new Scene(engine);
    scene.clearColor = new Color4(0, 0, 0, 0);

    const camera = new FreeCamera('camera', new Vector3(0, 0, -10), scene);
    camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
    camera.setTarget(Vector3.Zero());

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const plane = MeshBuilder.CreatePlane('rainPlane', { size: 2 }, scene);

    const texture = new DynamicTexture('rainBackground', { width: 640, height: 960 }, scene, false);
    const ctx = texture.getContext();
    const gradient = ctx.createLinearGradient(0, 0, 0, 960);
    gradient.addColorStop(0, '#d1d8d9');
    gradient.addColorStop(0.25, '#c9d0d1');
    gradient.addColorStop(0.6, '#bcc4c4');
    gradient.addColorStop(1, '#b5bcbc');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 640, 960);
    texture.wrapU = Texture.CLAMP_ADDRESSMODE;
    texture.wrapV = Texture.CLAMP_ADDRESSMODE;
    texture.update(false);

    const material = setupRainMaterial(scene);
    plane.material = material;

    let time = 0;

    const updateSizing = () => {
      const width = engine.getRenderWidth();
      const height = engine.getRenderHeight();
      const aspect = width / Math.max(1, height);
      camera.orthoLeft = -aspect;
      camera.orthoRight = aspect;
      camera.orthoTop = 1;
      camera.orthoBottom = -1;
      plane.scaling.set(aspect, 1, 1);
    };

    updateSizing();

    material.onBindObservable.add(() => {
      const effect = material.getEffect();
      if (!effect) return;
      effect.setVector3(
        'iResolution',
        new Vector3(
          engine.getRenderWidth(),
          engine.getRenderHeight(),
          engine.getRenderWidth() / Math.max(1, engine.getRenderHeight())
        )
      );
      effect.setFloat('iTime', time);
      effect.setTexture('iChannel0', texture);
    });

    engine.runRenderLoop(() => {
      time += engine.getDeltaTime() * 0.001;
      scene.render();
    });

    const handleResize = () => {
      engine.resize();
      updateSizing();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      scene.dispose();
      engine.dispose();
    };
  }, []);

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
};

export default BabylonRenderer;
