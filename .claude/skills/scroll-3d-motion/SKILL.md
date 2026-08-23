---
name: scroll-3d-motion
description: "Scroll-driven 3D and cinematic web motion: camera moves tied to scroll, models that assemble or rotate as the page advances, pinned WebGL sections, smooth scroll (Lenis), GSAP ScrollTrigger with React Three Fiber, drei ScrollControls, section transitions, and reveal choreography. Use for awwwards-style scrollytelling, 3D landing pages, or 'the product rotates as I scroll' briefs."
metadata:
  author: local
  version: "1.0.0"
---

# Scroll-Driven 3D Motion

Assumes `three-web-3d` is loaded. This is the layer that turns a 3D scene into a narrative.

## 1. Pick one scroll authority — mixing them is the classic bug

You may have exactly **one** source of truth for scroll position:

| Approach | Use when |
|---|---|
| **drei `<ScrollControls>`** | The whole page is the 3D experience; HTML is overlaid inside the canvas |
| **GSAP ScrollTrigger + Lenis** | A normal HTML page with 3D sections in it ← most sites |
| Native `IntersectionObserver` + `useFrame` lerp | Simple: one model that spins in one section |

Never run `ScrollControls` and `ScrollTrigger` on the same page. Never let `OrbitControls`
stay enabled in a scroll-driven section — it fights the camera every frame.

## 2. GSAP ScrollTrigger + R3F (the default pattern)

Install: `npm i gsap lenis`

### 2a. Smooth scroll, wired to GSAP's ticker

```tsx
'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => { gsap.ticker.remove(tick); lenis.destroy() }
  }, [])
}
```

Two non-negotiables: `lenis.on('scroll', ScrollTrigger.update)` (otherwise triggers fire at
the wrong position) and `gsap.ticker.lagSmoothing(0)` (otherwise GSAP freezes on a slow frame).

### 2b. Drive a plain object, read it in `useFrame`

Do **not** tween Three.js objects directly across the React boundary. Tween a mutable
progress object, and apply it inside the render loop:

```tsx
// shared, module scope — no allocation per frame
export const scrollState = { progress: 0, section: 0 }
```

```tsx
// HTML side: one ScrollTrigger writes progress
useEffect(() => {
  const st = ScrollTrigger.create({
    trigger: '#scene-section',
    start: 'top top',
    end: '+=300%',
    pin: true,
    scrub: 1,                       // 1 = ~1s of smoothing; true = instant
    onUpdate: (self) => { scrollState.progress = self.progress },
  })
  return () => st.kill()
}, [])
```

```tsx
// 3D side: read it, lerp toward it
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'

function CameraRig() {
  useFrame((state, delta) => {
    const p = scrollState.progress
    const targetZ = MathUtils.lerp(6, 1.8, p)
    const targetY = MathUtils.lerp(1.4, 0.4, p)
    // damp() is frame-rate independent — plain lerp(…, 0.1) is not
    state.camera.position.z = MathUtils.damp(state.camera.position.z, targetZ, 4, delta)
    state.camera.position.y = MathUtils.damp(state.camera.position.y, targetY, 4, delta)
    state.camera.lookAt(0, 0.5, 0)
  })
  return null
}
```

`MathUtils.damp(current, target, lambda, delta)` is the correct smoothing function. A raw
`lerp(a, b, 0.1)` inside `useFrame` runs twice as fast on a 120 Hz display.

### 2c. A camera path instead of hand-tuned numbers

For a multi-beat journey, define keyframes and interpolate along a curve:

```tsx
import { CatmullRomCurve3, Vector3 } from 'three'
const path = new CatmullRomCurve3([
  new Vector3(0, 1.6, 6), new Vector3(3, 1.0, 3),
  new Vector3(0, 0.6, 1.6), new Vector3(-2.5, 1.2, 2.5),
])
const look = new CatmullRomCurve3([
  new Vector3(0, 0.8, 0), new Vector3(0, 0.6, 0),
  new Vector3(0.2, 0.4, 0), new Vector3(0, 0.7, 0),
])
const _p = new Vector3(), _l = new Vector3()   // hoisted: zero allocation per frame

useFrame((state) => {
  const t = clamp01(scrollState.progress)
  path.getPointAt(t, _p); look.getPointAt(t, _l)
  state.camera.position.copy(_p)
  state.camera.lookAt(_l)
})
```

Debug the path visually while building: `<line><bufferGeometry {...} /></line>` from
`path.getPoints(80)`, or drei `<CatmullRomLine points={…} />`.

## 3. drei `<ScrollControls>` — when the canvas is the page

