export const PX_PER_MM = 3.7795275591; // 96 dpi / 25.4 mm per inch

export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
export const A4_WIDTH_PX = Math.round(A4_WIDTH_MM * PX_PER_MM);   // 794
export const A4_HEIGHT_PX = Math.round(A4_HEIGHT_MM * PX_PER_MM); // 1122

export type FrameTypeId = 'sm-rect' | 'md-rect' | 'lg-rect' | 'trap-a' | 'trap-b';

export interface FrameTypeDef {
  id: FrameTypeId;
  label: string;
  /** Bounding-box width in mm */
  widthMm: number;
  /** Bounding-box height in mm */
  heightMm: number;
  /** Polygon vertices in mm, relative to bounding-box top-left (0,0) */
  points: [number, number][];
  /**
   * Effective left-contact x in mm (from bbox left).
   * Used for inter-frame snap instead of bbox edge.
   * For a rectangle this equals 0. For a trapezoid with a diagonal left side,
   * this is the midpoint x of that diagonal — (topX + bottomX) / 2.
   */
  snapLeftMm: number;
  /**
   * Effective right-contact x in mm (from bbox left).
   * For a rectangle this equals widthMm. For a trapezoid with a diagonal right side,
   * this is the midpoint x of that diagonal — (topX + bottomX) / 2.
   */
  snapRightMm: number;
}

export const FRAME_TYPES: Record<FrameTypeId, FrameTypeDef> = {
  'sm-rect': {
    id: 'sm-rect',
    label: 'Small Rectangle',
    widthMm: 65,
    heightMm: 94,
    points: [[0, 0], [65, 0], [65, 94], [0, 94]],
    snapLeftMm: 0,
    snapRightMm: 65,
  },
  'md-rect': {
    id: 'md-rect',
    label: 'Medium Rectangle',
    widthMm: 135,
    heightMm: 94,
    points: [[0, 0], [135, 0], [135, 94], [0, 94]],
    snapLeftMm: 0,
    snapRightMm: 135,
  },
  'lg-rect': {
    id: 'lg-rect',
    label: 'Large Rectangle',
    widthMm: 205,
    heightMm: 94,
    points: [[0, 0], [205, 0], [205, 94], [0, 94]],
    snapLeftMm: 0,
    snapRightMm: 205,
  },
  // Left side vertical; top wider (99 mm) than bottom (65 mm).
  // Right diagonal runs from (99,0) to (65,94) → midpoint x = (99+65)/2 = 82 mm.
  'trap-a': {
    id: 'trap-a',
    label: 'Trapezoid A',
    widthMm: 99,
    heightMm: 94,
    points: [[0, 0], [99, 0], [65, 94], [0, 94]],
    snapLeftMm: 0,    // vertical left side → contact at bbox edge
    snapRightMm: 82,  // midpoint of right diagonal: (99+65)/2
  },
  // Right side vertical; bottom wider (134 mm) than top (101 mm).
  // Left diagonal runs from (33,0) to (0,94) → midpoint x = (33+0)/2 = 16.5 mm.
  'trap-b': {
    id: 'trap-b',
    label: 'Trapezoid B',
    widthMm: 134,
    heightMm: 94,
    points: [[33, 0], [134, 0], [134, 94], [0, 94]],
    snapLeftMm: 16.5, // midpoint of left diagonal: (33+0)/2
    snapRightMm: 134, // vertical right side → contact at bbox edge
  },
};

export const FRAME_TYPE_LIST: FrameTypeDef[] = [
  FRAME_TYPES['sm-rect'],
  FRAME_TYPES['md-rect'],
  FRAME_TYPES['lg-rect'],
  FRAME_TYPES['trap-a'],
  FRAME_TYPES['trap-b'],
];

/** Convert an array of [mm, mm] vertices to a flat pixel array for Konva */
export function pointsToPx(points: [number, number][]): number[] {
  return points.flatMap(([x, y]) => [x * PX_PER_MM, y * PX_PER_MM]);
}
