import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Word, Difficulty } from "@/utils/types/game";

interface WordState {
  currentWord: Word;
  customWords: string[];
  selectedCategory: string | undefined;
  selectedDifficulty: Difficulty;
}

const initialState: WordState = {
  currentWord: {
    word: "",
    category: undefined,
    difficulty: "easy",
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  customWords: [],
  selectedCategory: undefined,
  selectedDifficulty: "medium",
};

const wordSlice = createSlice({
  name: "word",
  initialState,
  reducers: {
    setWord: (state, action: PayloadAction<string>) => {
      state.currentWord.word = action.payload;
      state.currentWord.updatedAt = new Date().toISOString();
    },
    setCategory: (state, action: PayloadAction<string | undefined>) => {
      state.currentWord.category = action.payload;
      state.selectedCategory = action.payload;
      state.currentWord.updatedAt = new Date().toISOString();
    },
    setDifficulty: (state, action: PayloadAction<Difficulty>) => {
      state.currentWord.difficulty = action.payload;
      state.selectedDifficulty = action.payload;
      state.currentWord.updatedAt = new Date().toISOString();
    },
    setIsActive: (state, action: PayloadAction<boolean>) => {
      state.currentWord.isActive = action.payload;
      state.currentWord.updatedAt = new Date().toISOString();
    },
    setCustomWords: (state, action: PayloadAction<string[]>) => {
      state.customWords = action.payload;
    },
    addCustomWord: (state, action: PayloadAction<string>) => {
      if (!state.customWords.includes(action.payload)) {
        state.customWords.push(action.payload);
      }
    },
    removeCustomWord: (state, action: PayloadAction<string>) => {
      state.customWords = state.customWords.filter(word => word !== action.payload);
    },
    clearCustomWords: (state) => {
      state.customWords = [];
    },
    resetWord: (state) => ({
      ...state,
      currentWord: {
        word: "",
        category: undefined,
        difficulty: "easy",
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }),
  },
});

export const { 
  setWord, 
  setCategory, 
  setDifficulty, 
  setIsActive, 
  setCustomWords,
  addCustomWord,
  removeCustomWord,
  clearCustomWords,
  resetWord 
} = wordSlice.actions;

export default wordSlice.reducer;
