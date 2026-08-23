---
name: r3f-product-viewer
description: "Build an interactive 3D product viewer or configurator for e-commerce: rotate/zoom a product, swap materials, colors, wood finishes or fabrics, hotspots and annotations, variant state synced to the cart, AR view on mobile, and a studio-quality presentation. Use for furniture, appliance, sneaker, packaging or any 'view this product in 3D' feature. Also covers model-viewer as the low-code alternative."
metadata:
  author: local
  version: "1.0.0"
---

# 3D Product Viewer & Configurator

Assumes `three-web-3d` (scene fundamentals) and `gltf-pipeline` (asset prep) are loaded.

## 1. Choose the level of ambition

| Level | Build | Use when |
|---|---|---|
| A. Drop-in | `<model-viewer>` web component | one product, need AR, ship today |
| B. Viewer | R3F + drei `Stage` + `OrbitControls` | branded look, custom lighting, still read-only |
| C. Configurator | R3F + material/variant state | user picks finish, fabric, size → price + cart |

Do not build C when the brief is A. A configurator needs a real variant data model, and
that is the expensive part — not the rendering.

## 2. Level A — `<model-viewer>` (Google)

```html
<script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>

<model-viewer
  src="/models/chair.glb"
  ios-src="/models/chair.usdz"
  poster="/models/chair-poster.webp"
  alt="Oak dining chair, three-quarter view"
  camera-controls
  auto-rotate auto-rotate-delay="3000"
  shadow-intensity="1"
  environment-image="/hdr/studio_1k.hdr"
  exposure="1.1"
  ar ar-modes="webxr scene-viewer quick-look"
  style="width:100%;aspect-ratio:4/3;background:#111">
  <button slot="ar-button">View in your room</button>
</model-viewer>
```

You get: AR on iOS and Android, a poster/lazy-load story, keyboard controls, and
accessibility for free. `<model-viewer>` also supports glTF **variants**
(`viewer.availableVariants`, `viewer.variantName`), which covers simple finish switching
without writing a configurator.

Trade-off: you cannot deeply customize post-processing, scene composition, or motion.

## 3. Level B — a studio viewer in R3F

```tsx
'use client'
import { Canvas } from '@react-three/fiber'
import { Stage, OrbitControls, Environment, PresentationControls } from '@react-three/drei'
import { Suspense } from 'react'

export function ProductViewer({ url }: { url: string }) {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 35, position: [0, 0.6, 4] }}>
      <Suspense fallback={null}>
        {/* Stage auto-frames the model, adds ground shadows and 3-point-ish lighting */}
        <Stage intensity={0.5} environment="studio" shadows="contact" adjustCamera={1.2}>
          <Model url={url} />
        </Stage>
      </Suspense>
      <OrbitControls makeDefault enablePan={false} enableDamping
        minPolarAngle={Math.PI * 0.1} maxPolarAngle={Math.PI * 0.52}
        minDistance={2} maxDistance={7} autoRotate autoRotateSpeed={0.4} />
    </Canvas>
  )
}
```

`<Stage>` is the fastest route to a decent look — it computes the bounding box, centers the
model, frames the camera, and drops a contact shadow. Replace it with hand-built lighting
once the art direction demands it.

`<PresentationControls>` is the better choice for a **hero**: it constrains rotation to a
springy, bounded gesture instead of full orbit, so the product never ends up upside down.

```tsx
<PresentationControls global snap rotation={[0.1, 0.3, 0]}
  polar={[-0.2, 0.3]} azimuth={[-0.6, 0.6]} config={{ mass: 1, tension: 180 }}>
  <Model />
</PresentationControls>
```

## 4. Level C — the configurator

### 4a. Model the variants as data first

```ts
// data/product.ts
export const FINISHES = {
  oak:    { label: 'Natural oak',  color: '#b78b5e', roughness: 0.75, metalness: 0, map: '/tex/oak.webp' },
  walnut: { label: 'Dark walnut',  color: '#4a3225', roughness: 0.65, metalness: 0, map: '/tex/walnut.webp' },
  black:  { label: 'Charcoal ash', color: '#1c1c1e', roughness: 0.5,  metalness: 0 },
} as const

export const FABRICS = {
  bouclé: { label: 'Ivory bouclé', color: '#e8e2d6', roughness: 0.95, sheen: 1, sheenColor: '#fff8ee' },
  velvet: { label: 'Forest velvet', color: '#1d3b34', roughness: 0.9,  sheen: 1, sheenColor: '#5ad0a8' },
} as const

export type Config = { finish: keyof typeof FINISHES; fabric: keyof typeof FABRICS; size: 'two' | 'three' }
export const priceOf = (c: Config) => BASE[c.size] + UPCHARGE[c.finish] + UPCHARGE[c.fabric]
```

The 3D scene reads this state. It never owns it. Keep the config in a store (Zustand) or URL
search params so the state survives a reload and can be shared and added to a cart.

```ts
// store.ts
import { create } from 'zustand'
export const useConfig = create<Config & { set: (p: Partial<Config>) => void }>((set) => ({
  finish: 'oak', fabric: 'bouclé', size: 'two',
  set: (p) => set(p),
}))
```

