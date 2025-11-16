import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import LottieView from 'lottie-react-native';
import logoutAnimation from '../../assets/animations/logout.json';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {theme} from '../../styles/theme';
import {logoutUser} from '../../redux/slices/authSlice';
import {useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const {width, height} = Dimensions.get('screen');

const LogoutModal = ({visible, title, description, onClose}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      const resultAction = await dispatch(logoutUser()).unwrap();

      if (resultAction.success) {
        await AsyncStorage.removeItem('authToken');

        Toast.show({
          type: 'success',
          text1: 'Logout Successful',
          text2: 'You have been logout successfully',
        });

        setTimeout(() => {
          navigation.replace('Signin');
        }, 2000);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Logout Failed',
          text2: resultAction.message || 'Unknown error.',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Logout Error',
        text2: error?.message || 'Something went wrong.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <LottieView
            source={logoutAnimation}
            autoPlay
            loop
            style={styles.animation}
          />
          <Text style={styles.modalText}>{title}</Text>
          <Text style={styles.descriptionText}>{description}</Text>

          <View style={styles.btnContainer}>
            <TouchableOpacity onPress={onClose}>
              <View style={styles.cancelContainer}>
                <View style={styles.icon}>
                  <Ionicons
                    name="close-circle"
                    size={25}
                    color={theme.colors.white}
                  />
                </View>
                <Text style={styles.cancelText}>Cancel</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout}>
              <View style={styles.proceedContainer}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                  }}>
                  {loading ? (
                    <ActivityIndicator size={25} color={theme.colors.white} />
                  ) : (
                    <>
                      <View style={styles.icon}>
                        <Ionicons
                          name="checkmark-circle"
                          size={25}
                          color={theme.colors.white}
                        />
                      </View>
                      <Text style={styles.proceedText}>Proceed</Text>
                    </>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutModal;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },

  modalView: {
    margin: 20,
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: theme.colors.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: width * 0.92,
    height: height * 0.44,
  },

  animation: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: 15,
  },

  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: width * 0.05,
    color: theme.colors.dark,
    fontFamily: theme.typography.roboto.regular,
  },

  descriptionText: {
    textAlign: 'center',
    color: theme.colors.dark,
    fontFamily: theme.typography.roboto.regular,
    fontSize: width * 0.04,
    marginBottom: 20,
  },

  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 30,
    width: '100%',
  },

  cancelContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.dark,
    borderRadius: 10,
    gap: 10,
    paddingVertical: height * 0.022,
    paddingHorizontal: height * 0.02,
    marginHorizontal: width * 0.003,
    width: width * 0.35,
  },

  proceedContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    gap: 10,
    paddingVertical: height * 0.022,
    paddingHorizontal: height * 0.02,
    marginHorizontal: width * 0.003,
    width: width * 0.35,
  },

  cancelText: {
    fontSize: width * 0.04,
    top: height * 0.0036,
    color: theme.colors.white,
    fontFamily: theme.typography.roboto.regular,
  },

  proceedText: {
    fontSize: width * 0.04,
    top: height * 0.0036,
    color: theme.colors.white,
    fontFamily: theme.typography.roboto.regular,
  },

  icon: {
    top: height * 0.002,
  },
});
