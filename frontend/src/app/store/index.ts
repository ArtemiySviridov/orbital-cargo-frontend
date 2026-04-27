import { configureStore } from "@reduxjs/toolkit";
import cargoReducer from "@/entities/cargo/model/cargoSlice";
import { authApi, authReducer } from "@/entities/auth";
import { orderApi } from "@/entities/application";
import { elevatorApi, adminApi } from "@/entities/elevator";

export const store = configureStore({
  reducer: {
    cargo: cargoReducer,
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [elevatorApi.reducerPath]: elevatorApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      orderApi.middleware,
      elevatorApi.middleware,
      adminApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;