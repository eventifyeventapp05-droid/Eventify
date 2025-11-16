import React, {useEffect, useRef} from 'react';
import {AppState} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './AppNavigator';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {store, persistor} from '../redux/store/store';
import {initializeSocket, getSocket} from '../utils/customSocket/Socket';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RootNavigator = () => {
  const appState = useRef(AppState.currentState);
  const tokenRef = useRef(null);

  // Initial socket connection
  useEffect(() => {
    const connectSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        tokenRef.current = token;

        if (token) {
          initializeSocket(token);
          console.log('✅ Socket initialized with token');
        } else {
          console.warn('⚠️ No auth token found');
        }
      } catch (error) {
        console.error('❌ Error initializing socket:', error);
      }
    };

    const timeout = setTimeout(connectSocket, 300); // slight delay for stability

    return () => clearTimeout(timeout);
  }, []);

  // Handle app resume: reconnect socket if disconnected
  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('🔄 App resumed, checking socket...');
        const socket = getSocket();

        if (!socket || !socket.connected) {
          const token = tokenRef.current;
          if (token) {
            console.log('🔌 Reconnecting socket...');
            initializeSocket(token);
          }
        }
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

export default RootNavigator;
