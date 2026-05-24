import { PX_PER_MM, A4_WIDTH_PX, A4_HEIGHT_PX } from './frames';

export const MARGIN_MM = 2;                            // minimum distance from A4 edge
export const MARGIN_PX = MARGIN_MM * PX_PER_MM;       // ≈ 7.6 px

export const SNAP_GAP_MM = 5;                          // gap between frames
export const SNAP_GAP_PX = SNAP_GAP_MM * PX_PER_MM;   // ≈ 18.9 px

const MAGNET_RADIUS = SNAP_GAP_PX * 1.6;              // ≈ 30 px — activation radius

export interface SnapRect {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Effective left-contact x in px (from frame origin). 0 for rects; midpoint of left diagonal for trapezoids. */
  snapLeft: number;
  /** Effective right-contact x in px (from frame origin). w for rects; midpoint of right diagonal for trapezoids. */
  snapRight: number;
}

export interface SnapResult {
  x: number;
  y: number;
  isValid: boolean;
  /** x position of vertical snap guide line (null = no X snap fired) */
  guideX: number | null;
  /** y position of horizontal snap guide line (null = no Y snap fired) */
  guideY: number | null;
}

function pickClosest(current: number, candidates: number[], radius: number): number {
  let best = current;
  let bestDist = radius;
  for (const c of candidates) {
    const d = Math.abs(current - c);
    if (d < bestDist) { bestDist = d; best = c; }
  }
  return best;
}

/**
 * Effective-edge overlap: uses snapLeft/snapRight for X axis (diagonal midpoints for trapezoids),
 * bounding box for Y axis (all frames have flat top/bottom).
 */
function overlaps(
  ax: number, ay: number, ah: number, aSnapLeft: number, aSnapRight: number,
  bx: number, by: number, bh: number, bSnapLeft: number, bSnapRight: number,
): boolean {
  const tol = 1; // 1 px — touching edges are NOT overlap

  // Y: bounding-box check (flat top/bottom on every frame type)
  if (ay + ah <= by + tol || by + bh <= ay + tol) return false;

  // X: effective-edge check
  const aLeft  = ax + aSnapLeft;
  const aRight = ax + aSnapRight;
  const bLeft  = bx + bSnapLeft;
  const bRight = bx + bSnapRight;
  return !(aRight <= bLeft + tol || bRight <= aLeft + tol);
}

/**
 * Snap rules:
 *  A4 boundary  →  2 mm margin from every edge (frames never touch the A4 border)
 *  Between frames  →  5 mm gap measured between effective contact edges (diagonal midpoints for trapezoids)
 *
 * @param dragSnapLeft  effective left-contact x of the dragged frame (px from its own origin)
 * @param dragSnapRight effective right-contact x of the dragged frame (px from its own origin)
 */
export function computeSnap(
  rawX: number,
  rawY: number,
  dragW: number,
  dragH: number,
  others: SnapRect[],
  excludeId: string,
  dragSnapLeft: number,
  dragSnapRight: number,
): SnapResult {
  const peers = others.filter((o) => o.id !== excludeId);

  // A4 boundary snap candidates — 2 mm margin only, no flush-to-edge
  const xCandidates: number[] = [
    MARGIN_PX,                          // 2 mm from left edge
    A4_WIDTH_PX - dragW - MARGIN_PX,    // 2 mm from right edge
  ];
  const yCandidates: number[] = [
    MARGIN_PX,                          // 2 mm from top edge
    A4_HEIGHT_PX - dragH - MARGIN_PX,   // 2 mm from bottom edge
  ];

  // Inter-frame snap candidates — 5 mm gap between effective contact edges, or edge alignment
  for (const o of peers) {
    // drag-left-contact = other-right-contact + 5mm  →  drag origin = other.x + o.snapRight + gap - dragSnapLeft
    xCandidates.push(o.x + o.snapRight + SNAP_GAP_PX - dragSnapLeft);
    // drag-right-contact = other-left-contact - 5mm  →  drag origin = other.x + o.snapLeft - gap - dragSnapRight
    xCandidates.push(o.x + o.snapLeft - SNAP_GAP_PX - dragSnapRight);
    // contact-edge alignment: drag-left = other-left, drag-right = other-right
    xCandidates.push(o.x + o.snapLeft  - dragSnapLeft);
    xCandidates.push(o.x + o.snapRight - dragSnapRight);

    yCandidates.push(
      o.y + o.h + SNAP_GAP_PX,    // drag-top = other-bottom + 5 mm
      o.y - dragH - SNAP_GAP_PX,  // drag-bottom = other-top  − 5 mm
      o.y,                          // top-edge alignment
      o.y + o.h - dragH,            // bottom-edge alignment
    );
  }

  const snappedX = pickClosest(rawX, xCandidates, MAGNET_RADIUS);
  const snappedY = pickClosest(rawY, yCandidates, MAGNET_RADIUS);

  // Hard clamp: frame must stay within 2 mm margin on all sides
  const x = Math.max(MARGIN_PX, Math.min(snappedX, A4_WIDTH_PX  - dragW - MARGIN_PX));
  const y = Math.max(MARGIN_PX, Math.min(snappedY, A4_HEIGHT_PX - dragH - MARGIN_PX));

  const guideX = Math.abs(x - rawX) > 0.5 ? x : null;
  const guideY = Math.abs(y - rawY) > 0.5 ? y : null;

  const isValid = peers.every(
    (o) => !overlaps(
      x, y, dragH, dragSnapLeft, dragSnapRight,
      o.x, o.y, o.h, o.snapLeft, o.snapRight,
    ),
  );

  return { x, y, isValid, guideX, guideY };
}
