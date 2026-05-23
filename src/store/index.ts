import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";

// SSR-safe localStorage wrapper — redux-persist's default storage crashes in
// Node.js (TanStack Start SSR) because window/localStorage is unavailable.
const storage = {
  getItem: (key: string): Promise<string | null> => {
    if (typeof window === "undefined") return Promise.resolve(null);
    try {
      return Promise.resolve(window.localStorage.getItem(key));
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem: (key: string, value: string): Promise<void> => {
    if (typeof window === "undefined") return Promise.resolve();
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* quota or private browsing — silently ignore */
    }
    return Promise.resolve();
  },
  removeItem: (key: string): Promise<void> => {
    if (typeof window === "undefined") return Promise.resolve();
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* silently ignore */
    }
    return Promise.resolve();
  },
};
import bills from "./billSlice";
import ui from "./uiSlice";

const rootReducer = combineReducers({ bills, ui });

const persistConfig = {
  key: "billvault",
  storage,
  whitelist: ["ui"], // bills come from Drive, not localStorage
};

const persisted = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persisted,
  middleware: (gdm) =>
    gdm({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;