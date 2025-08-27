import { Player } from "@/utils/types/game";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: Player= {
    userId: "",
    username: "",
    isHost: false,
    isReady: false,
    avatar: "",
    isDrawing: false,
    joinedAt: "",
    score: 0,
    correctGuesses: 0,
    drawings: 0
}

const playerSlice= createSlice({
    name: "player",
    initialState,
    reducers: {
        setPlayerDetails: (state, action: PayloadAction<{userId: string; username: string; isHost: boolean; avatar: string; joinedAt: string}>) => {
            state.userId = action.payload.userId;
            state.username = action.payload.username;
            state.isHost = action.payload.isHost;
            state.avatar = action.payload.avatar;
            state.joinedAt = action.payload.joinedAt;
        },
        setReadyStatus: (state, action) => {
            state.isReady = action.payload;
        },
        setDrawingStatus: (state, action) => {
            state.isDrawing = action.payload;
        },
        updateScore: (state, action) => {
            state.score += action.payload;
        },
        incrementCorrectGuesses: (state) => {
            state.correctGuesses += 1;
        },
        incrementDrawings: (state) => {
            state.drawings += 1;
        },
        resetPlayer: () => initialState
    }
})

export const { setPlayerDetails, setReadyStatus, setDrawingStatus, updateScore, incrementCorrectGuesses, incrementDrawings, resetPlayer } = playerSlice.actions;
export default playerSlice.reducer;