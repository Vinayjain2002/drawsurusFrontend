import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Game, Round, FinalScore, GameSettings, CorrectGuess } from "@/utils/types/game";

 

const initialState: Game = {
  _id: undefined,
  roomId: "",
  rounds: [],
  gameStartedAt: new Date().toISOString(),
  gameEndedAt: null,
  status: "waiting",
  settings: {
   roundTime: 60,
   roundsPerGame: 8,
   wordDifficulty: "medium",
   allowCustomWords: false,
   maxPlayers: 8,
  } as GameSettings,
  finalScores: [],
  enterpriseTag: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    /** Replace game with server state */
    setGame: (_, action: PayloadAction<Game>) => action.payload,

    /** Start a new game */
    startGame: (state) => {
      state.status = "playing";
      state.gameStartedAt = new Date().toISOString();
      state.updatedAt = new Date().toISOString();
    },

    /** End game */
    endGame: (state) => {
      state.status = "completed";
      state.gameEndedAt = new Date().toISOString();
      state.updatedAt = new Date().toISOString();
    },

    /** Cancel game */
    cancelGame: (state) => {
      state.status = "cancelled";
      state.gameEndedAt = new Date().toISOString();
      state.updatedAt = new Date().toISOString();
    },

    /** Add a new round */
    addRound: (state, action: PayloadAction<Round>) => {
      state.rounds.push(action.payload);
      state.updatedAt = new Date().toISOString();
    },

    /** Update a round (e.g. endTime, messages, guesses) */
    updateRound: (
      state,
      action: PayloadAction<{ roundNumber: number; data: Partial<Round> }>
    ) => {
      const round = state.rounds.find(
        (r) => r.roundNumber === action.payload.roundNumber
      );
      if (round) {
        Object.assign(round, action.payload.data);
        state.updatedAt = new Date().toISOString();
      }
    },

    /** Add a correct guess to a round */
    addCorrectGuess: (
      state,
      action: PayloadAction<{ roundNumber: number; guess: CorrectGuess }>
    ) => {
      const round = state.rounds.find(
        (r) => r.roundNumber === action.payload.roundNumber
      );
      if (round) {
        round.correctGuesses.push(action.payload.guess);
        state.updatedAt = new Date().toISOString();
      }
    },

    /** Set game settings */
    setSettings: (state, action: PayloadAction<GameSettings>) => {
      state.settings = action.payload;
      state.updatedAt = new Date().toISOString();
    },

    /** Assign final scores */
    setFinalScores: (state, action: PayloadAction<FinalScore[]>) => {
      state.finalScores = action.payload;
      state.updatedAt = new Date().toISOString();
    },

    /** Reset whole game state */
    resetGame: () => initialState,
  },
});

export const {
  setGame,
  startGame,
  endGame,
  cancelGame,
  addRound,
  updateRound,
  addCorrectGuess,
  setSettings,
  setFinalScores,
  resetGame,
} = gameSlice.actions;

export default gameSlice.reducer;
