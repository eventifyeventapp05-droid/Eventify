/**
 * Application Configuration
 *
 * This module centralizes environment-specific configuration values
 * such as API endpoints. Keeping these values in one place ensures
 * easier maintenance and improves flexibility when switching between
 * development, staging, and production environments.
 */

const CONFIG = {
  /** Base URL for backend API requests */
  // BACKEND_API_URL: "http://localhost:8000/api",
  BACKEND_API_URL: "https://eventify-backend-tan.vercel.app/api",
};

export default CONFIG;
