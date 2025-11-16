/**
 * Application Entry Point
 *
 * This file is the main entry for the React application.
 * It sets up:
 * - React 18 root rendering with `ReactDOM.createRoot`
 * - Strict Mode for highlighting potential problems
 * - Browser-based routing using `react-router-dom` (`BrowserRouter`)
 * - Global navigation via `RootNavigator`
 * - Global styles (`global.styles.css`)
 * - Toast notifications (`react-hot-toast`) with custom styles for
 *   success, error, loading, and custom states.
 *
 * Features:
 * - Customizable toast UI with consistent design tokens (colors, fonts, shadows)
 * - High z-index positioning to ensure toasts appear above UI layers
 * - Blur and border effects for a modern glassmorphism look
 *
 * @module main
 * @requires react
 * @requires react-dom
 * @requires react-router-dom
 * @requires react-hot-toast
 * @requires ./navigation/Root.navigator
 * @requires ./styles/global.styles.css
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import RootNavigator from "./navigation/Root.navigator";
import { Toaster } from "react-hot-toast";
import "./styles/global.styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <RootNavigator />
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={12}
        containerStyle={{
          top: 40,
          zIndex: 9999,
        }}
        toastOptions={{
          style: {
            fontSize: "14px",
            fontWeight: "500",
            borderRadius: "12px",
            boxShadow:
              "0 8px 30px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)",
            padding: "12px 20px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            maxWidth: "400px",
            lineHeight: "1.4",
          },

          success: {
            style: {
              backgroundColor: "rgba(16, 185, 129, 0.95)",
              color: "white",
              fontFamily: "var(--font-family)",
              border: "none",
            },
            icon: "🎯",
            iconTheme: {
              primary: "white",
              secondary: "rgba(16, 185, 129, 1)",
            },
            duration: 3000,
          },

          error: {
            style: {
              backgroundColor: "rgba(239, 68, 68, 0.95)",
              color: "white",
              fontFamily: "var(--font-family)",
              border: "none",
            },
            icon: "⚠️",
            iconTheme: {
              primary: "white",
              secondary: "rgba(239, 68, 68, 1)",
            },
            duration: 4000,
          },

          loading: {
            style: {
              backgroundColor: "rgba(59, 130, 246, 0.95)",
              color: "white",
              fontFamily: "var(--font-family)",
              border: "none",
            },
            icon: "⏳",
            duration: Infinity,
          },

          custom: {
            style: {
              backgroundColor: "rgba(139, 92, 246, 0.95)",
              color: "white",
              fontFamily: "var(--font-family)",
              border: "none",
            },
            duration: 2500,
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
