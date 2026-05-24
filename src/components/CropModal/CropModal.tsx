import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { FRAME_TYPES, PX_PER_MM } from '../../lib/frames';
import type { FrameTypeId } from '../../lib/frames';
import { getCroppedImg } from '../../lib/cropImage';

interface Props {
  typeId: FrameTypeId;
  currentImage?: string;
  onConfirm: (dataUrl: string) => void;
  onClose: () => void;
}

export function CropModal({ typeId, currentImage, onConfirm, onClose }: Props) {
  const ft = FRAME_TYPES[typeId];
  const aspect = ft.widthMm / ft.heightMm;

  const [imageSrc, setImageSrc] = useState<string | null>(currentImage ?? null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    };
    reader.readAsDataURL(file);
  }

  async function handleConfirm() {
    if (!imageSrc || !croppedAreaPixels) return;
    setLoading(true);
    try {
      const outputW = Math.round(ft.widthMm * PX_PER_MM);
      const outputH = Math.round(ft.heightMm * PX_PER_MM);
      const dataUrl = await getCroppedImg(imageSrc, croppedAreaPixels, outputW, outputH);
      onConfirm(dataUrl);
    } finally {
      setLoading(false);
    }
  }

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {/* Shape mini-preview */}
            <FrameShapePreview typeId={typeId} />
            <div>
              <h2 className="font-semibold text-gray-900 text-sm leading-tight">Add Image to Frame</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {ft.label} · {ft.widthMm}×{ft.heightMm} mm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none mt-0.5"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">
          {/* Upload area */}
          {!imageSrc ? (
            <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-xl py-10 cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-gray-400 group-hover:text-blue-500 transition-colors">
                  <path d="M9 2v10M5 6l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="text-center">
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Choose an image</span>
                <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP</p>
              </div>
              <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
            </label>
          ) : (
            <>
              {/* Cropper */}
              <div className="relative rounded-xl overflow-hidden bg-gray-900" style={{ height: 280 }}>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspect}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              {/* Zoom + re-pick */}
              <div className="flex items-center gap-3">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400 shrink-0">
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M11 11l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <path d="M4 6h4M6 4v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-blue-600"
                />
                <label className="text-xs text-blue-600 font-medium cursor-pointer hover:text-blue-700 shrink-0">
                  Change
                  <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
                </label>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
          <p className="text-xs text-gray-400">Crop is locked to frame aspect ratio</p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!imageSrc || !croppedAreaPixels || loading}
              className="px-4 py-1.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Applying…' : 'Apply crop'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Tiny SVG preview of the frame shape shown in the modal header */
function FrameShapePreview({ typeId }: { typeId: FrameTypeId }) {
  const ft = FRAME_TYPES[typeId];
  const PX_PER_MM = 3.7795275591;
  const scale = 32 / (94 * PX_PER_MM);
  const w = Math.round(ft.widthMm * PX_PER_MM * scale);
  const h = Math.round(ft.heightMm * PX_PER_MM * scale);
  const pts = ft.points
    .map(([x, y]) => `${(x * PX_PER_MM * scale).toFixed(1)},${(y * PX_PER_MM * scale).toFixed(1)}`)
    .join(' ');

  return (
    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
      <svg width={w} height={h} style={{ overflow: 'visible' }}>
        <polygon points={pts} fill="#dbeafe" stroke="#3b82f6" strokeWidth={1.2} />
      </svg>
    </div>
  );
}
