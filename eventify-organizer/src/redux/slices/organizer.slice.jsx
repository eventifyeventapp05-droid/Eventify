import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import CONFIG from "../config/Config.config";

const { BACKEND_API_URL } = CONFIG;

// Helper to get token from localStorage
const getToken = () => localStorage.getItem("authToken");

// Async thunk to fetch a single organizer by ID
export const getOrganizer = createAsyncThunk(
  "organizer/getOrganizer",
  async (organizerId, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Organizer is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/organizer/get-organizer-by-id/${organizerId}`, // Updated URL
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.organizer; // Return the organizer object
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

const organizerSlice = createSlice({
  name: "organizer",
  initialState: {
    organizer: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getOrganizer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrganizer.fulfilled, (state, action) => {
        state.loading = false;
        state.organizer = action.payload;
      })
      .addCase(getOrganizer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default organizerSlice.reducer;
