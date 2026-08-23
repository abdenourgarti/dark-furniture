---
name: glsl-shaders
description: "Write custom GLSL shaders for the web: ShaderMaterial, vertex/fragment basics, uniforms and varyings, noise, fresnel rim light, gradients, dissolve and reveal effects, animated backgrounds, particle systems, extending Three.js PBR materials with onBeforeCompile or CustomShaderMaterial, and post-processing with @react-three/postprocessing (bloom, DOF, vignette, grain). Use when a look cannot be achieved with standard materials, or when asked for shader effects, WebGL background, particles, or bloom/glow."
metadata:
  author: local
  version: "1.0.0"
---

# GLSL & Post-Processing

Assumes `three-web-3d`. Reach for this only when standard materials genuinely cannot do the
job — a custom shader loses shadows, environment reflections, and tone mapping unless you
re-implement them.

## 1. Decide the route first

| Goal | Route |
|---|---|
| Glow, depth of field, grain, vignette, color grade | **Post-processing** (section 6). Not a shader. |
| Full-screen animated gradient / noise background | `ShaderMaterial` on a fullscreen plane |
| A PBR object with one extra effect (dissolve, vertex wobble) | **Extend** the standard material (section 4) — keeps lighting |
| Fully stylized look (toon, holographic, wireframe) | Custom `ShaderMaterial` |
| 10k+ animated points | `Points` + `ShaderMaterial`, or instancing |

Writing a `ShaderMaterial` from scratch for something that needed a `roughnessMap` is the most
common mistake here.

## 2. Minimal `ShaderMaterial` in R3F

```tsx
import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import { Color } from 'three'
import { useRef } from 'react'

const GradientMaterial = shaderMaterial(
  { uTime: 0, uColorA: new Color('#0b0b0d'), uColorB: new Color('#c9a227') },  // uniforms
  /* glsl vertex */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* glsl fragment */ `
    uniform float uTime;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    varying vec2 vUv;
    void main() {
      float t = vUv.y + sin(vUv.x * 3.0 + uTime * 0.3) * 0.1;
      vec3 col = mix(uColorA, uColorB, smoothstep(0.2, 0.9, t));
      gl_FragColor = vec4(col, 1.0);
      #include <colorspace_fragment>   // REQUIRED: converts linear → sRGB output
    }
  `
)
extend({ GradientMaterial })

function Backdrop() {
  const ref = useRef<any>(null)
  useFrame((_, d) => { ref.current.uTime += d })
  return (
    <mesh>
      <planeGeometry args={[10, 10, 1, 1]} />
      {/* @ts-expect-error drei shaderMaterial JSX typing */}
      <gradientMaterial ref={ref} />
    </mesh>
  )
}
```

Two things people forget:
- `#include <colorspace_fragment>` at the end of the fragment shader. Without it your custom
  colors are in a different color space from every standard material in the scene.
- `varying` must be declared identically in both shaders, and the vertex shader must write it.

TypeScript: declare the element in a `.d.ts` (`declare global { namespace JSX { interface IntrinsicElements { gradientMaterial: any } } }`).

## 3. The building blocks you will actually use

```glsl
// remap and clamp
float remap(float v, float a, float b, float c, float d) { return c + (v - a) * (d - c) / (b - a); }

// smooth edges — prefer over step()
float mask = smoothstep(0.4, 0.6, d);

// hash / value noise (cheap, no texture)
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}
// fractal brownian motion — organic movement
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
  return v;
}

// fresnel rim light — the single highest-value effect for premium product shots
float fresnel(vec3 normal, vec3 viewDir, float power) {
  return pow(1.0 - clamp(dot(normalize(normal), normalize(viewDir)), 0.0, 1.0), power);
}
```

For proper simplex/curl noise, import `glsl-noise` (`npm i glsl-noise`) rather than pasting
200 lines.

Keep aspect ratio correct in fullscreen shaders: pass `uResolution` and use
`vec2 uv = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);`

## 4. Extend a standard material — keeps lights, shadows, environment

This is usually what you want on an actual product. Two options:

**A. `onBeforeCompile`** — no extra dependency:

```tsx
const mat = useMemo(() => {
  const m = new THREE.MeshStandardMaterial({ color: '#8a6242', roughness: 0.7 })
  m.userData.uTime = { value: 0 }
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = m.userData.uTime
    shader.vertexShader = `uniform float uTime;\n` + shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
       transformed.y += sin(position.x * 4.0 + uTime) * 0.02;`
    )
  }
  return m
}, [])
useFrame((_, d) => { mat.userData.uTime.value += d })
```

**B. `three-custom-shader-material`** (`npm i three-custom-shader-material`) — far more
readable, and the right choice for anything non-trivial:

```tsx
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
// or the R3F component: import CSM from 'three-custom-shader-material'

