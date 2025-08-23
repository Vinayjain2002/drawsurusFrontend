import { User } from "@/utils/types/game";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: User = {
  userName: "",
  email: "",
  passwordHash: "",
  avatar: "",
  createdAt: Date.now().toString(),  // ✅ corrected
  isAdmin: false,
  currentRoomId: "",
  isOnline: true,
  totalGamesPlayed: 0,
  totalWins: 0,
  enterpriseTag: "",
  isGuest: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserDetails: (
      state,
      action: PayloadAction<{ userName: string; email: string }>
    ) => {
      state.userName = action.payload.userName;
      state.email = action.payload.email;
    },
    setAvatar: (state, action: PayloadAction<string>) => {
      state.avatar = action.payload;
    },
    setCurrentRoom: (state, action: PayloadAction<string>) => {
      state.currentRoomId = action.payload;
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    incrementGamesPlayed: (state) => {
      state.totalGamesPlayed += 1;
    },
    incrementWins: (state) => {
      state.totalWins += 1;
    },
    resetUser: () => initialState,
  },
});

export const {
  setUserDetails,
  setAvatar,
  setCurrentRoom,
  setOnlineStatus,
  incrementGamesPlayed,
  incrementWins,
  resetUser,
} = userSlice.actions;

export default userSlice.reducer;
