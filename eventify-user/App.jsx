import React from 'react';
import {StyleSheet, Dimensions} from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import Toast, {ErrorToast, SuccessToast} from 'react-native-toast-message';
import {theme} from './src/styles/theme';
import Feather from 'react-native-vector-icons/Feather';

const {width} = Dimensions.get('screen');

const App = () => {
  const toastConfig = {
    success: props => (
      <SuccessToast
        {...props}
        style={{
          borderLeftColor: theme.colors.success,
          backgroundColor: theme.colors.white,
          borderRadius: theme.borderRadius.medium,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowOffset: {width: 0, height: 4},
          shadowRadius: 6,
          paddingHorizontal: width * 0.012,
          flexDirection: 'row',
          alignItems: 'center',
        }}
        contentContainerStyle={{
          paddingHorizontal: width * 0.012,
          flex: 1,
        }}
        text1Style={{
          fontSize: width * 0.04,
          fontFamily: theme.typography.roboto.semiBold,
          color: theme.colors.success,
        }}
        text2Style={{
          fontSize: width * 0.037,
          fontFamily: theme.typography.roboto.regular,
          color: theme.colors.secondary,
        }}
        renderLeadingIcon={() => (
          <Feather
            name="check-circle"
            size={24}
            color={theme.colors.success}
            style={{marginRight: 10}}
          />
        )}
      />
    ),

    error: props => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: theme.colors.error,
          backgroundColor: theme.colors.white,
          borderRadius: theme.borderRadius.medium,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowOffset: {width: 0, height: 4},
          shadowRadius: 6,
          paddingHorizontal: width * 0.012,
          flexDirection: 'row',
          alignItems: 'center',
        }}
        contentContainerStyle={{
          paddingHorizontal: width * 0.012,
          flex: 1,
        }}
        text1Style={{
          fontSize: width * 0.04,
          fontFamily: theme.typography.roboto.semiBold,
          color: theme.colors.error,
        }}
        text2Style={{
          fontSize: width * 0.037,
          fontFamily: theme.typography.roboto.regular,
          color: theme.colors.secondary,
        }}
        renderLeadingIcon={() => (
          <Feather
            name="alert-circle"
            size={24}
            color={theme.colors.error}
            style={{marginRight: 10}}
          />
        )}
      />
    ),
  };

  return (
    <>
      <RootNavigator />
      <Toast config={toastConfig} />
    </>
  );
};

export default App;

const styles = StyleSheet.create({});
