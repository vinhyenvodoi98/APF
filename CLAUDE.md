# APF — Comic Page Builder

A browser-based tool for assembling comic pages from predefined picture frames, with per-frame image upload + crop, and A4 PDF export.

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React 18 + TypeScript | Component model fits the frame/canvas architecture |
| Build | Vite | Fast HMR, zero-config TS support |
| Canvas rendering | `react-konva` (Konva.js) | Handles clip paths for trapezoids, image rendering, and intra-canvas drag natively |
| Panel → Canvas DnD | Native HTML5 DnD | `draggable` + `dataTransfer` on tiles; `onDrop` on canvas container — simpler than @dnd-kit for this one-way drag |
| Image cropping | `react-easy-crop` | Pinch/zoom crop UI; outputs pixel crop data without opinionated UI |
| PDF export | `jspdf` | Takes a base64 PNG from Konva's `stage.toDataURL()` and embeds it at exact A4 dimensions |
| Styling | Tailwind CSS v3 | Utility classes; no custom CSS files needed for layout |
| State | Zustand | Minimal boilerplate; single store for placed frames + their image data |

## Domain Concepts

### A4 Canvas
- Physical size: **210 mm × 297 mm**
- Rendered at **96 px/mm** screen resolution (configurable constant `PX_PER_MM`)
- The Konva `Stage` is sized to match; PDF export uses the same ratio

### Frame Types

| ID | Shape | Width (mm) | Height (mm) | Notes |
|---|---|---|---|---|
| `sm-rect` | Rectangle | 65 | 94 | |
| `md-rect` | Rectangle | 135 | 94 | |
| `lg-rect` | Rectangle | 205 | 94 | |
| `trap-a` | Right trapezoid | bottom 65, top 99 | 94 | Top edge wider |
| `trap-b` | Right trapezoid | bottom 134, top 101 | 94 | Top edge narrower |

Trapezoid clip paths are drawn as Konva `Line` polygons computed from mm → px at load time.

### Frame Lifecycle
1. User drags a frame tile from the **Palette** panel onto the **Canvas**
2. A placed `FrameNode` is added to Zustand store with a generated `id`, frame type, and drop position
3. User clicks the placed frame → **CropModal** opens with a file input
4. On image select, `react-easy-crop` renders; on confirm, the cropped `ImageData` is stored as a `dataURL` in the frame node
5. Konva renders the `dataURL` clipped to the frame polygon

## Project Structure

```
src/
  components/
    Canvas/
      Stage.tsx          # Konva Stage + Layer, sized to A4
      FrameNode.tsx      # Single placed frame: clip path + image + drag handle
      useStageRef.ts     # Ref forwarding for PDF export
    Palette/
      Palette.tsx        # Left panel listing draggable frame tiles
      FrameTile.tsx      # @dnd-kit draggable source
    CropModal/
      CropModal.tsx      # react-easy-crop dialog
      useCrop.ts         # crop state + getCroppedImg helper
    Toolbar/
      Toolbar.tsx        # "Download PDF" button
  store/
    useFrameStore.ts     # Zustand store: frames[], addFrame, setImage, moveFrame
  lib/
    frames.ts            # Frame type definitions + mm→px conversion
    pdf.ts               # jsPDF export: stage.toDataURL() → A4 PDF
    cropImage.ts         # Canvas-based pixel crop utility (used by useCrop)
  App.tsx
  main.tsx
```

## Key Implementation Notes

### Trapezoid Clip Path
```ts
// trap-a: bottom-left(0,h), bottom-right(65,h), top-right(99,0), top-left(0,0)
// All values multiplied by PX_PER_MM at render time
```
Use Konva `Shape` with a custom `sceneFunc` or a `Line` with `closed=true` and `clip` prop to mask the image.

### PDF Export
```ts
// lib/pdf.ts
const dataUrl = stageRef.current.toDataURL({ pixelRatio: 3 }); // 3× for print quality
const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297);
pdf.save('comic-page.pdf');
```
`pixelRatio: 3` gives ~300 dpi equivalent for A4.

### DnD Bridge (Palette → Konva)
- Palette tiles use `draggable` + `dataTransfer.setData('frameTypeId', id)` on `dragStart`
- The canvas container div handles `onDragOver` + `onDrop`
- On drop, `e.clientX/Y - containerRect.left/top` gives the stage-relative position
- Frame is centered on the cursor and clamped to A4 bounds before `addFrame` is called

### Pixel-per-mm Constant
```ts
// lib/frames.ts
export const PX_PER_MM = 3.7795275591; // 96dpi / 25.4
```
All mm values are converted once at import time; components only deal in pixels.

## Commands

```bash
npm install          # install deps
npm run dev          # start dev server (Vite, port 5173)
npm run build        # production build → dist/
npm run preview      # preview production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint src/
```

## Dependencies to Install

```bash
npm create vite@latest . -- --template react-ts
npm install konva react-konva react-easy-crop jspdf zustand
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Constraints & Decisions

- **No backend** — everything runs in the browser; images never leave the user's machine
- **Single page** — no routing needed
- **No undo/redo** in v1 — frames can be deleted by right-clicking; full history is future work
- **Fixed A4 portrait only** — landscape and custom sizes are out of scope
- Frame positions are free-form (no snap grid) in v1; snapping can be added via Konva's `dragBoundFunc`
