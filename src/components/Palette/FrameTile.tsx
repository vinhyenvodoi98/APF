import { FRAME_TYPES, PX_PER_MM } from '../../lib/frames';
import type { FrameTypeId } from '../../lib/frames';

// All frames share 94mm height. Fix preview to 62px tall, derive width proportionally.
const PREVIEW_H = 62;
const PREVIEW_SCALE = PREVIEW_H / (94 * PX_PER_MM);

interface Props {
  typeId: FrameTypeId;
}

export function FrameTile({ typeId }: Props) {
  const ft = FRAME_TYPES[typeId];
  const w = Math.round(ft.widthMm * PX_PER_MM * PREVIEW_SCALE);
  const h = Math.round(ft.heightMm * PX_PER_MM * PREVIEW_SCALE);
  const pts = ft.points
    .map(([x, y]) => `${(x * PX_PER_MM * PREVIEW_SCALE).toFixed(1)},${(y * PX_PER_MM * PREVIEW_SCALE).toFixed(1)}`)
    .join(' ');

  function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    e.dataTransfer.setData('frameTypeId', typeId);
    e.dataTransfer.effectAllowed = 'copy';
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="group flex flex-col items-center gap-2.5 px-3 py-3 rounded-lg cursor-grab active:cursor-grabbing select-none transition-colors hover:bg-white/10 active:scale-95 active:transition-none"
      title={`Drag to add: ${ft.label}`}
    >
      {/* Shape preview */}
      <div className="flex items-center justify-center" style={{ height: PREVIEW_H }}>
        <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
          <polygon
            points={pts}
            fill="rgba(96,165,250,0.15)"
            stroke="#60a5fa"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Label */}
      <div className="flex items-center gap-1.5 w-full justify-between px-0.5">
        <span className="text-[11px] text-slate-300 font-medium leading-tight">{ft.label}</span>
        {/* Dimensions badge */}
        <span className="text-[9px] text-slate-500 font-mono leading-none whitespace-nowrap">
          {ft.widthMm}×{ft.heightMm}
        </span>
      </div>
    </div>
  );
}
