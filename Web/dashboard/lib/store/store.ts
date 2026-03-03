import { configureStore } from "@reduxjs/toolkit";
import { lawyersApi } from "@/lib/features/lawyers/api";
import { courtsApi } from "@/lib/features/courts/api";
import { postsApi } from "@/lib/features/posts/api";
import { authApi } from "@/lib/features/auth/api";

export const makeStore = () =>
  configureStore({
    reducer: {
      [lawyersApi.reducerPath]: lawyersApi.reducer,
      [courtsApi.reducerPath]: courtsApi.reducer,
      [postsApi.reducerPath]: postsApi.reducer,
      [authApi.reducerPath]: authApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        authApi.middleware,
        lawyersApi.middleware,
        courtsApi.middleware,
        postsApi.middleware,
      ),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
