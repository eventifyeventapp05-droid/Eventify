import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StatusBar,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  Animated,
  TouchableOpacity,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch} from 'react-redux';

import {theme} from '../../../styles/theme';

import Header from '../../../utils/customComponents/customHeader/Header';
import InputField from '../../../utils/customComponents/customInputField/InputField';
import Button from '../../../utils/customComponents/customButton/Button';
import ImageUploadModal from '../../../utils/customModals/ImageUploadModal';
import Feather from 'react-native-vector-icons/Feather';

import {validateName} from '../../../utils/customValidations/Validations';
import {updateUser} from '../../../redux/slices/userSlice';
import {globalStyles} from '../../../styles/globalStyles';

const {width, height} = Dimensions.get('screen');

const Account = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {params} = useRoute();
  const user = params?.user;

  const [photoURL, setPhotoURL] = useState('');
  const [name, setName] = useState(user?.userName || '');
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [newImageURL, setNewImageURL] = useState('');
  const [isEdited, setIsEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(50)).current;

  const [nameError, setNameError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    StatusBar.setBackgroundColor(theme.colors.primary);
    animateForm();
  }, []);

  const animateForm = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(formTranslateY, {
        toValue: 0,
        duration: 800,
        delay: 300,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    const hasErrors =
      !!nameError ||
      !!addressError ||
      !!phoneError ||
      !name ||
      !address ||
      !phone;

    setIsEdited(
      !hasErrors &&
        (name !== user?.userName ||
          address !== user?.address ||
          phone !== user?.phone ||
          newImageURL),
    );
  }, [name, address, phone, nameError, addressError, phoneError, newImageURL]);

  const handleNameChange = value => {
    setName(value);
    setNameError(validateName(value));
  };

  const handleAddressChange = value => {
    setAddress(value);
    setAddressError(value.trim() ? '' : 'Address is required');
  };

  const handlePhoneChange = value => {
    setPhone(value);

    if (!value.trim()) {
      setPhoneError('Phone number is required');
    } else if (!/^\d{11}$/.test(value)) {
      setPhoneError('Phone number must be 10 digits');
    } else {
      setPhoneError('');
    }
  };

  const handleImageUpload = url => {
    setNewImageURL(url);
    setPhotoURL(url);
    setShowImageUploadModal(false);
  };

  const handleUpdate = async () => {
    setLoading(true);
    const formData = new FormData();
    if (name) formData.append('userName', name);
    if (address) formData.append('address', address);
    if (phone) formData.append('phone', phone);

    if (newImageURL) {
      formData.append('profilePicture', {
        uri: newImageURL,
        name: 'profile.jpg',
        type: 'image/jpeg',
      });
    }

    try {
      const result = await dispatch(updateUser({userId: user._id, formData}));
      if (updateUser.fulfilled.match(result)) {
        Toast.show({
          type: 'success',
          text1: 'Profile Updated',
          text2: 'Profile has been updated successfully!',
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: 'Failed to update profile!',
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.tertiary]}
        style={styles.gradientContainer}>
        <SafeAreaView style={globalStyles.container}>
          <Header title="My Account" onPressLeft={() => navigation.goBack()} />

          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {(photoURL || user?.profilePicture) && (
              <View style={styles.imgContainer}>
                <Image
                  source={{uri: photoURL || user?.profilePicture}}
                  style={styles.img}
                />
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setShowImageUploadModal(true)}>
                  <View style={styles.cameraIconContainer}>
                    <Feather
                      name="camera"
                      size={width * 0.06}
                      color={theme.colors.white}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            )}

            <Animated.View
              style={[
                styles.formContainer,
                {opacity: fadeAnim, transform: [{translateY: formTranslateY}]},
              ]}>
              <View style={styles.InputFieldContainer}>
                <Text style={styles.label}>Name</Text>
                <InputField
                  placeholder="Name"
                  value={name}
                  onChangeText={handleNameChange}
                  leftIcon={
                    <Feather
                      name={'user'}
                      size={width * 0.044}
                      color={theme.colors.primary}
                    />
                  }
                />
                {nameError && (
                  <Text style={globalStyles.textError}>{nameError}</Text>
                )}
              </View>

              <View style={styles.InputFieldContainer}>
                <Text style={styles.label}>Address</Text>
                <InputField
                  placeholder="House, Street, Area, City, LandMark!"
                  value={address}
                  onChangeText={handleAddressChange}
                  leftIcon={
                    <Feather
                      name="map-pin"
                      size={width * 0.044}
                      color={theme.colors.primary}
                    />
                  }
                />
                {addressError && (
                  <Text style={globalStyles.textError}>{addressError}</Text>
                )}
              </View>

              <View style={styles.InputFieldContainer}>
                <Text style={styles.label}>Phone</Text>
                <InputField
                  placeholder="Enter phone number"
                  value={phone}
                  keyboardType="number-pad"
                  onChangeText={handlePhoneChange}
                  leftIcon={
                    <Feather
                      name="phone"
                      size={width * 0.044}
                      color={theme.colors.primary}
                    />
                  }
                />
                {phoneError && (
                  <Text style={globalStyles.textError}>{phoneError}</Text>
                )}
              </View>

              <View style={styles.btnContainer}>
                <Button
                  title="Update Profile"
                  onPress={handleUpdate}
                  loading={loading}
                  disabled={!isEdited}
                  width={width * 0.95}
                  backgroundColor={theme.colors.primary}
                  textColor={theme.colors.white}
                />
              </View>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      <ImageUploadModal
        visible={showImageUploadModal}
        onClose={() => setShowImageUploadModal(false)}
        onImageUpload={handleImageUpload}
        title="Upload Image"
        description="Choose a profile picture from camera or gallery."
      />
    </>
  );
};

export default Account;

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },

  scrollContainer: {
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.024,
  },

  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.roboto.semiBold,
    color: theme.colors.tertiary,
  },

  headerDescription: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
    color: theme.colors.gray,
  },

  imgContainer: {
    position: 'relative',
    width: width * 0.34,
    height: width * 0.34,
    marginTop: height * 0.02,
  },

  img: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.2,
    borderWidth: 4,
    borderColor: theme.colors.white,
    resizeMode: 'cover',
  },

  cameraIconContainer: {
    position: 'absolute',
    bottom: height * 0,
    right: width * 0,
    backgroundColor: theme.colors.primary,
    borderRadius: width * 0.05,
    padding: width * 0.015,
    justifyContent: 'center',
    alignItems: 'center',
  },

  formContainer: {
    marginTop: height * 0.04,
    gap: theme.gap(2),
  },

  label: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.semiBold,
    color: theme.colors.white,
  },

  btnContainer: {
    marginTop: height * 0.04,
  },
});
