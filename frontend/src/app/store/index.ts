import { configureStore } from "@reduxjs/toolkit";
import cargoReducer from "@/entities/cargo/model/cargoSlice";
import { authApi, authReducer } from "@/entities/auth";
import { orderApi } from "@/entities/application";

export const store = configureStore({
  reducer: {
    cargo: cargoReducer,
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, orderApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;