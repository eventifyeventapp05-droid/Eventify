/**
 * Root Navigator
 *
 * This component sets up the top-level application providers
 * and navigation structure. It integrates:
 * - Redux for global state management
 * - Redux Persist for persisting state across sessions
 * - React Router for navigation and routing
 *
 * The RootNavigator ensures that all child components
 * have access to the global store and persisted state,
 * while managing navigation through AppNavigator.
 */

import { Routes, Route } from "react-router-dom";
import AppNavigator from "./App.navigator.jsx";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../redux/store/store.store";

/**
 * Wraps the app with Redux Provider, PersistGate,
 * and React Router's route configuration.
 *
 * @returns {JSX.Element} The root navigation and provider setup.
 */
const RootNavigator = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Routes>
          <Route path="/*" element={<AppNavigator />} />
        </Routes>
      </PersistGate>
    </Provider>
  );
};

export default RootNavigator;
