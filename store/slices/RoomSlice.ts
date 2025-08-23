import { Round } from "@/utils/types/game";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: Round = {
  roundNumber: 1,
  word: "",
  drawerId: "",
  drawerUsername: "",
  startTime: Date.now().toString(),
  endTime: null,
  duration: null,
  correctGuesses: [],
  drawings: [],
  messages: [],
};

const roundSlice = createSlice({
  name: "round",
  initialState,
  reducers: {
    setRoundNumber: (state, action: PayloadAction<Round["roundNumber"]>) => {
      state.roundNumber = action.payload;
    },
    setWord: (state, action: PayloadAction<string>) => {
      state.word = action.payload;
    },
    setDrawer: (
      state,
      action: PayloadAction<{ id: string; username: string }>
    ) => {
      state.drawerId = action.payload.id;
      state.drawerUsername = action.payload.username;
    },
    setTimer: (
      state,
      action: PayloadAction<{ start: string; end: string | null }>
    ) => {
      state.startTime = action.payload.start;
      state.endTime = action.payload.end;
    },
    resetRound: () => initialState,
    // We are left updating the data related to the Sockets
  },
});

export const {
  setRoundNumber,
  setWord,
  setDrawer,
  setTimer,
  resetRound,
} = roundSlice.actions;

export default roundSlice.reducer;
