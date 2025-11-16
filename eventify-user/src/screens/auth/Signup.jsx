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
  validateEmail,
  validatePassword,
  validateName,
} from '../../utils/customValidations/Validations';
import Toast from 'react-native-toast-message';
import {registerUser} from '../../redux/slices/authSlice';

const {width, height} = Dimensions.get('screen');

const Signup = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    StatusBar.setBackgroundColor(theme.colors.white);
    StatusBar.setBarStyle('dark-content');
  }, []);

  useEffect(() => {
    const hasErrors =
      nameError || emailError || passwordError || !name || !email || !password;
    setIsButtonEnabled(!hasErrors);
  }, [nameError, emailError, passwordError, name, email, password]);

  const handleNameChange = value => {
    setName(value);
    setNameError(validateName(value, 'Name'));
  };

  const handleEmailChange = value => {
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handlePasswordChange = value => {
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error!',
        text2: 'Please fill all fields.',
      });
      return;
    }

    setLoading(true);

    try {
      // 👉 Build actual FormData
      const formData = new FormData();
      formData.append('userName', name);
      formData.append('email', email);
      formData.append('password', password);

      const resultAction = await dispatch(registerUser(formData));

      // SUCCESS (fulfilled)
      if (registerUser.fulfilled.match(resultAction)) {
        const {success, message} = resultAction.payload;

        if (success) {
          Toast.show({
            type: 'success',
            text1: 'Signup Successful!',
            text2: message || 'Account created successfully!',
          });

          setName('');
          setEmail('');
          setPassword('');

          setTimeout(() => {
            navigation.replace('Signin');
          }, 2000);

          return;
        } else {
          // backend responded with success:false
          Toast.show({
            type: 'error',
            text1: 'Signup Failed!',
            text2: message || 'Please try again.',
          });
        }
      }

      // ERROR (rejectWithValue)
      if (registerUser.rejected.match(resultAction)) {
        const errMessage =
          resultAction.payload?.message ||
          resultAction.error?.message ||
          'Signup failed. Please try again.';

        Toast.show({
          type: 'error',
          text1: 'Signup Failed!',
          text2: errMessage,
        });
      }
    } catch (err) {
      console.error('Signup error:', err);
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
        <Text style={styles.signupTitle}>SIGNUP</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <Animatable.View
          animation="fadeInUp"
          duration={1000}
          delay={300}
          style={styles.formContainer}>
          {/* Name Input */}
          <Animatable.View
            animation="fadeInRight"
            duration={800}
            delay={400}
            style={styles.inputFieldContainer}>
            <InputField
              placeholder="Enter Name"
              value={name}
              onChangeText={handleNameChange}
              leftIcon={
                <Feather
                  name="user"
                  size={width * 0.044}
                  color={theme.colors.primary}
                />
              }
            />
            {nameError && (
              <Text style={globalStyles.textError}>{nameError}</Text>
            )}
          </Animatable.View>

          {/* Email Input */}
          <Animatable.View
            animation="fadeInRight"
            duration={800}
            delay={500}
            style={styles.inputFieldContainer}>
            <InputField
              placeholder="Enter Email"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={
                <Feather
                  name="mail"
                  size={width * 0.044}
                  color={theme.colors.primary}
                />
              }
            />
            {emailError && (
              <Text style={globalStyles.textError}>{emailError}</Text>
            )}
          </Animatable.View>

          {/* Password Input */}
          <Animatable.View
            animation="fadeInRight"
            duration={800}
            delay={600}
            style={styles.inputFieldContainer}>
            <InputField
              placeholder="Enter Password"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={hidePassword}
              autoCapitalize="none"
              leftIcon={
                <Feather
                  name="lock"
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

          {/* Button */}
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={700}
            style={styles.btnContainer}>
            <Button
              title="Signup"
              onPress={handleSignup}
              width={width * 0.95}
              loading={loading}
              disabled={!isButtonEnabled}
              backgroundColor={theme.colors.primary}
              textColor={theme.colors.white}
              buttonStyle={styles.customButtonStyle}
              textStyle={styles.customButtonText}
            />
          </Animatable.View>

          {/* Login */}
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={900}
            style={styles.haveAccountContainer}>
            <Text style={styles.haveAccountText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signin')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </Animatable.View>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  primaryContainer: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },

  headerContainer: {
    height: height * 0.15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? height * 0.03 : height * 0.01,
  },

  signupTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontFamily: theme.typography.roboto.bold,
    color: theme.colors.primary,
    marginTop: height * 0.02,
  },

  scrollContainer: {
    flexGrow: 1,
  },

  formContainer: {
    flex: 1,
    paddingTop: height * 0.02,
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.02,
  },

  inputFieldContainer: {
    marginBottom: height * 0.02,
  },

  btnContainer: {
    marginTop: height * 0.04,
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

  haveAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: height * 0.02,
    gap: 5,
  },

  haveAccountText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
    color: theme.colors.dark,
  },

  loginLink: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
    color: theme.colors.primary,
  },
});
