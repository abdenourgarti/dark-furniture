---
name: webgl-performance
description: "Make a 3D website fast: frame-rate budgets, draw calls, instancing, LOD, texture and VRAM budgets, lazy-mounting the canvas, mobile fallbacks, memory leaks between routes, Core Web Vitals impact of WebGL, and profiling with r3f-perf / Spector.js / Chrome DevTools. Use when a 3D page stutters, drains battery, crashes on mobile, tanks Lighthouse, or before shipping any 3D site to production."
metadata:
  author: local
  version: "1.0.0"
---

# WebGL Performance & Shipping Checklist

A 3D site that runs at 25 fps on a mid-range Android is a failed 3D site. Treat this as the
gate before shipping.

## 1. Budgets — measure against these, not against your dev machine

| Metric | Target | Fail |
|---|---|---|
| Frame time (desktop) | < 8 ms (120 fps headroom) | > 16 ms |
| Frame time (mid Android, 4x CPU throttle) | < 16 ms | > 33 ms |
| Draw calls | < 60 | > 150 |
| Triangles on screen | < 300 k | > 800 k |
| Programs (shaders) | < 20 | > 40 |
| GPU memory / textures | < 150 MB | > 400 MB (iOS Safari kills the tab) |
| 3D payload before first interaction | < 3 MB | > 5 MB |
| LCP with 3D above the fold | < 2.5 s | > 4 s |
| Total blocking time from WebGL init | < 200 ms | > 600 ms |

## 2. Profile before optimizing

```bash
npm i -D r3f-perf
```

```tsx
import { Perf } from 'r3f-perf'
{process.env.NODE_ENV === 'development' && <Perf position="top-left" />}
```

Read it in this order: **calls → triangles → GPU ms → CPU ms**. High CPU with low GPU means
JS/React overhead; high GPU means fill rate, shader cost, or overdraw.

Also:
- `renderer.info` — `{ render: { calls, triangles }, memory: { geometries, textures }, programs }`.
  Log it after load; if `geometries`/`textures` grows on every route change, you have a leak.
- **Spector.js** browser extension — captures a frame and lists every GL command. The only
  way to find a mystery draw call.
- Chrome DevTools Performance, **4x CPU throttle** + "GPU" track enabled. Never profile
  unthrottled.
- Chrome `chrome://gpu` to confirm hardware acceleration is on (a "software WebGL" fallback
  explains catastrophic numbers).

## 3. The fixes, in order of payoff

### 3a. Cut draw calls
One draw call per mesh per material. 200 chair legs = 200 calls unless you act.

```tsx
// identical geometry, many transforms → ONE call
import { Instances, Instance } from '@react-three/drei'
<Instances geometry={nodes.Leg.geometry} material={materials.Oak} limit={500}>
  {items.map((p, i) => <Instance key={i} position={p.pos} rotation={p.rot} />)}
</Instances>
```

- Merge static geometry sharing a material: `BufferGeometryUtils.mergeGeometries([...])`.
- Merge textures into an atlas so several meshes can share one material.
- drei `<Merged>` handles the common "many copies of a few models" case.

### 3b. Cut texture memory (the mobile killer)
VRAM cost is `width × height × 4 bytes × 1.33` (mipmaps) — **independent of file size**.
A 4096² PNG costs ~89 MB in VRAM whether it is 2 MB or 20 MB on disk.

- 2048² max, 1024² for anything not filling the screen.
- Use **KTX2/Basis** — it stays compressed in VRAM (4–8x saving). See `gltf-pipeline`.
- Power-of-two dimensions.
- Reuse one environment map for the whole scene.
- `texture.generateMipmaps = false` only for fullscreen/UI textures never seen at an angle.
- `renderer.capabilities.getMaxAnisotropy()` — cap anisotropy at 4; 16 is rarely visible.

### 3c. Cut shadow cost
- One `castShadow` light, maximum.
- `shadow-mapSize` 1024 on mobile, 2048 desktop. 4096 is almost never justified.
- Tighten the shadow camera frustum to the actual scene bounds — a loose frustum wastes
  nearly all the resolution:
  ```tsx
  <directionalLight castShadow shadow-camera-left={-4} shadow-camera-right={4}
    shadow-camera-top={4} shadow-camera-bottom={-4} shadow-camera-far={20} />
  ```
- Static scene? Render shadows once: `gl.shadowMap.autoUpdate = false; gl.shadowMap.needsUpdate = true`.
- Or skip real shadows entirely and use drei `<ContactShadows>` / `<AccumulativeShadows>` /
  a baked shadow plane. For a product on a floor this looks better *and* costs less.

### 3d. Stop rendering when nothing changes
```tsx
<Canvas frameloop="demand" />          // renders only on invalidate()
```
`invalidate()` from `useThree()` triggers a frame. drei controls call it automatically.
For a static product viewer this takes idle GPU usage to zero — huge for battery and for
laptops with fans. Do not use it with continuous animation.

