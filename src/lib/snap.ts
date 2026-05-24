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

function overlaps(ax: number, ay: number, aw: number, ah: number,
                  bx: number, by: number, bw: number, bh: number): boolean {
  const tol = 1; // 1 px — touching edges are NOT overlap
  return !(ax + aw <= bx + tol || bx + bw <= ax + tol ||
           ay + ah <= by + tol || by + bh <= ay + tol);
}

/**
 * Snap rules:
 *  A4 boundary  →  2 mm margin from every edge (frames never touch the A4 border)
 *  Between frames  →  5 mm gap (or edge-alignment)
 */
export function computeSnap(
  rawX: number,
  rawY: number,
  dragW: number,
  dragH: number,
  others: SnapRect[],
  excludeId: string,
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

  // Inter-frame snap candidates — 5 mm gap or edge alignment
  for (const o of peers) {
    xCandidates.push(
      o.x + o.w + SNAP_GAP_PX,    // drag-left = other-right + 5 mm
      o.x - dragW - SNAP_GAP_PX,  // drag-right = other-left  − 5 mm
      o.x,                          // left-edge alignment
      o.x + o.w - dragW,            // right-edge alignment
    );
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
    (o) => !overlaps(x, y, dragW, dragH, o.x, o.y, o.w, o.h),
  );

  return { x, y, isValid, guideX, guideY };
}
