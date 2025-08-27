import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  isGuestMode: false,
};

const guestModeSlice= createSlice({
    name: "guestMode",
initialState,
reducers: {
    setGuestMode: (state, action: PayloadAction<{isGuestMode: boolean}>)=>{
        state.isGuestMode= action.payload.isGuestMode;
    },
    toggleGuestMode: (state)=>{
        state.isGuestMode= !state.isGuestMode;
    }

}})

export const {setGuestMode, toggleGuestMode}= guestModeSlice.actions;
export default guestModeSlice.reducer;

