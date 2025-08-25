import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Game, Round, FinalScore, GameSettings, CorrectGuess, Player } from "@/utils/types/game";

export type GameState = "lobby" | "game" | "gameOver";

export interface LobbyData {
  roomId: string | null;
  players: Player[];
  settings: GameSettings;
  gameId: string | null;
  roomCode: string;
  status?: "waiting" | "playing" | "completed";
}

export interface GamePlayData {
  currentRound: number;
  currentDrawer: string;
  currentWord: string;
  wordHint: string;
  timeLeft: number;
  roundStartTime: number;
  isPaused?: boolean;
  showHint?: boolean;
}

export interface GameData extends LobbyData, GamePlayData {
  winner?: Player;
}

const initialState: GameData = {
  roomId: null,
  players: [],
  settings: {
    roundTime: 30,
    roundsPerGame: 3,
    wordDifficulty: "medium",
    maxPlayers: 8
  },
  gameId: null,
  roomCode: "",
  status: "waiting",
  currentRound: 1,
  currentDrawer: "",
  currentWord: "",
  wordHint: "",
  timeLeft: 30,
  roundStartTime: Date.now(),
  isPaused: false,
  showHint: false,
  winner: undefined
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    /** Set lobby data */
    setLobbyData: (state, action: PayloadAction<LobbyData>) => {
      Object.assign(state, action.payload);
    },

    /** Set game play data */
    setGamePlayData: (state, action: PayloadAction<GamePlayData>) => {
      Object.assign(state, action.payload);
    },

    /** Set current player */
    setCurrentPlayer: (state, action: PayloadAction<Player>) => {
      // Update or add player to the players array
      const existingPlayerIndex = state.players.findIndex(p => p.userId === action.payload.userId);
      if (existingPlayerIndex >= 0) {
        state.players[existingPlayerIndex] = action.payload;
      } else {
        state.players.push(action.payload);
      }
    },

    /** Add player to lobby */
    addPlayer: (state, action: PayloadAction<Player>) => {
      state.players.push(action.payload);
    },

    /** Remove player from lobby */
    removePlayer: (state, action: PayloadAction<string>) => {
      state.players = state.players.filter(p => p.userId !== action.payload);
    },

    /** Update player */
    updatePlayer: (state, action: PayloadAction<{ playerId: string; updates: Partial<Player> }>) => {
      const player = state.players.find(p => p.userId === action.payload.playerId);
      if (player) {
        Object.assign(player, action.payload.updates);
      }
    },

    /** Update game settings */
    updateSettings: (state, action: PayloadAction<Partial<GameSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    /** Set game state */
    setGameState: (state, action: PayloadAction<GameState>) => {
      state.status = action.payload === "lobby" ? "waiting" : 
                    action.payload === "game" ? "playing" : "completed";
    },

    /** Set winner */
    setWinner: (state, action: PayloadAction<Player>) => {
      state.winner = action.payload;
    },

    /** Update time left */
    updateTimeLeft: (state, action: PayloadAction<number>) => {
      state.timeLeft = action.payload;
    },

    /** Set current word and hint */
    setCurrentWord: (state, action: PayloadAction<{ word: string; hint: string }>) => {
      state.currentWord = action.payload.word;
      state.wordHint = action.payload.hint;
    },

    /** Set current drawer */
    setCurrentDrawer: (state, action: PayloadAction<string>) => {
      state.currentDrawer = action.payload;
    },

    /** Toggle pause state */
    togglePause: (state) => {
      state.isPaused = !state.isPaused;
    },

    /** Toggle hint visibility */
    toggleHint: (state) => {
      state.showHint = !state.showHint;
    },

    /** Reset game state */
    resetGame: () => initialState,

    /** Clear current player */
    clearCurrentPlayer: (state) => {
      state.players = [];
      state.roomId = null;
      state.gameId = null;
      state.roomCode = "";
      state.status = "waiting";
    }
  },
});

export const {
  setLobbyData,
  setGamePlayData,
  setCurrentPlayer,
  addPlayer,
  removePlayer,
  updatePlayer,
  updateSettings,
  setGameState,
  setWinner,
  updateTimeLeft,
  setCurrentWord,
  setCurrentDrawer,
  togglePause,
  toggleHint,
  resetGame,
  clearCurrentPlayer,
} = gameSlice.actions;

export default gameSlice.reducer;
