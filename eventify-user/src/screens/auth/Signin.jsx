import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Dimensions,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {theme} from '../../styles/theme';
import * as Animatable from 'react-native-animatable';
import {globalStyles} from '../../styles/globalStyles';

import InputField from '../../utils/customComponents/customInputField/InputField';
import Feather from 'react-native-vector-icons/Feather';
import Button from '../../utils/customComponents/customButton/Button';
import {useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {
  isValidInput,
  validateEmail,
  validatePassword,
} from '../../utils/customValidations/Validations';
import Toast from 'react-native-toast-message';
import {loginUser} from '../../redux/slices/authSlice';

const {width, height} = Dimensions.get('screen');

const Signin = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const statusBarColor = theme.colors.white;
    StatusBar.setBackgroundColor(statusBarColor);

    StatusBar.setBarStyle('dark-content');
  }, []);

  useEffect(() => {
    const hasErrors = emailError || passwordError || !email || !password;
    setIsButtonEnabled(!hasErrors);
  }, [emailError, passwordError, email, password]);

  const handleEmailChange = value => {
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handlePasswordChange = value => {
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleLogin = async () => {
    if (!isValidInput(email, password)) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error!',
        text2: 'Please enter valid email and password.',
      });
      return;
    }

    setLoading(true);

    try {
      const resultAction = await dispatch(loginUser({email, password}));

      if (loginUser.fulfilled.match(resultAction)) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Login Successfully!',
        });

        setEmail('');
        setPassword('');

        setTimeout(() => {
          navigation.replace('Main');
        }, 3000);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed!',
          text2: 'Invalid Credentials',
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      Toast.show({
        type: 'error',
        text1: 'Unexpected Error!',
        text2: 'Please try again later',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[globalStyles.container, styles.primaryContainer]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.headerContainer}>
        <Text style={styles.loginTitle}>LOGIN</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <Animatable.View
          animation="fadeInUp"
          duration={1000}
          delay={300}
          style={styles.formContainer}>
          <Animatable.View
            animation="fadeInRight"
            duration={800}
            delay={500}
            style={styles.inputFieldContainer}>
            <InputField
              placeholder="Enter username or email"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              leftIcon={
                <Feather
                  name={'mail'}
                  size={width * 0.044}
                  color={theme.colors.primary}
                />
              }
            />
            {emailError && (
              <Text style={globalStyles.textError}>{emailError}</Text>
            )}
          </Animatable.View>

          {/* Password Input Field */}
          <Animatable.View
            animation="fadeInRight"
            duration={800}
            delay={700}
            style={styles.inputFieldContainer}>
            <InputField
              placeholder="Enter Password"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={hidePassword}
              leftIcon={
                <Feather
                  name={'lock'}
                  size={width * 0.044}
                  color={theme.colors.primary}
                />
              }
              rightIcon={
                <Feather
                  name={hidePassword ? 'eye-off' : 'eye'}
                  size={width * 0.054}
                  color={theme.colors.primary}
                />
              }
              onRightIconPress={() => setHidePassword(!hidePassword)}
            />
            {passwordError && (
              <Text style={globalStyles.textError}>{passwordError}</Text>
            )}
          </Animatable.View>

          {/* Forgot Password Link */}
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={800}
            style={styles.forgotPasswordContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              activeOpacity={0.8}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </Animatable.View>

          {/* Login Button */}
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={900}
            style={styles.btnContainer}>
            <Button
              title="Login"
              onPress={handleLogin}
              width={width * 0.95}
              loading={loading}
              disabled={!isButtonEnabled}
              backgroundColor={theme.colors.primary}
              textColor={theme.colors.white}
              buttonStyle={styles.customButtonStyle}
              textStyle={styles.customButtonText}
            />
          </Animatable.View>

          {/* Signup Link */}
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={1100}
            style={styles.noAccountContainer}>
            <Text style={styles.noAccountText}>Don't have an account?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Signup')}
              activeOpacity={0.9}>
              <Text style={styles.signupLink}>Signup</Text>
            </TouchableOpacity>
          </Animatable.View>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Signin;

const styles = StyleSheet.create({
  primaryContainer: {
    flex: 1,

    backgroundColor: theme.colors.white,
  },

  headerContainer: {
    height: height * 0.15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingTop: Platform.OS === 'android' ? height * 0.03 : height * 0.01,
  },

  loginTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontFamily: theme.typography.roboto.bold,
    color: theme.colors.primary,
    marginTop: height * 0.02,
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },

  formContainer: {
    flex: 1,
    backgroundColor: theme.colors.white,

    paddingTop: height * 0.04,
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.02,
  },

  inputFieldContainer: {
    marginBottom: height * 0.02,
  },

  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: height * 0.02,
  },

  forgotPasswordText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
    color: theme.colors.dark,
  },

  btnContainer: {
    marginTop: height * 0.03,
    marginBottom: height * 0.03,
    alignItems: 'center',
  },

  customButtonStyle: {
    borderRadius: theme.borderRadius.small,
    height: height * 0.07,
  },

  customButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.roboto.semiBold,
  },

  noAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: height * 0.02,
  },

  noAccountText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
    color: theme.colors.dark,
  },

  signupLink: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
    color: theme.colors.primary,
    marginLeft: width * 0.01,
    textDecorationLine: 'none',
  },
});
