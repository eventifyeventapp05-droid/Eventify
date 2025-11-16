/**
 * Organizer Slice (Super Admin)
 *
 * Manages organizer-related state and async actions in the Redux store.
 *
 * Super Admin Permissions:
 * - Fetch all organizers
 *
 * Integrates with a backend API using Axios, with authentication
 * handled via Bearer token stored in localStorage.
 *
 * State Shape:
 * {
 *   organizers: Array<Object>,  // List of organizers
 *   loading: boolean,           // Loading indicator for async actions
 *   error: string | null        // Error message from API calls
 * }
 *
 * @module organizerSlice
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CONFIG from "../config/Config.config";

const { BACKEND_API_URL } = CONFIG;

const getToken = () => localStorage.getItem("authToken");

/**
 * Fetch all organizers.
 */
export const getOrganizers = createAsyncThunk(
  "organizers/getOrganizers",
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/super-admin/organizer/get-all-organizers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.organizers;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

const organizerSlice = createSlice({
  name: "organizers",
  initialState: {
    organizers: [],
    currentOrganizer: null,
    loading: false,
    error: null,
  },
  reducers: {
    setOrganizers: (state, action) => {
      state.organizers = action.payload;
    },
    clearCurrentOrganizer: (state) => {
      state.currentOrganizer = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Organizers
      .addCase(getOrganizers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrganizers.fulfilled, (state, action) => {
        state.loading = false;
        state.organizers = action.payload;
      })
      .addCase(getOrganizers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setOrganizers, clearCurrentOrganizer, clearError } =
  organizerSlice.actions;

export default organizerSlice.reducer;
