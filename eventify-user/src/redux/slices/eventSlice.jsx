import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config/Config';

const {BASE_URL} = CONFIG;

// Create Event
export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (formData, {rejectWithValue}) => {
    try {
      console.log('📤 [createEvent] Sending event creation request...');

      const token = await AsyncStorage.getItem('authToken');
      console.log('🔑 Token:', token);

      const url = `${BASE_URL}/event/create-event`;
      console.log('🌍 API:', url);

      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ Event Created:', response.data);

      return response.data.event;
    } catch (error) {
      const err = error.response?.data || {
        message: 'Network Error - Could not reach server',
      };
      console.error('❌ Creation error:', err);
      return rejectWithValue(err);
    }
  },
);

// Get All Events
export const getAllEvents = createAsyncThunk(
  'events/getAllEvents',
  async (_, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      const response = await axios.get(`${BASE_URL}/event/get-all-events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.allEvents;
    } catch (error) {
      console.error(
        '❌ Get Events Error:',
        error.response?.data || error.message,
      );
      return rejectWithValue(
        error.response?.data || {message: 'Error fetching events'},
      );
    }
  },
);

const eventSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder

      // Create Event
      .addCase(createEvent.pending, state => {
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
      .addCase(getAllEvents.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(getAllEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default eventSlice.reducer;
