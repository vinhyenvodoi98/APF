import { Stage as KonvaStage, Layer, Rect, Line } from 'react-konva';
import type Konva from 'konva';
import type { RefObject } from 'react';
import { A4_WIDTH_PX, A4_HEIGHT_PX } from '../../lib/frames';
import { useFrameStore } from '../../store/useFrameStore';
import { FrameNode } from './FrameNode';

interface Props {
  stageRef: RefObject<Konva.Stage | null>;
  onSelectFrame: (id: string) => void;
  isDropActive?: boolean;
}

export function Stage({ stageRef, onSelectFrame, isDropActive }: Props) {
  const frames = useFrameStore((s) => s.frames);
  const dragFeedback = useFrameStore((s) => s.dragFeedback);
  const isEmpty = frames.length === 0;

  const showGuideV = dragFeedback?.guideX != null;
  const showGuideH = dragFeedback?.guideY != null;

  return (
    <div
      className="relative"
      style={{
        width: A4_WIDTH_PX,
        height: A4_HEIGHT_PX,
        boxShadow: isDropActive
          ? '0 0 0 3px #3b82f6, 0 8px 40px rgba(59,130,246,0.3)'
          : '0 4px 40px rgba(0,0,0,0.25)',
        transition: 'box-shadow 0.15s ease',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <KonvaStage ref={stageRef} width={A4_WIDTH_PX} height={A4_HEIGHT_PX}>
        {/* Main layer: white background + all frames */}
        <Layer>
          <Rect width={A4_WIDTH_PX} height={A4_HEIGHT_PX} fill="white" listening={false} />
          {frames.map((frame) => (
            <FrameNode key={frame.id} frame={frame} onSelect={onSelectFrame} />
          ))}
        </Layer>

        {/* Guide layer: snap lines rendered on top of everything */}
        <Layer listening={false}>
          {showGuideV && (
            <Line
              points={[dragFeedback!.guideX!, 0, dragFeedback!.guideX!, A4_HEIGHT_PX]}
              stroke={dragFeedback!.isValid ? '#3b82f6' : '#ef4444'}
              strokeWidth={1}
              dash={[5, 4]}
              opacity={0.7}
            />
          )}
          {showGuideH && (
            <Line
              points={[0, dragFeedback!.guideY!, A4_WIDTH_PX, dragFeedback!.guideY!]}
              stroke={dragFeedback!.isValid ? '#3b82f6' : '#ef4444'}
              strokeWidth={1}
              dash={[5, 4]}
              opacity={0.7}
            />
          )}
        </Layer>
      </KonvaStage>

      {/* Empty-state HTML overlay */}
      {isEmpty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3 opacity-30">
            <svg width="80" height="72" viewBox="0 0 80 72" fill="none">
              <rect x="1" y="1" width="30" height="42" rx="2" stroke="#374151" strokeWidth="1.5" strokeDasharray="4 3"/>
              <rect x="37" y="1" width="42" height="20" rx="2" stroke="#374151" strokeWidth="1.5" strokeDasharray="4 3"/>
              <rect x="37" y="27" width="42" height="44" rx="2" stroke="#374151" strokeWidth="1.5" strokeDasharray="4 3"/>
              <rect x="1" y="49" width="30" height="22" rx="2" stroke="#374151" strokeWidth="1.5" strokeDasharray="4 3"/>
              <path d="M20 36 L10 36 M14 32 L10 36 L14 40" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Blank manga page</p>
              <p className="text-xs text-gray-400 mt-1">Drag frames from the left panel to start</p>
            </div>
          </div>
        </div>
      )}

      {isDropActive && (
        <div className="absolute inset-0 pointer-events-none" style={{ border: '2px dashed #3b82f6', borderRadius: 2 }} />
      )}
    </div>
  );
}
