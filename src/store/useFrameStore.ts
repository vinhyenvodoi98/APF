import { create } from 'zustand';
import type { FrameTypeId } from '../lib/frames';

export interface PlacedFrame {
  id: string;
  typeId: FrameTypeId;
  x: number;
  y: number;
  imageDataUrl?: string;
}

export interface DragFeedback {
  frameId: string;
  isValid: boolean;
  guideX: number | null; // x of vertical snap guide line
  guideY: number | null; // y of horizontal snap guide line
}

interface FrameStore {
  frames: PlacedFrame[];
  dragFeedback: DragFeedback | null;
  addFrame: (typeId: FrameTypeId, x: number, y: number) => void;
  setImage: (id: string, dataUrl: string) => void;
  moveFrame: (id: string, x: number, y: number) => void;
  removeFrame: (id: string) => void;
  setDragFeedback: (fb: DragFeedback | null) => void;
}

export const useFrameStore = create<FrameStore>((set) => ({
  frames: [],
  dragFeedback: null,

  addFrame: (typeId, x, y) =>
    set((state) => ({
      frames: [...state.frames, { id: crypto.randomUUID(), typeId, x, y }],
    })),
  setImage: (id, dataUrl) =>
    set((state) => ({
      frames: state.frames.map((f) =>
        f.id === id ? { ...f, imageDataUrl: dataUrl } : f,
      ),
    })),
  moveFrame: (id, x, y) =>
    set((state) => ({
      frames: state.frames.map((f) =>
        f.id === id ? { ...f, x, y } : f,
      ),
    })),
  removeFrame: (id) =>
    set((state) => ({
      frames: state.frames.filter((f) => f.id !== id),
    })),
  setDragFeedback: (fb) => set({ dragFeedback: fb }),
}));
