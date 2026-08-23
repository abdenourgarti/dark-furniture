---
name: three-web-3d
description: "Build real 3D websites with Three.js and React Three Fiber. Use when the user asks for a 3D website, WebGL scene, interactive 3D hero, 3D landing page, rotating product, 3D canvas, r3f / @react-three/fiber, drei, or anything rendered with a GPU in the browser. Covers stack choice, scene architecture, renderer and color settings, lighting, PBR materials, cameras, controls, resize, and teardown. Load BEFORE writing the first line of 3D code."
metadata:
  author: local
  version: "1.0.0"
---

# Three.js / R3F — Foundation for 3D Websites

Load this first for any 3D web work. Then load the sibling skill that matches the job:
`gltf-pipeline` (assets), `r3f-product-viewer` (configurator), `scroll-3d-motion` (scroll),
`glsl-shaders` (custom materials), `webgl-performance` (budget, mobile).

## 1. Pick the stack — decide before coding

| Need | Stack |
|---|---|
| One product, rotate + zoom, minimal code, AR on mobile | `<model-viewer>` web component |
| Marketing site, React/Next.js, several 3D sections | **React Three Fiber + drei** ← default |
| One bespoke WebGL hero, no React, max control | Vanilla Three.js |
| Scroll-driven scenes, heavy motion design | R3F + GSAP ScrollTrigger + Lenis |

Default for a modern site: **Next.js (App Router) + React Three Fiber + drei**.

```bash
npm i three @react-three/fiber @react-three/drei
npm i -D @types/three
# optional, per need:
npm i @react-three/postprocessing leva gsap lenis
```

Version discipline: `three`, `@react-three/fiber` and `@react-three/drei` must be
compatible. Pin them, and never mix a `three` from a nested dependency — check with
`npm ls three`; more than one copy means broken `instanceof` checks and silent black screens.

## 2. Next.js: the canvas is client-only

```tsx
// components/Scene.tsx
'use client'
import { Canvas } from '@react-three/fiber'

export default function Scene({ children }: { children: React.ReactNode }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}                        // never render above 2x, even on 3x phones
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 1.2, 4], fov: 35 }}
    >
      {children}
    </Canvas>
  )
}
```

```tsx
// app/page.tsx — keep WebGL out of the server bundle
import dynamic from 'next/dynamic'
const Scene = dynamic(() => import('@/components/Scene'), { ssr: false })
```

Rule: never import `three` from a server component, or from a module a server component
pulls in transitively.

## 3. Color and tone mapping — the #1 reason 3D looks cheap

Three.js r152+ defaults are already correct; do not fight them.

- Renderer output is sRGB by default. Leave `gl.outputColorSpace` alone.
- **Color textures** (albedo / basecolor / emissive) → `texture.colorSpace = THREE.SRGBColorSpace`
- **Data textures** (normal, roughness, metalness, AO, displacement) → leave `NoColorSpace`
- Set tone mapping deliberately:

```tsx
import { ACESFilmicToneMapping } from 'three'
<Canvas gl={{ toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.1 }} />
```

`ACESFilmic` = cinematic, gently rolls off highlights (good for dark, moody product sites).
`AgXToneMapping` (r167+) = more neutral, better hue retention on saturated colors.
`NoToneMapping` = flat, only for stylized / flat-shaded looks.

Getting one of these wrong makes everything look washed out or plastic. Check it first when
a render "looks wrong".

## 4. Lighting: environment first, lights second

A single HDRI does 80% of the work on product and interior scenes. Do not build a scene out
of five point lights.

```tsx
import { Environment, ContactShadows } from '@react-three/drei'

<>
  {/* image-based lighting — drives all PBR reflections */}
  <Environment preset="studio" environmentIntensity={0.8} />
  {/* one key light for shape and shadow direction */}
  <directionalLight
    position={[4, 6, 3]}
    intensity={2.5}
    castShadow
    shadow-mapSize={[2048, 2048]}
    shadow-bias={-0.0005}
  />
  <ambientLight intensity={0.15} />
  {/* cheap, beautiful ground contact — better than a shadow-catching plane */}
  <ContactShadows position={[0, -0.01, 0]} opacity={0.55} scale={12} blur={2.4} far={4} />
</>
```

drei `Environment` presets: `studio`, `city`, `apartment`, `warehouse`, `sunset`, `dawn`,
`night`, `forest`, `lobby`, `park`. For a **dark** site, use `warehouse` or `night` and add
one warm rim light. Custom HDRI: `<Environment files="/hdr/studio_1k.hdr" />` — use 1k–2k
`.hdr`, never 4k+ on the web.

The environment lights the scene without being visible by default. Add
`<Environment background blur={0.6} />` only if you want to see it.

Shadow rules:
- `castShadow` on **at most one** light. Every shadow-casting light is a full extra render pass.
- Meshes: `castShadow` on hero geometry, `receiveShadow` on floors. Not both on everything.
- Acne / peter-panning → tune `shadow-bias` (-0.0001 … -0.001) and `shadow-normalBias` (~0.02).

## 5. Materials

`MeshStandardMaterial` is the default. `MeshPhysicalMaterial` adds `clearcoat`,
`transmission` (real glass), `sheen` (fabric / velvet), `iridescence` — each costs
performance, so add them only where visible.

