import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import CONFIG from '../config/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {BASE_URL} = CONFIG;

// Get token from AsyncStorage
const getToken = async () => {
  const token = await AsyncStorage.getItem('authToken');
  console.log('[Thunk] Token:', token);
  return token;
};

/**
 * Book a ticket
 * payload: { eventId: string, ticketType: string, quantity: number }
 */
export const bookTicket = createAsyncThunk(
  'bookings/bookTicket',
  async ({eventId, ticketType, quantity}, {rejectWithValue}) => {
    console.log('[Thunk] Attempting to book:', {eventId, ticketType, quantity});

    const token = await getToken();
    if (!token) {
      console.log('[Thunk] No token found.');
      return rejectWithValue('User is not authenticated.');
    }

    const apiUrl = `${BASE_URL}/ticket/book-ticket`;
    console.log('[Thunk] API URL:', apiUrl);

    try {
      console.log('[Thunk] Booking Payload:', {eventId, ticketType, quantity});
      const response = await axios.post(
        apiUrl,
        {eventId, ticketType, quantity},
        {headers: {Authorization: `Bearer ${token}`}},
      );

      console.log('[Thunk] API Response:', response.data);

      // Assuming API returns the booking object
      return response.data.data;
    } catch (error) {
      console.log('[Thunk] API Error:', error.message);
      if (error.response) {
        console.log('[Thunk] Response Data:', error.response.data);
        console.log('[Thunk] Response Status:', error.response.status);
        console.log('[Thunk] Response Headers:', error.response.headers);
      }
      return rejectWithValue(
        error.response?.data?.message || 'Failed to book ticket.',
      );
    }
  },
);

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    bookings: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearBookings: state => {
      state.bookings = [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(bookTicket.pending, state => {
        console.log('[Thunk] Booking pending...');
        state.loading = true;
        state.error = null;
      })
      .addCase(bookTicket.fulfilled, (state, action) => {
        console.log('[Thunk] Booking fulfilled:', action.payload);
        state.loading = false;
        state.bookings.push(action.payload);
      })
      .addCase(bookTicket.rejected, (state, action) => {
        console.log('[Thunk] Booking rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {clearError, clearBookings} = bookingSlice.actions;
export default bookingSlice.reducer;
