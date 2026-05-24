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
}

export const FRAME_TYPES: Record<FrameTypeId, FrameTypeDef> = {
  'sm-rect': {
    id: 'sm-rect',
    label: 'Small Rectangle',
    widthMm: 65,
    heightMm: 94,
    points: [[0, 0], [65, 0], [65, 94], [0, 94]],
  },
  'md-rect': {
    id: 'md-rect',
    label: 'Medium Rectangle',
    widthMm: 135,
    heightMm: 94,
    points: [[0, 0], [135, 0], [135, 94], [0, 94]],
  },
  'lg-rect': {
    id: 'lg-rect',
    label: 'Large Rectangle',
    widthMm: 205,
    heightMm: 94,
    points: [[0, 0], [205, 0], [205, 94], [0, 94]],
  },
  // Left side vertical; top edge (99 mm) wider than bottom (65 mm) — slants right at bottom
  'trap-a': {
    id: 'trap-a',
    label: 'Trapezoid A',
    widthMm: 99,
    heightMm: 94,
    points: [[0, 0], [99, 0], [65, 94], [0, 94]],
  },
  // Right side vertical; bottom edge (134 mm) wider than top (101 mm) — slants right at top
  'trap-b': {
    id: 'trap-b',
    label: 'Trapezoid B',
    widthMm: 134,
    heightMm: 94,
    points: [[33, 0], [134, 0], [134, 94], [0, 94]],
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
