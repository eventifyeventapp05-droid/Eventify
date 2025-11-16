/**
 * User Slice (Super Admin)
 *
 * Manages user-related state and async actions in the Redux store.
 *
 * Super Admin Permissions:
 * - Fetch all users
 *
 * Integrates with a backend API using Axios, with authentication
 * handled via Bearer token stored in localStorage.
 *
 * State Shape:
 * {
 *   users: Array<Object>,  // List of users
 *   loading: boolean,        // Loading indicator for async actions
 *   error: string | null     // Error message from API calls
 * }
 *
 * @module userSlice
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CONFIG from "../config/Config.config";

const { BACKEND_API_URL } = CONFIG;

const getToken = () => localStorage.getItem("authToken");

/**
 * Fetch all users.
 */
export const getUsers = createAsyncThunk(
  "users/getUsers",
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/super-admin/user/get-all-users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.users;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {
    setusers: (state, action) => {
      state.users = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUsers } = userSlice.actions;

export default userSlice.reducer;