```tsx
import { ScrollControls, Scroll, useScroll } from '@react-three/drei'

<Canvas>
  <ScrollControls pages={4} damping={0.2}>
    <SceneContent />
    <Scroll html>
      {/* real DOM, scrolls in sync with the 3D */}
      <h1 style={{ top: '100vh' }}>Crafted in solid oak</h1>
    </Scroll>
  </ScrollControls>
</Canvas>

function SceneContent() {
  const data = useScroll()
  useFrame(() => {
    const r = data.range(0, 1 / 4)          // 0→1 across the first page
    const v = data.visible(1 / 4, 1 / 4)    // boolean: is page 2 on screen
    const c = data.curve(0, 1 / 4)          // eased in-and-out 0→1→0
    group.current.rotation.y = r * Math.PI
  })
}
```

`range` / `curve` / `visible` are the whole API and they cover most choreography. Note the
page scrolls inside the canvas — normal page anchors, sticky headers, and browser find-in-page
behave differently. Prefer GSAP for content-heavy marketing sites.

## 4. Motion recipes that read as premium

- **Reveal by camera, not by opacity.** Move the camera closer and the model into frame;
  do not fade a 3D object in with `opacity` — transparency sorting will bite you.
- **Assemble on scroll.** Give each part an offset target position; drive them with a
  staggered progress: `partProgress = clamp01((p - i * 0.08) / 0.4)`.
- **Rotate at most ~120°** across a section. A full 360° spin reads as a screensaver.
- **Anchor with a horizon.** A ground plane or contact shadow keeps the object from feeling
  like it is floating in a void during movement.
- **Change one thing per beat.** Camera OR material OR lighting — not all three at once.
- **Ease the ends.** `scrub: 1` gives the whole section a weight that `scrub: true` lacks.
- **Exit deliberately.** Park the model in a resting pose at the end of the pinned section,
  so the transition back to normal scrolling is not abrupt.
- **Dark scenes:** animate a rim light's intensity with progress. It reads as cinematic
  lighting rather than as a rotation.

## 5. Pinning without breaking the layout

```ts
ScrollTrigger.create({
  trigger: '#chapter',
  start: 'top top',
  end: '+=250%',        // pin duration = extra scroll distance
  pin: '#chapter',
  pinSpacing: true,     // keep, unless you know exactly why not
  anticipatePin: 1,     // prevents a 1-frame jump on fast scroll
  scrub: 1,
})
```

The canvas itself is usually `position: fixed; inset: 0; z-index: -1` for the whole page, and
sections scroll over it — one WebGL context for the entire site, sections just change what it
shows. This is far cheaper than one canvas per section.

Call `ScrollTrigger.refresh()` after fonts load and after any async content changes height.

## 6. Mobile and reduced motion

```tsx
const reduced = useReducedMotion()          // matchMedia('(prefers-reduced-motion: reduce)')
const mobile = useMediaQuery('(max-width: 768px)')
```

- Reduced motion: skip Lenis entirely, kill scrubbed camera animation, jump to each section's
  end pose. The story must still be readable.
- Mobile: shorten pinned sections (`end: '+=150%'`), lower `dpr` to `[1, 1.5]`, disable
  post-processing, and consider replacing the pinned 3D with a pre-rendered video or image
  sequence. Long pinned sections on touch devices feel like the page is broken.
- Test with the browser's 4x CPU throttle. Scroll jank is invisible on a dev machine.

## 7. Cleanup — mandatory in React

```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    // all gsap.to / ScrollTrigger.create calls here
  })
  return () => ctx.revert()      // kills tweens AND their ScrollTriggers
}, [])
```

`gsap.context()` is the only cleanup you should be writing in React. Without it, StrictMode's
double-mount registers every trigger twice and the animation runs at double speed.

## 8. Failure table

| Symptom | Cause |
|---|---|
| Animation runs at 2x, or triggers fire twice | Missing `gsap.context()` cleanup + StrictMode |
| Triggers fire at the wrong scroll position | Lenis not wired to `ScrollTrigger.update` |
| Everything freezes for a second then jumps | `gsap.ticker.lagSmoothing` not disabled |
| Camera stutters | Plain `lerp` instead of `damp`, or allocations inside `useFrame` |
| Page cannot be scrolled past the canvas on mobile | Canvas swallowing touch — add `touch-action: pan-y` |
| Camera fights back | `OrbitControls` still enabled in a scroll-driven section |
| Layout jumps when the pin releases | `pinSpacing` disabled, or `ScrollTrigger.refresh()` never called after fonts |
| Section heights wrong on load | Images/fonts without reserved space — set `aspect-ratio`, then refresh |
