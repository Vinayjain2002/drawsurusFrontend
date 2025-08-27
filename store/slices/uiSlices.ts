import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showJoinScreen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setShowJoinScreen: (state, action) => {
      state.showJoinScreen = action.payload;
    },
    toggleJoinScreen: (state) => {
      state.showJoinScreen = !state.showJoinScreen;
    },
  },
});

export const { setShowJoinScreen, toggleJoinScreen } = uiSlice.actions;
export default uiSlice.reducer;