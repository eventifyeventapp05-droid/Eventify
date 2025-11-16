/**
 * Redux Store Configuration
 *
 * This file configures the global Redux store with persistence support.
 * It integrates:
 * - Redux Toolkit for simplified store setup
 * - Redux Persist for persisting and rehydrating state from localStorage
 * - Multiple slice reducers
 *
 * The store is designed to ensure authentication state is preserved
 * across sessions, while other slices remain non-persistent for performance
 * and data freshness.
 */

import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { combineReducers } from "redux";
import authReducer from "../slices/auth.slice";
import superAdminReducer from "../slices/super-admin.slice";
import userReducer from "../slices/user.slice";
import organizerReducer from "../slices/organizer.slice";
import eventReducer from "../slices/event.slice";
import bookingReducer from "../slices/ticket-booking.slice";

/**
 * A wrapper around localStorage to provide async-like
 * behavior for Redux Persist compatibility.
 */
const localStorageWrapper = {
  getItem: (key) => {
    return new Promise((resolve) => {
      resolve(localStorage.getItem(key));
    });
  },
  setItem: (key, value) => {
    return new Promise((resolve) => {
      localStorage.setItem(key, value);
      resolve();
    });
  },
  removeItem: (key) => {
    return new Promise((resolve) => {
      localStorage.removeItem(key);
      resolve();
    });
  },
};

/**
 * Persistence configuration for Redux Persist.
 * Only the `auth` slice is whitelisted for persistence.
 */
const persistConfig = {
  key: "root",
  storage: localStorageWrapper,
  whitelist: ["auth"],
};

/**
 * Root reducer combining all feature slices.
 */
const rootReducer = combineReducers({
  auth: authReducer,
  superAdmin: superAdminReducer,
  users: userReducer,
  organizers: organizerReducer,
  events: eventReducer,
  bookings: bookingReducer,
});

/**
 * Wraps the root reducer with persistence capabilities.
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Redux store instance with persistence and middleware setup.
 */
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/REHYDRATE"],
      },
    }),
});

/**
 * Redux Persist persistor instance, used to persist and rehydrate the store.
 */
const persistor = persistStore(store);

export { store, persistor };