Furniture cheat-sheet:

```tsx
// matte oak
<meshStandardMaterial color="#8a6242" roughness={0.75} metalness={0} />
// brushed brass
<meshStandardMaterial color="#c9a227" roughness={0.35} metalness={1} />
// lacquered / varnished wood
<meshPhysicalMaterial color="#3a2a1e" roughness={0.4} clearcoat={1} clearcoatRoughness={0.15} />
// velvet upholstery
<meshPhysicalMaterial color="#1d3b34" roughness={0.9} sheen={1} sheenRoughness={0.35} sheenColor="#5ad0a8" />
// glass tabletop
<meshPhysicalMaterial transmission={1} thickness={0.4} roughness={0.05} ior={1.5} />
```

`metalness` is binary in the real world: 0 or 1. Values in between are almost always a bug.

## 6. Camera and controls

```tsx
import { OrbitControls } from '@react-three/drei'

<OrbitControls
  makeDefault
  enablePan={false}
  enableDamping
  dampingFactor={0.08}
  minDistance={2}
  maxDistance={8}
  minPolarAngle={Math.PI * 0.15}   // stop the user going under the floor
  maxPolarAngle={Math.PI * 0.5}
/>
```

- Low `fov` (30–40) = product / architectural look. High `fov` (60–80) = immersive, dramatic.
- Always clamp `minDistance` / `maxDistance` and `maxPolarAngle`. Unclamped orbit controls are
  the fastest way to make a site feel amateur.
- On a scrolling page, set `enabled={false}` or the canvas eats the wheel event. Alternatively
  give the canvas `touch-action: pan-y` in CSS so mobile can still scroll past it.

## 7. Animation: `useFrame`, never `setState`

```tsx
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'

function Spinner() {
  const ref = useRef<Mesh>(null!)
  useFrame((_, delta) => { ref.current.rotation.y += delta * 0.4 })  // frame-rate independent
  return <mesh ref={ref}>{/* … */}</mesh>
}
```

Hard rules:
- Never call `setState` inside `useFrame` — it re-renders React 60x per second.
- Always multiply by `delta`. Hardcoded per-frame increments run twice as fast on 120 Hz screens.
- Never allocate inside `useFrame` (`new THREE.Vector3()`, array literals, object literals).
  Hoist them to module scope or a `useRef`. This is the main source of GC stutter.

## 8. Loading, suspense, and the blank-page problem

```tsx
import { Suspense } from 'react'
import { useProgress, Html, useGLTF } from '@react-three/drei'

function Loader() {
  const { progress } = useProgress()
  return <Html center><span>{progress.toFixed(0)}%</span></Html>
}

<Canvas>
  <Suspense fallback={<Loader />}>
    <Model />
  </Suspense>
</Canvas>

useGLTF.preload('/models/chair.glb')  // module scope: starts the fetch early
```

Always render meaningful HTML around the canvas. A 3D hero must never be the only content on
the page — it is invisible to crawlers, screen readers, and anyone whose GPU is blocklisted.

## 9. Resize, DPR, and layout

R3F handles resize automatically. In vanilla Three.js you must do it yourself:

```js
const onResize = () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
}
addEventListener('resize', onResize)
```

Give the canvas container an explicit height (`h-screen`, `aspect-[4/3]`, …). A canvas inside
a zero-height flex parent renders nothing and reports no error.

## 10. Teardown — required in vanilla, mostly free in R3F

R3F disposes objects it created declaratively. You must still dispose anything you made
imperatively, and always cancel the loop:

```js
renderer.setAnimationLoop(null)
scene.traverse((o) => {
  if (!o.isMesh) return
  o.geometry.dispose()
  for (const m of [].concat(o.material)) {
    for (const k in m) if (m[k] && m[k].isTexture) m[k].dispose()
    m.dispose()
  }
})
renderer.dispose()
controls.dispose()
```

Leaking a renderer on route change kills a SPA within a few navigations — browsers cap you at
roughly 8–16 live WebGL contexts.

## 11. Accessibility and fallback — not optional

- Give `<Canvas>` `aria-hidden="true"`; the real content lives in DOM next to it.
- Respect `prefers-reduced-motion`: freeze auto-rotation and scroll-driven camera moves.
- Detect WebGL support and render a static poster image if absent:

```tsx
const ok = typeof window !== 'undefined' &&
  !!document.createElement('canvas').getContext('webgl2')
if (!ok) return <img src="/poster.webp" alt="…" />
```

- Every product shown in 3D needs the same information available as text and images.

## 12. Debug checklist — black screen or nothing visible

1. Canvas container has zero height → set a height.
2. Camera is inside the object, or the object is at scale 0.001 → log `new THREE.Box3().setFromObject(obj)`.
3. No light and material is `MeshStandardMaterial` → add `<Environment />`. (`MeshBasicMaterial`
   needs no light — swap to it temporarily to confirm the geometry exists.)
4. Model loads but is invisible → check `material.transparent` / `opacity`, and `side` (backface culling).
5. Two copies of `three` → `npm ls three`.
6. Everything washed out → tone mapping / colorSpace (section 3).
7. `useGLTF` throws on the server → the component is not `'use client'` + `ssr: false`.
