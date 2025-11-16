import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import CONFIG from '../config/Config';

const {BASE_URL} = CONFIG;

const getToken = async rejectWithValue => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) throw new Error('User is not authenticated.');
    return token;
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to fetch token.');
  }
};

export const getUser = createAsyncThunk(
  'user/getUser',
  async (userId, {rejectWithValue}) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.get(
        `${BASE_URL}/user/get-user-by-id/${userId}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({userId, formData}, {rejectWithValue}) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.patch(
        `${BASE_URL}/user/update-user/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      return response.data.user;
    } catch (error) {
      console.error('❌ Update failed:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const changePassword = createAsyncThunk(
  'user/changePassword',
  async ({formData}, {rejectWithValue}) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.patch(
        `${BASE_URL}/user/reset-user-password`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.user;
    } catch (error) {
      console.error('❌ Update failed:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const deleteAccount = createAsyncThunk(
  'user/deleteAccount',
  async (userId, {rejectWithValue, dispatch}) => {
    try {
      console.log('[deleteAccount] Starting deletion for user:', userId);
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        console.error('[deleteAccount] No auth token found');
        throw new Error('Authentication required');
      }

      console.log(
        '[deleteAccount] Making request to:',
        `${BASE_URL}/user/delete-user/${userId}`,
      );
      const response = await axios.delete(
        `${BASE_URL}/user/delete-user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('[deleteAccount] Response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Deletion failed');
      }

      console.log('[deleteAccount] Clearing local data');
      await AsyncStorage.multiRemove(['authToken', 'userData']);
      dispatch(clearUser());

      return response.data;
    } catch (error) {
      console.error('[deleteAccount] Error:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack,
      });
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearUser: state => {
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteAccount.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, state => {
        state.loading = false;
        state.user = null; // Clear user from state
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {clearUser} = userSlice.actions;
export default userSlice.reducer;
