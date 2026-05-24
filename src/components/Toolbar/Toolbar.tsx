import type { RefObject } from 'react';
import type Konva from 'konva';
import { exportToPdf } from '../../lib/pdf';
import { useFrameStore } from '../../store/useFrameStore';

interface Props {
  stageRef: RefObject<Konva.Stage | null>;
}

export function Toolbar({ stageRef }: Props) {
  const frameCount = useFrameStore((s) => s.frames.length);
  const filledCount = useFrameStore((s) => s.frames.filter((f) => f.imageDataUrl).length);

  function handleExport() {
    if (!stageRef.current) return;
    exportToPdf(stageRef.current);
  }

  return (
    <header className="h-12 shrink-0 bg-white border-b border-gray-200 flex items-center px-4 gap-3">
      {/* Branding */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-gray-900 flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white">
            <rect x="1" y="1" width="5.5" height="8" rx="0.8" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="8.5" y="1" width="6.5" height="4.5" rx="0.8" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="8.5" y="7.5" width="6.5" height="7.5" rx="0.8" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="1" y="11" width="5.5" height="4" rx="0.8" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
        </div>
        <span className="font-semibold text-gray-900 text-sm tracking-tight">Comic Builder</span>
      </div>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* Status */}
      {frameCount > 0 ? (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
            {frameCount} {frameCount === 1 ? 'frame' : 'frames'}
          </span>
          {filledCount > 0 && (
            <>
              <span>·</span>
              <span>{filledCount} with image</span>
            </>
          )}
        </div>
      ) : (
        <span className="text-xs text-gray-400">A4 portrait · 210×297 mm</span>
      )}

      <div className="flex-1" />

      {/* Export */}
      <button
        onClick={handleExport}
        disabled={frameCount === 0}
        className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M6.5 1v8M3.5 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M1 10.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        Download PDF
      </button>
    </header>
  );
}
