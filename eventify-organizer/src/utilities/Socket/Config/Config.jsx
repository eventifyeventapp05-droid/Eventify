/**
 * Application configuration object containing all environment-specific settings
 * and API endpoints.
 *
 * @namespace CONFIG
 * @property {string} SOCKET_URL - The WebSocket server URL for real-time communication
 *
 * @example
 * // Import the configuration
 * import CONFIG from './config';
 *
 * // Use the socket URL
 * const socket = io(CONFIG.SOCKET_URL);
 */
const CONFIG = {
  /**
   * The base URL for the WebSocket server connection
   * @type {string}
   */
  // SOCKET_URL: "http://localhost:8000/",
  SOCKET_URL: "https://eventify-backend-tan.vercel.app",
};

export default CONFIG;