<mesh geometry={geo}>
  <CSM baseMaterial={THREE.MeshPhysicalMaterial}
       vertexShader={vert} fragmentShader={frag}
       uniforms={uniforms} roughness={0.6} color="#8a6242" />
</mesh>
```

In CSM you write to `csm_Position`, `csm_Normal`, `csm_DiffuseColor`, `csm_Emissive`,
`csm_Roughness` and the base material handles all the lighting maths.

Useful injection points for `onBeforeCompile`: `#include <begin_vertex>` (position),
`#include <beginnormal_vertex>` (normals), `#include <dithering_fragment>` (final color).

## 5. Two effects worth having ready

**Dissolve / reveal** (fragment):

```glsl
uniform float uProgress;      // 0 → 1
uniform vec3  uEdgeColor;
varying vec3 vPos;
void main() {
  float n = fbm(vPos.xy * 3.0);
  if (n > uProgress) discard;
  float edge = smoothstep(uProgress - 0.05, uProgress, n);
  vec3 col = mix(baseColor, uEdgeColor * 3.0, edge);   // >1 so bloom catches it
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
```

**GPU particles** — one draw call for 50k points:

```tsx
const count = 50000
const positions = useMemo(() => {
  const a = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    a[i*3] = (Math.random()-0.5)*10; a[i*3+1] = Math.random()*6; a[i*3+2] = (Math.random()-0.5)*10
  }
  return a
}, [])

<points>
  <bufferGeometry>
    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
  </bufferGeometry>
  <pointsMaterial size={0.015} sizeAttenuation transparent depthWrite={false}
                  blending={THREE.AdditiveBlending} color="#c9a227" />
</points>
```

Animate positions in the **vertex shader** from `uTime` + a per-point random attribute.
Never loop over the position array on the CPU each frame.

## 6. Post-processing — the cheapest path to "expensive-looking"

```bash
npm i @react-three/postprocessing postprocessing
```

```tsx
import { EffectComposer, Bloom, DepthOfField, Vignette, Noise, ToneMapping } from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'

<EffectComposer multisampling={0} disableNormalPass>
  <Bloom intensity={0.5} luminanceThreshold={1.0} luminanceSmoothing={0.3} mipmapBlur kernelSize={KernelSize.LARGE} />
  <DepthOfField focusDistance={0.02} focalLength={0.05} bokehScale={3} />
  <Noise opacity={0.025} blendFunction={BlendFunction.OVERLAY} />
  <Vignette eskil={false} offset={0.25} darkness={0.7} />
</EffectComposer>
```

Rules that separate good from bad post:
- **Bloom needs HDR input.** Set `luminanceThreshold` at 1.0 and make the emissive material
  exceed it (`emissiveIntensity={3}`, or a color channel > 1). Thresholding at 0.2 blooms the
  entire image into mush — the #1 amateur tell.
- `mipmapBlur` is much faster and softer than the legacy kernel; use it.
- `multisampling={0}` + `disableNormalPass` unless an effect requires them.
- Post-processing disables the renderer's own tone mapping — add the `<ToneMapping>` effect
  last in the chain, or the scene renders flat.
- Grain at 0.02–0.03 opacity plus a subtle vignette makes almost any dark 3D scene look shot
  rather than rendered. Both are nearly free.
- Budget: 2–3 effects. DOF and SSAO are the expensive ones — disable them on mobile.

## 7. Performance and debugging

- Fragment shaders run **per pixel** — a `for` loop of 5 fbm octaves at 4K DPR2 is ~33M noise
  calls per frame. Reduce octaves, or render the shader to a lower-resolution render target.
- Avoid `if`/branching, `pow`, `sin` in tight loops. Prefer `mix`, `step`, `smoothstep`, `dot`.
- `discard` disables early-Z; use it sparingly.
- Shader compilation stalls the main thread on first render — call
  `gl.compile(scene, camera)` during the loading screen, or use drei `<Preload all />`.
- A shader that fails to compile logs the GLSL error with a line number to the console —
  read it; the line numbers refer to the **assembled** shader, so account for injected chunks.
- Debug by outputting values as color: `gl_FragColor = vec4(vec3(myFloat), 1.0);` and check
  that it is in 0–1 range. Black output usually means NaN or a negative value.
- Precision: declare `precision mediump float;` on mobile-heavy shaders; `highp` is the
  default in Three.js and costs on older GPUs.
