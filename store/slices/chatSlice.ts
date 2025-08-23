import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatMessage } from "@/utils/types/game";

const initialState: ChatMessage[] = [];

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    /** Add a new chat/guess/system message */
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.push(action.payload);
    },

    /** Add multiple messages at once (e.g. from server history) */
    addMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.push(...action.payload);
    },

    /** Clear all messages (e.g. on new game or leaving room) */
    clearMessages: () => [],

    /** Remove last N messages (useful for moderation) */
    removeLastMessages: (state, action: PayloadAction<number>) => {
      return state.slice(0, Math.max(0, state.length - action.payload));
    },
  },
});

export const { addMessage, addMessages, clearMessages, removeLastMessages } =
  chatSlice.actions;

export default chatSlice.reducer;
