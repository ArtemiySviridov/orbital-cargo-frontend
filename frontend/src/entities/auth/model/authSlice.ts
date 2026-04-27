import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { tokenStorage } from "@/shared/api/tokenStorage";
import type { IAuthState, ILoginResponse, IUser } from "./types";

const initialState: IAuthState = {
  user: null,
  accessToken: tokenStorage.getAccessToken(),
  role: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<ILoginResponse>) => {
      state.accessToken = action.payload.access_token;
      state.role = action.payload.role;
      tokenStorage.setAccessToken(action.payload.access_token);
    },
    setUser: (state, action: PayloadAction<IUser | null>) => {
      state.user = action.payload;
      state.role = action.payload?.role ?? state.role;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.role = null;
      tokenStorage.clearAccessToken();
    },
  },
});

export const authActions = authSlice.actions;
export const authReducer = authSlice.reducer;

interface AuthRootState {
  auth: IAuthState;
}

export const selectAuth = (state: AuthRootState) => state.auth;
export const selectIsAuthenticated = (state: AuthRootState) =>
  Boolean(state.auth.accessToken);
