import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import { productApi } from "../features/products/productApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,

    [productApi.reducerPath]: productApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(productApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
