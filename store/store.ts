import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import gameReducer from "./slices/GameSlice";
import roomReducer from "./slices/RoomSlice";
import chatReducer from "./slices/chatSlice";
import wordReducer from "./slices/wordSlice"; 
import drawingReducer from "./slices/Drawing"; 
import statsReducer from "./slices/userStatsSlice"; 

export const store = configureStore({
  reducer: {
    user: userReducer,
    game: gameReducer,
    room: roomReducer,
    chat: chatReducer,
    word: wordReducer,
    drawing: drawingReducer,
    stats: statsReducer,
  },
});

// Infer types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
