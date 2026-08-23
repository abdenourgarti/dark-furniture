---
name: gltf-pipeline
description: "Get 3D models into a website at a size that actually loads. Use when handling .glb / .gltf / .fbx / .obj / .usdz files, compressing or optimizing 3D assets, Draco or Meshopt or KTX2 / basis textures, gltf-transform, gltfjsx, baking, UVs, model budgets, where to source 3D furniture models, or when a 3D page is slow because the model is huge. Load before importing any model into the project."
metadata:
  author: local
  version: "1.0.0"
---

# glTF Asset Pipeline

An unoptimized 3D model is the single biggest performance risk on a 3D site. A raw
CAD/Blender export of a sofa is routinely 60–200 MB. Shipping target is **under 3 MB**.

## 1. Format rules

- **`.glb`** — the only format to ship. Single binary file, textures embedded, PBR native.
- `.gltf` + separate `.bin` + textures: fine during authoring, more requests in production.
- `.fbx` / `.obj` / `.stl` / `.dae`: convert to glb before use. Never load them at runtime.
- `.usdz`: only as a **second** export, for iOS Quick Look AR. Same model, exported twice.

Converting:

```bash
# Blender (headless) — most reliable for fbx/obj → glb
blender -b -P convert.py -- input.fbx output.glb
# or use Blender GUI: File > Import, then File > Export > glTF 2.0 (.glb)
```

Export settings that matter in Blender's glTF exporter:
- Format: **glTF Binary (.glb)**
- Include: Selected Objects only (do not export lights/cameras unless intended)
- Transform: **+Y Up** (checked — this is the glTF convention)
- Geometry: Apply Modifiers ✓, UVs ✓, Normals ✓, Tangents ✓ (needed for normal maps),
  Vertex Colors only if used
- Compression: leave OFF here — apply Draco/Meshopt with gltf-transform instead (better control)

## 2. The optimization command you will run every time

```bash
npm i -g @gltf-transform/cli
```

```bash
# inspect first — always know what you are dealing with
gltf-transform inspect model.glb
```

`inspect` prints per-mesh vertex counts and per-texture resolutions. Read it before deciding
what to cut.

The standard pass:

```bash
gltf-transform optimize input.glb output.glb \
  --compress draco \
  --texture-compress webp \
  --texture-size 2048
```

`optimize` bundles: dedup, instancing, prune unused nodes/materials, weld vertices, resample
animations, flatten hierarchy, texture compression. It is the 90% command.

Manual control when `optimize` is too aggressive:

```bash
gltf-transform dedup       in.glb a.glb    # merge identical meshes/materials/textures
gltf-transform prune       a.glb  b.glb    # drop unused nodes, materials, UV sets
gltf-transform weld        b.glb  c.glb    # merge duplicate vertices
gltf-transform simplify    c.glb  d.glb --ratio 0.5 --error 0.001   # decimate geometry
gltf-transform resize      d.glb  e.glb --width 2048 --height 2048
gltf-transform webp        e.glb  f.glb --quality 85
gltf-transform draco       f.glb  out.glb
```

## 3. Draco vs Meshopt vs KTX2 — what each one compresses

| Tool | Compresses | Gain | Cost |
|---|---|---|---|
| **Draco** | geometry (vertices/indices) | 5–10x on mesh data | ~200 KB decoder, CPU decode on load |
| **Meshopt** | geometry + animation | 3–6x, faster decode than Draco | ~25 KB decoder ← prefer for many models |
| **WebP/AVIF textures** | texture file size | 2–4x vs PNG | decoded to raw RGBA in VRAM (no VRAM saving) |
| **KTX2 / Basis** | textures, GPU-compressed | 4–8x **in VRAM too** | slower to encode, slight quality loss |

Decision:
- One hero model → **Draco + WebP**. Simplest.
- Many models / a configurator → **Meshopt + KTX2**. Smaller decoder, real VRAM savings.
- Mobile matters a lot → **KTX2 always** (VRAM is the mobile bottleneck, not bandwidth).

KTX2 encoding needs the `toktx` binary from KTX-Software installed:

```bash
gltf-transform uastc in.glb out.glb --level 4 --rdo 4 --zstd 18   # quality: normal maps
gltf-transform etc1s in.glb out.glb --quality 200                 # small: albedo, AO
```

