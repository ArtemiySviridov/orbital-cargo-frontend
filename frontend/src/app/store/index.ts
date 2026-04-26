import { configureStore } from "@reduxjs/toolkit";
import cargoReducer from "@/entities/cargo/model/cargoSlice";
import { authApi, authReducer } from "@/entities/auth";

export const store = configureStore({
  reducer: {
    cargo: cargoReducer,
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;