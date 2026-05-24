import { useRef, useState, useCallback } from 'react';
import type Konva from 'konva';
import { Palette } from './components/Palette/Palette';
import { Stage } from './components/Canvas/Stage';
import { Toolbar } from './components/Toolbar/Toolbar';
import { CropModal } from './components/CropModal/CropModal';
import { useFrameStore } from './store/useFrameStore';
import { FRAME_TYPES, PX_PER_MM, A4_WIDTH_PX, A4_HEIGHT_PX } from './lib/frames';
import { computeSnap } from './lib/snap';
import type { FrameTypeId } from './lib/frames';

export function App() {
  const stageRef = useRef<Konva.Stage>(null);
  const stageContainerRef = useRef<HTMLDivElement>(null);

  const addFrame = useFrameStore((s) => s.addFrame);
  const setImage = useFrameStore((s) => s.setImage);
  const frames = useFrameStore((s) => s.frames);

  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [isDropActive, setIsDropActive] = useState(false);

  const selectedFrame = frames.find((f) => f.id === selectedFrameId);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDropActive) setIsDropActive(true);
  }, [isDropActive]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDropActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDropActive(false);

    const typeId = e.dataTransfer.getData('frameTypeId') as FrameTypeId;
    if (!typeId || !stageContainerRef.current) return;

    const ft = FRAME_TYPES[typeId];
    const rect = stageContainerRef.current.getBoundingClientRect();
    const dragW = ft.widthMm * PX_PER_MM;
    const dragH = ft.heightMm * PX_PER_MM;

    // Center the frame on the cursor first
    const rawX = e.clientX - rect.left - dragW / 2;
    const rawY = e.clientY - rect.top - dragH / 2;

    // Build rects from current frames for snap computation
    const others = useFrameStore.getState().frames.map((f) => {
      const fType = FRAME_TYPES[f.typeId];
      return {
        id: f.id,
        x: f.x,
        y: f.y,
        w: fType.widthMm  * PX_PER_MM,
        h: fType.heightMm * PX_PER_MM,
        snapLeft:  fType.snapLeftMm  * PX_PER_MM,
        snapRight: fType.snapRightMm * PX_PER_MM,
      };
    });

    const dragSnapLeft  = ft.snapLeftMm  * PX_PER_MM;
    const dragSnapRight = ft.snapRightMm * PX_PER_MM;

    // Apply snap (use a temporary id so it's excluded from nothing)
    const { x, y } = computeSnap(rawX, rawY, dragW, dragH, others, '__new__', dragSnapLeft, dragSnapRight);

    // Only add if within A4 (snap already clamps, so this is always true,
    // but we skip adding if the raw position was wildly outside the canvas)
    const insideA4 = rawX + dragW > 0 && rawX < A4_WIDTH_PX && rawY + dragH > 0 && rawY < A4_HEIGHT_PX;
    if (!insideA4) return;

    addFrame(typeId, x, y);
  }, [addFrame]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f1f2f4' }}>
      <Palette />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Toolbar stageRef={stageRef} />

        <div
          className="flex-1 overflow-auto"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        >
          <div className="flex items-start justify-center p-10 min-h-full min-w-0">
            <div
              ref={stageContainerRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Stage
                stageRef={stageRef}
                onSelectFrame={setSelectedFrameId}
                isDropActive={isDropActive}
              />
            </div>
          </div>
        </div>
      </div>

      {selectedFrame && (
        <CropModal
          typeId={selectedFrame.typeId}
          currentImage={selectedFrame.imageDataUrl}
          onConfirm={(dataUrl) => {
            setImage(selectedFrame.id, dataUrl);
            setSelectedFrameId(null);
          }}
          onClose={() => setSelectedFrameId(null)}
        />
      )}
    </div>
  );
}

export default App;
