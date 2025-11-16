/**
 * Organizer Slice (React Native)
 *
 * Handles:
 *  - Fetching all organizers (Super Admin)
 *
 * Uses:
 *  - AsyncStorage for auth token
 *  - Axios for API requests
 */

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config/Config';

const {BASE_URL} = CONFIG;

/**
 * Fetch token from AsyncStorage
 */
const getToken = async () => {
  const token = await AsyncStorage.getItem('authToken');
  console.log('[OrganizerThunk] Token:', token);
  return token;
};

/**
 * Fetch all organizers (Super Admin)
 */
export const getOrganizers = createAsyncThunk(
  'organizers/getOrganizers',
  async (_, {rejectWithValue}) => {
    try {
      const token = await getToken();
      if (!token) return rejectWithValue('Admin is not authenticated.');

      const apiUrl = `${BASE_URL}/super-admin/organizer/get-all-organizers`;
      console.log('[OrganizerThunk] GET:', apiUrl);

      const response = await axios.get(apiUrl, {
        headers: {Authorization: `Bearer ${token}`},
      });

      console.log('[OrganizerThunk] API Response:', response.data);

      return response.data.organizers;
    } catch (error) {
      console.log('[OrganizerThunk] API Error:', error.message);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch organizers.',
      );
    }
  },
);

const organizerSlice = createSlice({
  name: 'organizers',
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
    clearCurrentOrganizer: state => {
      state.currentOrganizer = null;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch Organizers
      .addCase(getOrganizers.pending, state => {
        console.log('[OrganizerThunk] Loading...');
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrganizers.fulfilled, (state, action) => {
        console.log('[OrganizerThunk] Organizers Loaded');
        state.loading = false;
        state.organizers = action.payload;
      })
      .addCase(getOrganizers.rejected, (state, action) => {
        console.log('[OrganizerThunk] Failed:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {setOrganizers, clearCurrentOrganizer, clearError} =
  organizerSlice.actions;

export default organizerSlice.reducer;