## 4. Loading compressed models in R3F

Draco — host the decoder yourself, do not rely on a CDN:

```bash
cp node_modules/three/examples/jsm/libs/draco/gltf/* public/draco/
```

```tsx
import { useGLTF } from '@react-three/drei'
useGLTF('/models/chair.glb', '/draco/')          // second arg = decoder path
useGLTF.preload('/models/chair.glb', '/draco/')
```

Meshopt:

```tsx
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
useGLTF('/models/chair.glb', true, true, (loader) => loader.setMeshoptDecoder(MeshoptDecoder))
```

KTX2 in R3F requires the transcoder files in `public/basis/`; drei's `useGLTF` wires
`KTX2Loader` automatically when the renderer is available.

Serve `.glb` with far-future cache headers and a content hash in the filename. They never
change once shipped.

## 5. gltfjsx — turn a model into typed JSX

```bash
npx gltfjsx public/models/chair.glb -o components/Chair.tsx --types --transform
```

`--transform` runs the gltf-transform optimize pass and writes `chair-transformed.glb`.
`--types` emits TypeScript. The generated component gives you a **named handle on every mesh
and material**, which is what makes a configurator possible:

```tsx
const { nodes, materials } = useGLTF('/models/chair-transformed.glb')
<mesh geometry={nodes.Seat.geometry} material={materials.Fabric} />
```

Do not hand-edit the generated file beyond adding props — regenerate it when the model changes.

## 6. Budgets — enforce these

| Asset | Budget | Hard ceiling |
|---|---|---|
| Hero model, compressed `.glb` | < 1.5 MB | 3 MB |
| Triangles, single product | 30–80 k | 150 k |
| Triangles, whole scene | < 300 k | 500 k |
| Texture resolution | 1024–2048 | 2048 (4096 only for a hero close-up) |
| Texture sets (materials) per model | ≤ 4 | 8 |
| Draw calls per frame | < 60 | 150 |
| Total 3D payload, first view | < 3 MB | 5 MB |

Check with `gltf-transform inspect` and the R3F `<Perf />` overlay (`r3f-perf`).

## 7. Texture packing (the ORM trick)

glTF packs **Occlusion / Roughness / Metalness** into one RGB texture:
R = AO, G = roughness, B = metalness. Three separate grayscale maps become one file.
Blender's glTF exporter does this automatically if you wire the Principled BSDF normally.
If you got three separate maps from a marketplace, pack them — it is a 3x saving.

Never apply sRGB to the ORM or normal map. Only basecolor and emissive are sRGB.

## 8. Sourcing models

- **Free, license-clear**: Poly Haven (CC0, also HDRIs and PBR textures), Sketchfab
  (filter to CC/downloadable), Khronos glTF-Sample-Assets, Google Poly archives.
- **Paid, production quality**: TurboSquid, CGTrader, Quixel Megascans (via Fab).
- **Furniture specifically**: many manufacturers publish glTF/USDZ for their catalogue;
   3D Warehouse has SketchUp models that need heavy cleanup.
- **Custom**: model in Blender, or photogrammetry / a phone LiDAR scan cleaned in Blender.

Always record the license next to the file (`public/models/LICENSES.md`). CC-BY requires
visible attribution on the site.

## 9. Scale, origin, orientation — fix in Blender, not in code

Before export:
- **Unit = 1 meter.** A chair is ~0.9 tall, a sofa ~2.2 wide. Getting this wrong breaks
  lighting falloff, shadow bias, camera framing, and AR placement.
- **Origin at the base center** of the object (`Object > Set Origin > Origin to Geometry`,
  then move to floor level). This makes `position={[0,0,0]}` sit it on the ground.
- **Apply all transforms** (`Ctrl+A > All Transforms`). Non-applied scale wrecks normals.
- Rotation zeroed, facing -Z (glTF forward).

Fixing these with `scale={0.013}` and magic rotation numbers in JSX is a smell that will
cost you later in every scene the model appears in.

## 10. Quick audit script

```bash
for f in public/models/*.glb; do
  echo "== $f  $(du -h "$f" | cut -f1)"
  gltf-transform inspect "$f" | grep -E 'meshes|textures|triangles|vertices' | head -20
done
```
