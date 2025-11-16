import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CONFIG from "../config/Config.config";

const { BACKEND_API_URL } = CONFIG;

const getToken = () => localStorage.getItem("authToken");

/**
 * Fetch all bookings for Super Admin.
 */
export const getAllBookings = createAsyncThunk(
  "bookings/getAllBookings",
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/super-admin/ticket/get-all-bookings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.bookings;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "An error occurred."
      );
    }
  }
);

/**
 * Update Booking Status
 */
export const updateBookingStatus = createAsyncThunk(
  "bookings/updateBookingStatus",
  async ({ bookingId, type, status }, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    const body =
      type === "booking"
        ? { bookingStatus: status }
        : { paymentStatus: status };

    try {
      const response = await axios.patch(
        `${BACKEND_API_URL}/super-admin/ticket/update-booking-status/${bookingId}`,
        body,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.booking;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update booking status."
      );
    }
  }
);

const bookingSlice = createSlice({
  name: "bookings",
  initialState: {
    bookings: [],
    loading: false,
    error: null,
  },
  reducers: {
    setBookings: (state, action) => {
      state.bookings = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(getAllBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateBookingStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const updatedBooking = action.payload;
        state.bookings = state.bookings.map((b) =>
          b._id === updatedBooking._id ? updatedBooking : b
        );
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setBookings, clearError } = bookingSlice.actions;
export default bookingSlice.reducer;