Pause offscreen:
```tsx
const [visible, setVisible] = useState(true)   // IntersectionObserver on the container
<Canvas frameloop={visible ? 'always' : 'never'} />
```
Also pause on `document.hidden` — a background tab rendering at 60 fps is a battery bug.

### 3e. Reduce pixels shaded
- `dpr={[1, 2]}` — never uncapped. On a 3x phone, uncapped DPR is 2.25x the pixel work.
- Adaptive: drei `<PerformanceMonitor onDecline={() => setDpr(1)} />` drops resolution when
  frame rate falls, instead of stuttering.
- `antialias: false` + an FXAA/SMAA post pass is cheaper than MSAA on mobile.
- Overdraw: many overlapping transparent layers is a fill-rate disaster. Set
  `depthWrite={false}` on transparent materials and keep their count low.

### 3f. Reduce JS work per frame
- No allocations in `useFrame` (see `three-web-3d` §7).
- No `setState` in `useFrame`.
- `useMemo` geometries, materials, curves, and typed arrays.
- Move heavy math to a Web Worker, or to the vertex shader.

## 4. Loading strategy

```tsx
// canvas mounts only when scrolled into view; a poster holds the layout until then
const [inView, setInView] = useState(false)
useEffect(() => {
  const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true),
    { rootMargin: '200px' })
  io.observe(ref.current!); return () => io.disconnect()
}, [])
return <div ref={ref} className="aspect-[4/3]">
  {inView ? <Scene /> : <img src="/poster.webp" alt="" />}
</div>
```

- Reserve the space (`aspect-ratio`) — a late-mounting canvas is a CLS penalty.
- `<link rel="preload" as="fetch" href="/models/hero.glb" crossorigin>` for above-the-fold models.
- Code-split: `three` + drei is ~600 KB gzipped. It must not be in the main bundle of a page
  that has no 3D.
- drei `<Preload all />` inside Suspense forces shader compilation during the loading screen,
  removing the first-frame stall.
- Progressive: load a 20 k-triangle version first, swap in the detailed model after.

## 5. Memory leaks between routes

Symptom: the site is fine, then after 5–6 navigations everything dies with
"Too many active WebGL contexts".

- Browsers allow ~8–16 live contexts. Each unmounted-but-not-disposed `<Canvas>` holds one.
- R3F disposes declarative objects on unmount. Anything created imperatively is yours:
  see `three-web-3d` §10.
- `useGLTF` caches by URL — good. But `useGLTF.clear(url)` when you truly want the memory back.
- Log `renderer.info.memory` after each route change. Flat = healthy. Monotonically rising = leak.
- Best structural fix: **one persistent canvas** for the whole app (fixed, full-viewport),
  with routes swapping the scene contents. Zero context churn.

## 6. Mobile: plan the fallback, do not hope

```tsx
const tier = useMemo(() => {
  const gl = document.createElement('canvas').getContext('webgl2')
  if (!gl) return 'none'
  const mem = (navigator as any).deviceMemory ?? 4
  const cores = navigator.hardwareConcurrency ?? 4
  const coarse = matchMedia('(pointer: coarse)').matches
  if (mem <= 4 && coarse) return 'low'
  if (cores <= 4) return 'medium'
  return 'high'
}, [])
```

For finer detection use `detect-gpu` (`npm i detect-gpu`) — it benchmarks against a device
database and returns a 0–3 tier.

| Tier | Serve |
|---|---|
| none | Static poster image. The page must fully work. |
| low | Poster, or a short looping video / image sequence of the turntable |
| medium | 3D, `dpr` 1–1.5, no post-processing, no shadows (contact shadow only), 1024 textures |
| high | Everything |

An image sequence (36 WebP frames scrubbed on drag) is a legitimate, often *better* product
turntable on low-end phones: ~400 KB, no GPU cost, instant.

## 7. Pre-ship checklist

- [ ] Profiled on a real mid-range phone, not just DevTools throttling
- [ ] `renderer.info.memory` flat across 10 route changes
- [ ] Draw calls and triangles within budget (§1)
- [ ] All `.glb` compressed and inspected (`gltf-pipeline`)
- [ ] Textures ≤ 2048, KTX2 where mobile matters
- [ ] `dpr` capped at 2; `PerformanceMonitor` or a manual tier in place
- [ ] `frameloop="demand"` if the scene is static
- [ ] Canvas paused offscreen and on `document.hidden`
- [ ] WebGL-unsupported path renders a real page
- [ ] `prefers-reduced-motion` honored
- [ ] Lighthouse mobile run on the 3D page; LCP and TBT within budget
- [ ] Tested on Safari iOS (strictest memory limits — where 3D sites die first)
- [ ] `three` deduped (`npm ls three`) and dev tools (`r3f-perf`, `leva`) excluded from prod
