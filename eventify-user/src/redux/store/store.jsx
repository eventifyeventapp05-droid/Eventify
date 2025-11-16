import {configureStore} from '@reduxjs/toolkit';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {combineReducers} from 'redux';
import authReducer from '../slices/authSlice';
import userReducer from '../slices/userSlice';
import eventReducer from '../slices/eventSlice';
import bookingReducer from '../slices/ticketBookingSlice';
import organizerReducer from '../slices/organizerSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  events: eventReducer,
  bookings: bookingReducer,
  organizers: organizerReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable state warnings
    }),
});

const persistor = persistStore(store);

export {store, persistor};
