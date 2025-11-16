import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import CONFIG from "./Config/Config";

const { SOCKET_URL } = CONFIG;

/**
 * Retrieves the authentication token from localStorage
 * @returns {string | null} The authentication token or null if not found
 */
const token = localStorage.getItem("authToken");

/**
 * Socket.io client instance for real-time communication
 *
 * @type {import('socket.io-client').Socket}
 */
const Socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: { token },
  transports: ["websocket"],
});

/**
 * React hook for accessing the shared socket instance.
 * Handles automatic connection and cleanup when used inside components.
 *
 * @returns {import('socket.io-client').Socket} Socket.io client instance
 *
 * @example
 * const socket = useSocket();
 * socket.emit("ping");
 */
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(Socket.connected);

  useEffect(() => {
    if (!Socket.connected) {
      Socket.connect();
    }

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    Socket.on("connect", onConnect);
    Socket.on("disconnect", onDisconnect);

    return () => {
      Socket.off("connect", onConnect);
      Socket.off("disconnect", onDisconnect);
    };
  }, []);

  return Socket;
};

export default Socket;
