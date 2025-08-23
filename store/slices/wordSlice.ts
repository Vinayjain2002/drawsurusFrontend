import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Word } from "@/utils/types/game";

const initialState: Word = {
  word: "",
  category: undefined,
  difficulty: "easy",
  isActive: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const wordSlice = createSlice({
  name: "word",
  initialState,
  reducers: {
    setWord: (state, action: PayloadAction<string>) => {
      state.word = action.payload;
      state.updatedAt = new Date().toISOString();
    },
    setCategory: (state, action: PayloadAction<string | undefined>) => {
      state.category = action.payload;
      state.updatedAt = new Date().toISOString();
    },
    setDifficulty: (
      state,
      action: PayloadAction<"easy" | "medium" | "hard">
    ) => {
      state.difficulty = action.payload;
      state.updatedAt = new Date().toISOString();
    },
    setIsActive: (state, action: PayloadAction<boolean>) => {
      state.isActive = action.payload;
      state.updatedAt = new Date().toISOString();
    },
    resetWord: () => ({
      ...initialState,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  },
});

export const { setWord, setCategory, setDifficulty, setIsActive, resetWord } =
  wordSlice.actions;

export default wordSlice.reducer;
