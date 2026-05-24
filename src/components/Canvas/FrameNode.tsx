import { useEffect, useRef, useState } from 'react';
import { Group, Line, Image as KonvaImage, Rect, Text } from 'react-konva';
import type Konva from 'konva';
import { FRAME_TYPES, PX_PER_MM, pointsToPx, A4_WIDTH_PX, A4_HEIGHT_PX } from '../../lib/frames';
import { useFrameStore, type PlacedFrame } from '../../store/useFrameStore';
import { computeSnap, type SnapResult } from '../../lib/snap';

function useHtmlImage(src?: string): HTMLImageElement | undefined {
  const [image, setImage] = useState<HTMLImageElement | undefined>();
  useEffect(() => {
    if (!src) { setImage(undefined); return; }
    const img = new window.Image();
    img.onload = () => setImage(img);
    img.src = src;
  }, [src]);
  return image;
}

function setContainerCursor(e: Konva.KonvaEventObject<MouseEvent | DragEvent>, cursor: string) {
  const c = e.target.getStage()?.container();
  if (c) c.style.cursor = cursor;
}

interface Props {
  frame: PlacedFrame;
  onSelect: (id: string) => void;
}

export function FrameNode({ frame, onSelect }: Props) {
  const ft = FRAME_TYPES[frame.typeId];
  const moveFrame = useFrameStore((s) => s.moveFrame);
  const removeFrame = useFrameStore((s) => s.removeFrame);
  const setDragFeedback = useFrameStore((s) => s.setDragFeedback);
  const image = useHtmlImage(frame.imageDataUrl);

  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValid, setDragValid] = useState(true);

  // Store last snap result so onDragMove can read it without recomputing
  const lastSnap = useRef<SnapResult>({ x: frame.x, y: frame.y, isValid: true, guideX: null, guideY: null });
  // Previous valid position for reverting on invalid drop
  const prevPos = useRef({ x: frame.x, y: frame.y });

  const w = ft.widthMm * PX_PER_MM;
  const h = ft.heightMm * PX_PER_MM;
  const pxPoints = pointsToPx(ft.points);

  const clipFunc = (ctx: Konva.Context) => {
    const pts = ft.points;
    ctx.beginPath();
    ctx.moveTo(pts[0][0] * PX_PER_MM, pts[0][1] * PX_PER_MM);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i][0] * PX_PER_MM, pts[i][1] * PX_PER_MM);
    }
    ctx.closePath();
  };

  function getOtherRects() {
    return useFrameStore.getState().frames.map((f) => ({
      id: f.id,
      x: f.x,
      y: f.y,
      w: FRAME_TYPES[f.typeId].widthMm * PX_PER_MM,
      h: FRAME_TYPES[f.typeId].heightMm * PX_PER_MM,
    }));
  }

  function dragBoundFunc(pos: { x: number; y: number }) {
    const result = computeSnap(pos.x, pos.y, w, h, getOtherRects(), frame.id);
    lastSnap.current = result;
    return { x: result.x, y: result.y };
  }

  function handleDragStart(e: Konva.KonvaEventObject<DragEvent>) {
    prevPos.current = { x: frame.x, y: frame.y };
    setIsDragging(true);
    setDragValid(true);
    setContainerCursor(e, 'grabbing');
  }

  function handleDragMove() {
    const { isValid, guideX, guideY } = lastSnap.current;
    setDragValid(isValid);
    setDragFeedback({ frameId: frame.id, isValid, guideX, guideY });
  }

  function handleDragEnd(e: Konva.KonvaEventObject<DragEvent>) {
    setIsDragging(false);
    setDragValid(true);
    setDragFeedback(null);
    setContainerCursor(e, 'pointer');

    const { isValid } = lastSnap.current;
    if (!isValid) {
      // Snap back to last valid position with a brief animation
      e.target.to({
        x: prevPos.current.x,
        y: prevPos.current.y,
        duration: 0.15,
        easing: Konva.Easings.EaseOut,
      });
      // Keep store position unchanged (already at prevPos)
    } else {
      moveFrame(frame.id, e.target.x(), e.target.y());
    }
  }

  const borderColor = isDragging
    ? (dragValid ? '#22c55e' : '#ef4444')
    : (hovered ? '#3b82f6' : '#1f2937');

  const borderWidth = isDragging || hovered ? 2.5 : 2;

  return (
    <Group
      x={frame.x}
      y={frame.y}
      draggable
      dragBoundFunc={dragBoundFunc}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onClick={() => { if (!isDragging) onSelect(frame.id); }}
      onTap={() => onSelect(frame.id)}
      onMouseEnter={(e) => { setHovered(true); setContainerCursor(e, 'pointer'); }}
      onMouseLeave={(e) => { setHovered(false); setContainerCursor(e, 'default'); }}
      onContextMenu={(e) => { e.evt.preventDefault(); removeFrame(frame.id); }}
    >
      {/* Clipped content */}
      <Group clipFunc={clipFunc}>
        <Rect width={w} height={h} fill={frame.imageDataUrl ? '#000' : '#f8f9fa'} />
        {image && <KonvaImage image={image} width={w} height={h} />}

        {!frame.imageDataUrl && (
          <>
            <Line points={pxPoints} closed stroke="#d1d5db" strokeWidth={1} dash={[6, 4]} fill="transparent" listening={false} />
            <Text
              text={hovered && !isDragging ? '+ Add image' : 'Click to add image'}
              width={w} height={h}
              align="center" verticalAlign="middle"
              fontSize={10}
              fill={hovered && !isDragging ? '#3b82f6' : '#9ca3af'}
            />
          </>
        )}

        {/* Drag-invalid red overlay (clipped to frame shape) */}
        {isDragging && !dragValid && (
          <Rect width={w} height={h} fill="rgba(239,68,68,0.35)" listening={false} />
        )}

        {/* Drag-valid green flash */}
        {isDragging && dragValid && (
          <Rect width={w} height={h} fill="rgba(34,197,94,0.12)" listening={false} />
        )}
      </Group>

      {/* Border — outside clip, changes colour with state */}
      <Line
        points={pxPoints}
        closed
        stroke={borderColor}
        strokeWidth={borderWidth}
        fill="transparent"
        listening={false}
      />
    </Group>
  );
}
