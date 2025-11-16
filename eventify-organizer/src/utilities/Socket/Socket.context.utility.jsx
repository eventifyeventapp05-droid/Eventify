import React, { createContext, useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import Socket from "./Socket.utility";

/**
 * React Context for providing socket instance to components
 * @type {React.Context<import('socket.io-client').Socket>}
 */
const SocketContext = createContext();

/**
 * Socket Provider component that manages socket connection lifecycle
 *
 * - Reads the auth token from Redux (persisted store).
 * - Attaches the token to the socket authentication payload.
 * - Handles connection, disconnection, and error events.
 * - Cleans up on unmount.
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped
 *
 * @example
 * <SocketProvider>
 *   <App />
 * </SocketProvider>
 *
 * @returns {React.ReactElement} The provider component with socket context
 */
export const SocketProvider = ({ children }) => {
  // ✅ Get token from Redux store (instead of localStorage)
  const token = useSelector((state) => state.auth?.token);

  useEffect(() => {
    if (token) {
      // Depending on backend, either use auth or headers
      Socket.auth = { token }; // <-- if server checks socket.handshake.auth.token
      // Or:
      // Socket.io({ extraHeaders: { Authorization: `Bearer ${token}` } });

      Socket.connect();
      console.log("🔑 Attempting to connect socket with token:", token);
    }

    const handleConnect = () => {
      console.log("✅ Socket connected:", Socket.id);
    };

    const handleDisconnect = (reason) => {
      console.warn("❌ Socket disconnected:", reason);
    };

    const handleConnectError = (err) => {
      console.error("⚠️ Socket connection error:", err.message);
    };

    Socket.on("connect", handleConnect);
    Socket.on("disconnect", handleDisconnect);
    Socket.on("connect_error", handleConnectError);

    return () => {
      Socket.disconnect();
      Socket.off("connect", handleConnect);
      Socket.off("disconnect", handleDisconnect);
      Socket.off("connect_error", handleConnectError);
    };
  }, [token]); // ✅ re-run if token changes

  return (
    <SocketContext.Provider value={Socket}>{children}</SocketContext.Provider>
  );
};

/**
 * Custom hook to access the socket instance from React Context
 *
 * @hook
 * @returns {import('socket.io-client').Socket} The socket instance
 * @throws {Error} When used outside of SocketProvider
 *
 * @example
 * const socket = useSocket();
 * socket.emit("sendMessage", "Hello world");
 */
export const useSocket = () => {
  const socket = useContext(SocketContext);

  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  return socket;
};
