import { FRAME_TYPE_LIST } from '../../lib/frames';
import { FrameTile } from './FrameTile';

export function Palette() {
  return (
    <aside className="w-52 shrink-0 flex flex-col overflow-hidden" style={{ background: '#13141a' }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/8">
        <div className="flex items-center gap-2 mb-0.5">
          {/* Comic grid icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-blue-400 shrink-0">
            <rect x="1" y="1" width="5.5" height="8" rx="0.8" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="8.5" y="1" width="6.5" height="4.5" rx="0.8" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="8.5" y="7.5" width="6.5" height="7.5" rx="0.8" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="1" y="11" width="5.5" height="4" rx="0.8" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
          <span className="text-[11px] font-semibold text-white/90 uppercase tracking-widest">Frames</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-snug mt-1">Drag a shape onto the canvas</p>
      </div>

      {/* Frame tiles */}
      <div className="flex-1 overflow-y-auto py-2 px-2 flex flex-col gap-0.5">
        {FRAME_TYPE_LIST.map((ft) => (
          <FrameTile key={ft.id} typeId={ft.id} />
        ))}
      </div>

      {/* Footer hint */}
      <div className="border-t border-white/8 px-4 py-3">
        <div className="flex flex-col gap-1.5">
          <HintRow icon="👆" text="Click frame → add image" />
          <HintRow icon="↔" text="Drag frame to reposition" />
          <HintRow icon="✕" text="Right-click to remove" />
        </div>
      </div>
    </aside>
  );
}

function HintRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] w-4 text-center shrink-0">{icon}</span>
      <span className="text-[10px] text-slate-500 leading-tight">{text}</span>
    </div>
  );
}
