import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Drawing, Stroke } from "@/utils/types/game";

const initialState: Drawing = {
  drawingId: "",
  strokes: [],
  canvasWidth: 800,
  canvasHeight: 600,
  drawingTime: 0,
  createdAt: new Date().toISOString(),
  completedAt: null,
  drawerId: undefined,
  drawerUsername: undefined,
  word: undefined,
};

const drawingSlice = createSlice({
  name: "drawing",
  initialState,
  reducers: {
    /** Initialize new drawing */
    startDrawing: (
      state,
      action: PayloadAction<{ drawingId: string; drawerId: string; drawerUsername: string; word?: string }>
    ) => {
      state.drawingId = action.payload.drawingId;
      state.drawerId = action.payload.drawerId;
      state.drawerUsername = action.payload.drawerUsername;
      state.word = action.payload.word;
      state.createdAt = new Date().toISOString();
      state.strokes = [];
      state.completedAt = null;
      state.drawingTime = 0;
    },

    /** Add stroke */
    addStroke: (state, action: PayloadAction<Stroke>) => {
      state.strokes.push(action.payload);
      state.drawingTime = (state.drawingTime || 0) + 1;
    },

    /** Remove last stroke (undo) */
    undoStroke: (state) => {
      state.strokes.pop();
    },

    /** Clear entire drawing */
    clearDrawing: (state) => {
      state.strokes = [];
    },

    /** Finish drawing */
    completeDrawing: (state) => {
      state.completedAt = new Date().toISOString();
    },

    /** Resize canvas (if user resizes browser/game canvas) */
    setCanvasSize: (state, action: PayloadAction<{ width: number; height: number }>) => {
      state.canvasWidth = action.payload.width;
      state.canvasHeight = action.payload.height;
    },

    /** Reset state */
    resetDrawing: () => initialState,
  },
});

export const {
  startDrawing,
  addStroke,
  undoStroke,
  clearDrawing,
  completeDrawing,
  setCanvasSize,
  resetDrawing,
} = drawingSlice.actions;

export default drawingSlice.reducer;
