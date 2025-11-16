/**
 * Authentication Slice
 *
 * Manages authentication state for the Organizer, including
 * registration, login, and logout flows.
 *
 * Features:
 * - Login: Authenticates an existing Organizer
 * - Forgot Password: Send Email Notification For Password Reset
 * - Reset Password: To Reset Organizer Password
 * - Logout: Ends the current session
 *
 * State Shape:
 * {
 *   user: { id, email, userName } | null,
 *   token: string | null,
 *   loading: boolean,
 *   error: any
 * }
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CONFIG from "../config/Config.config";

const { BACKEND_API_URL } = CONFIG;

/**
 * Signup Organizer.
 *
 * @param {Object} formData - signup credentials.
 */
export const register = createAsyncThunk(
  "organizer/signup-organizer",
  async (formData, { rejectWithValue }) => {
    try {
      console.log("Register Request Data:", formData);

      const response = await axios.post(
        `${BACKEND_API_URL}/organizer/signup-organizer`,
        formData
      );

      console.log("Register Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Register Error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data);
    }
  }
);

/**
 * Login an existing Organizer.
 *
 * @param {Object} loginData - Login credentials.
 * @returns {Promise<{ user: Object, token: string }>} User info and JWT token.
 */
export const login = createAsyncThunk(
  "organizer/login",
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BACKEND_API_URL}/organizer/signin-organizer`,
        loginData
      );

      console.log("Login response:", response.data);

      const { token, organizer, message, success } = response.data;

      if (!success || !organizer || !token) {
        throw new Error("Invalid login response format");
      }

      const user = {
        id: organizer.id,
        email: organizer.email,
        userName: organizer.userName,
      };

      localStorage.setItem("authToken", token);

      return { user, token, message };
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);

      const backendError = error.response?.data;

      if (backendError) {
        return rejectWithValue({
          message: backendError.message || "Login failed",
          success: backendError.success || false,
          attempts: backendError.attempts,
          status: error.response?.status,
        });
      }

      return rejectWithValue({
        message: error.message || "Network error occurred",
        success: false,
        status: 0,
      });
    }
  }
);

/**
 * Send forgot password email to Organizer.
 *
 * @param {Object} emailData - Email address for password reset.
 * @returns {Promise<{ message: string }>} Success message.
 */
export const forgotPassword = createAsyncThunk(
  "organizer/forgot-password",
  async ({ email, role }, { rejectWithValue }) => {
    try {
      const payload = { email, role }; // <-- send string email
      const response = await axios.post(
        `${BACKEND_API_URL}/organizer/forgot-password`,
        payload
      );

      const { message, success } = response.data;

      if (!success) {
        throw new Error(message || "Forgot password failed");
      }

      return { message };
    } catch (error) {
      const backendError = error.response?.data;
      return rejectWithValue({
        message:
          backendError?.message || error.message || "Password reset failed",
        success: backendError?.success || false,
        status: error.response?.status || 0,
      });
    }
  }
);

/**
 * Reset password for Organizer using reset token.
 *
 * @param {Object} resetData - New password and reset token.
 * @returns {Promise<{ message: string }>} Success message.
 */
export const resetPassword = createAsyncThunk(
  "organizer/reset-password",
  async ({ newPassword, token }, { rejectWithValue }) => {
    try {
      const payload = { newPassword, role: "ORGANIZER" };
      const response = await axios.post(
        `${BACKEND_API_URL}/organizer/reset-password/${token}`,
        payload
      );

      const { message, success } = response.data;

      if (!success) {
        throw new Error(message || "Reset password failed");
      }

      return { message };
    } catch (error) {
      const backendError = error.response?.data;
      return rejectWithValue({
        message:
          backendError?.message || error.message || "Password reset failed",
        success: backendError?.success || false,
        status: error.response?.status || 0,
      });
    }
  }
);

/**
 * Logout the current Organizer.
 *
 * @returns {Promise<any>} API response data.
 */
export const logout = createAsyncThunk(
  "organizer/logout",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        `${BACKEND_API_URL}/organizer/logout-organizer`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const message = response.data?.message;
      return { message, ...response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Unknown error occurred";

      return rejectWithValue({
        message: errorMessage,
        ...error.response?.data,
      });
    }
  }
);

/**
 * Auth slice managing user and token state with async thunks.
 */
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      //register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem("authToken");
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;
