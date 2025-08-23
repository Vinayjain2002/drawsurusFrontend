import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserStats } from "@/utils/types/game";

const initialState: UserStats = {
  userId: "",
  gamesPlayed: 0,
  gamesWon: 0,
  totalPoints: 0,
  avgGuessSpeed: 0,
  correctGuesses: 0,
  drawnWords: 0,
  lastGamePlayedAt: null,
  enterpriseTag: "",
  statistics: {
    totalRoundsPlayed: 0,
    totalRoundsWon: 0,
    fastestGuess: null,
    longestDrawing: null,
    averageDrawingTime: 0,
    totalDrawingTime: 0,
    totalGuessTime: 0,
    streakDays: 0,
    currentStreak: 0,
    lastPlayedDate: null,
  },
  achievements: [],
  weeklyStats: {
    gamesPlayed: 0,
    points: 0,
    correctGuesses: 0,
    drawings: 0,
    weekStart: null,
  },
  monthlyStats: {
    gamesPlayed: 0,
    points: 0,
    correctGuesses: 0,
    drawings: 0,
    monthStart: null,
  },
};

const userStatsSlice = createSlice({
  name: "userStats",
  initialState,
  reducers: {
    setUserStats: (_, action: PayloadAction<UserStats>) => action.payload,

    incrementGamesPlayed: (state) => {
      state.gamesPlayed += 1;
      state.statistics.totalRoundsPlayed += 1;
      state.lastGamePlayedAt = new Date().toISOString();
    },

    incrementGamesWon: (state) => {
      state.gamesWon += 1;
      state.statistics.totalRoundsWon += 1;
    },

    addPoints: (state, action: PayloadAction<number>) => {
      state.totalPoints += action.payload;
      state.weeklyStats.points += action.payload;
      state.monthlyStats.points += action.payload;
    },

    addCorrectGuess: (state, action: PayloadAction<number>) => {
      state.correctGuesses += action.payload;
      state.weeklyStats.correctGuesses += action.payload;
      state.monthlyStats.correctGuesses += action.payload;
    },

    addDrawing: (state) => {
      state.drawnWords += 1;
      state.weeklyStats.drawings += 1;
      state.monthlyStats.drawings += 1;
    },

    updateGuessSpeed: (state, action: PayloadAction<number>) => {
      state.avgGuessSpeed =
        (state.avgGuessSpeed * state.correctGuesses + action.payload) /
        (state.correctGuesses + 1);

      if (
        state.statistics.fastestGuess === null ||
        action.payload < state.statistics.fastestGuess
      ) {
        state.statistics.fastestGuess = action.payload;
      }
    },

    updateDrawingTime: (state, action: PayloadAction<number>) => {
      state.statistics.totalDrawingTime += action.payload;
      state.statistics.totalRoundsPlayed += 1;
      state.statistics.averageDrawingTime =
        state.statistics.totalDrawingTime / state.statistics.totalRoundsPlayed;

      if (
        state.statistics.longestDrawing === null ||
        action.payload > state.statistics.longestDrawing
      ) {
        state.statistics.longestDrawing = action.payload;
      }
    },

    unlockAchievement: (
      state,
      action: PayloadAction<{
        name: string;
        description: string;
        icon: string;
      }>
    ) => {
      state.achievements.push({
        ...action.payload,
        unlockedAt: new Date().toISOString(),
      });
    },

    resetStats: () => initialState,
  },
});

export const {
  setUserStats,
  incrementGamesPlayed,
  incrementGamesWon,
  addPoints,
  addCorrectGuess,
  addDrawing,
  updateGuessSpeed,
  updateDrawingTime,
  unlockAchievement,
  resetStats,
} = userStatsSlice.actions;

export default userStatsSlice.reducer;