### 4b. Apply the variant to named meshes

Generate the component with `npx gltfjsx model.glb --types --transform`, then drive the
materials from state:

```tsx
function Sofa() {
  const { nodes } = useGLTF('/models/sofa-transformed.glb')
  const { finish, fabric } = useConfig()
  const f = FINISHES[finish], t = FABRICS[fabric]
  const woodMap = useTexture(f.map ?? '/tex/blank.webp')
  woodMap.colorSpace = THREE.SRGBColorSpace
  woodMap.wrapS = woodMap.wrapT = THREE.RepeatWrapping

  return (
    <group dispose={null}>
      <mesh geometry={nodes.Frame.geometry} castShadow receiveShadow>
        <meshStandardMaterial color={f.color} roughness={f.roughness} metalness={f.metalness} map={f.map ? woodMap : null} />
      </mesh>
      <mesh geometry={nodes.Cushions.geometry} castShadow>
        <meshPhysicalMaterial color={t.color} roughness={t.roughness} sheen={t.sheen} sheenColor={t.sheenColor} sheenRoughness={0.4} />
      </mesh>
    </group>
  )
}
```

This requires clean mesh names in the source model (`Frame`, `Cushions`, `Legs`, `Hardware`).
If the model has one merged mesh, the configurator is impossible — send it back to be split
by material, or split it in Blender. **Check this before promising a configurator.**

### 4c. Size / part variants

For discrete geometry variants (2-seater vs 3-seater), do not load two models — hide and show
subtrees of one model:

```tsx
<group visible={size === 'three'}>
  <mesh geometry={nodes.ExtraSeat.geometry} material={mat} />
</group>
```

If the geometries are genuinely different objects, load them lazily and keep only the active
one mounted so the inactive GPU memory is released.

### 4d. Animate the change

An instant material swap feels broken. Cross-fade the color:

```tsx
import { useSpring, animated } from '@react-spring/three'
const { color } = useSpring({ color: f.color, config: { tension: 200, friction: 26 } })
<animated.meshStandardMaterial color={color} roughness={f.roughness} />
```

Or gently nudge the camera toward the part that changed, so the user sees the effect.

## 5. Hotspots and annotations

drei `<Html>` pins DOM to a 3D point — real text, real accessibility, real styling:

```tsx
import { Html } from '@react-three/drei'

<Html position={[0.4, 0.8, 0.2]} distanceFactor={6} occlude center>
  <button className="hotspot" onClick={() => focusOn('armrest')}>
    <span className="dot" /> Solid oak armrest
  </button>
</Html>
```

`occlude` hides the label when geometry passes in front of it. `distanceFactor` scales it
with the camera. Use `occlude="blending"` for a soft fade instead of a hard cut.

For a "focus on this part" interaction, use drei `<Bounds>` + `useBounds().refresh(obj).fit()`.

## 6. AR — mobile is where furniture actually sells

- iOS: **USDZ + Quick Look**. Export a `.usdz` alongside the `.glb`
  (`gltf-transform` does not do this — use Blender + USD export, Reality Converter, or
  `usd_from_gltf`). Then `<a rel="ar" href="/models/sofa.usdz"><img …></a>`.
- Android: **Scene Viewer**, consumes the same `.glb`.
- `<model-viewer>` handles both with one `ar` attribute — this is the strongest reason to use
  it for the product page even if the hero is custom R3F.
- Set real-world scale correctly (meters, section 9 of `gltf-pipeline`) or the sofa lands in
  the room the size of a shoebox.

## 7. Product-page integration checklist

- [ ] Canvas is lazy-mounted (IntersectionObserver) with a poster image until in view
- [ ] Static images remain the primary media; 3D is a tab or a "View in 3D" toggle
- [ ] Config state lives in URL params (`?finish=walnut&fabric=velvet`) — shareable, restorable
- [ ] "Add to cart" sends the variant SKU, not the 3D state
- [ ] Price recomputes from the config, on the server too (never trust the client)
- [ ] Every finish/fabric has a real swatch image in DOM — 3D is not the only way to choose
- [ ] `prefers-reduced-motion` disables auto-rotate
- [ ] Model + textures under budget (`gltf-pipeline` section 6)
- [ ] Works with the canvas removed: the page must still sell the product

## 8. Common failures

| Symptom | Cause |
|---|---|
| Material swap does nothing | You mutated a shared material instance used by several meshes — clone it, or set the prop declaratively |
| Product looks plastic | `metalness` between 0 and 1, or no environment map |
| Fabric looks like painted plastic | Missing `sheen` and a normal/roughness map — fabric needs micro-detail |
| Model dark on one side only | Single directional light, no environment |
| Swatch color ≠ rendered color | Swatch is raw sRGB hex, render goes through tone mapping — sample the rendered color for the swatch |
| Configurator janky on phone | Re-creating materials each render; memoize with `useMemo` keyed on the config |
| AR places a giant/tiny object | Model not in meters |
