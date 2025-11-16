import React, {useState, useEffect} from 'react';
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';
import Toast from 'react-native-toast-message';
import {theme} from '../../styles/theme';

// Make sure this path is valid
import uploadAnimation from '../../assets/animations/image.json';

const {width, height} = Dimensions.get('screen');

const ImageUploadModal = ({
  visible,
  title,
  description,
  onClose,
  onImageUpload,
}) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('ImageUploadModal rendered - visible:', visible);
  }, [visible]);

  const handleImageSelection = image => {
    if (!image) return;
    setLoading(false);
    onImageUpload(image.path);
  };

  const handlePickImage = async () => {
    setLoading(true);
    try {
      const image = await ImagePicker.openPicker({
        width: 400,
        height: 400,
        cropping: true,
      });
      handleImageSelection(image);
    } catch (error) {
      console.error('Image Picker Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Image Selection Failed',
        text2: 'Something went wrong while picking the image.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCamera = async () => {
    setLoading(true);
    try {
      const image = await ImagePicker.openCamera({
        width: 400,
        height: 400,
        cropping: true,
      });
      handleImageSelection(image);
    } catch (error) {
      console.error('Camera Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Camera Error',
        text2: 'Something went wrong while opening the camera.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* Animation or fallback */}
          {uploadAnimation ? (
            <LottieView
              source={uploadAnimation}
              autoPlay
              loop
              style={styles.animation}
            />
          ) : (
            <Text style={{color: 'red', marginBottom: 10}}>
              Animation failed to load.
            </Text>
          )}

          <Text style={styles.modalText}>{title}</Text>
          <Text style={styles.descriptionText}>{description}</Text>

          <View style={styles.btnContainer}>
            {/* Camera */}
            <TouchableOpacity onPress={handleOpenCamera}>
              <View style={styles.cameraContainer}>
                <Ionicons
                  name="camera"
                  size={25}
                  color={theme.colors.white}
                  style={styles.icon}
                />
                <Text style={styles.cameraText}>Camera</Text>
              </View>
            </TouchableOpacity>

            {/* Gallery */}
            <TouchableOpacity onPress={handlePickImage}>
              <View style={styles.galleryContainer}>
                {loading ? (
                  <ActivityIndicator size={25} color={theme.colors.white} />
                ) : (
                  <>
                    <Ionicons
                      name="image"
                      size={25}
                      color={theme.colors.white}
                      style={styles.icon}
                    />
                    <Text style={styles.galleryText}>Gallery</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ImageUploadModal;

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
    height: height * 0.48,
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

  cameraContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.dark,
    borderRadius: 10,
    gap: 10,
    paddingVertical: height * 0.022,
    paddingHorizontal: height * 0.02,
    marginHorizontal: width * 0.003,
    width: width * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
  },

  galleryContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    gap: 10,
    paddingVertical: height * 0.022,
    paddingHorizontal: height * 0.02,
    marginHorizontal: width * 0.003,
    width: width * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cameraText: {
    fontSize: width * 0.04,
    color: theme.colors.white,
    fontFamily: theme.typography.roboto.regular,
  },

  galleryText: {
    fontSize: width * 0.04,
    color: theme.colors.white,
    fontFamily: theme.typography.roboto.regular,
  },

  icon: {
    marginRight: 8,
  },
});
