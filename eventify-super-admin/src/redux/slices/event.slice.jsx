/**
 * Event Slice (Super Admin)
 *
 * Manages event-related state and async actions in the Redux store.
 *
 * Super Admin Permissions:
 * - Fetch all events
 * - Delete specific event
 *
 * Integrates with a backend API using Axios, with authentication
 * handled via Bearer token stored in localStorage.
 *
 * State Shape:
 * {
 *   events: Array<Object>,     // List of events
 *   loading: boolean,          // Loading indicator for async actions
 *   error: string | null       // Error message from API calls
 * }
 *
 * @module eventSlice
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CONFIG from "../config/Config.config";

const { BACKEND_API_URL } = CONFIG;

const getToken = () => localStorage.getItem("authToken");

/**
 * Create new event.
 */
export const createEvent = createAsyncThunk(
  "events/createEvent",
  async (formData, { rejectWithValue }) => {
    try {
      const token = getToken();

      const response = await axios.post(
        `${BACKEND_API_URL}/event/create-event`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.event;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to upload product"
      );
    }
  }
);

/**
 * Fetch all events.
 */
export const getEvents = createAsyncThunk(
  "events/getEvents",
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/event/get-all-events`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.allEvents;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

/**
 * Update event.
 */
export const updateEvent = createAsyncThunk(
  "events/updateEvent",
  async ({ eventId, formData }, { rejectWithValue }) => {
    // FIXED: Properly destructure parameters
    try {
      const token = getToken();

      console.log("🔄 Updating event with ID:", eventId);
      console.log("📦 FormData contents:");

      // Log form data entries for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await axios.patch(
        `${BACKEND_API_URL}/event/update-event/${eventId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Update successful:", response.data);
      return response.data.event;
    } catch (error) {
      console.error("❌ Update failed:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update event"
      );
    }
  }
);

/**
 * Delete an event by ID.
 */
export const deleteEvent = createAsyncThunk(
  "events/deleteEvent",
  async (eventId, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.delete(
        `${BACKEND_API_URL}/event/delete-event/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return eventId; // Return the deleted event ID to remove it from state
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error deleting event.");
    }
  }
);

const eventSlice = createSlice({
  name: "events",
  initialState: {
    events: [],
    loading: false,
    error: null,
  },
  reducers: {
    setEvents: (state, action) => {
      state.events = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events.push(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get All Events
      .addCase(getEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(getEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Event - FIXED: Update existing event instead of pushing new one
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        // Update the existing event in the array
        const index = state.events.findIndex(
          (event) => event._id === action.payload._id
        );
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Event
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.filter((e) => e._id !== action.payload);
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setEvents, clearError } = eventSlice.actions;

export default eventSlice.reducer;
