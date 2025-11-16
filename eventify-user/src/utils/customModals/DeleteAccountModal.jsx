import React from 'react';
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
import {theme} from '../../styles/theme';

import deleteAnimation from '../../assets/animations/delete.json';

const {width, height} = Dimensions.get('screen');

const DeleteAccountModal = ({
  visible,
  title,
  description,
  onClose,
  onDeleteConfirm,
  loading = true,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* Animation or fallback */}
          {deleteAnimation ? (
            <LottieView
              source={deleteAnimation}
              autoPlay
              loop
              style={styles.animation}
            />
          ) : (
            <Ionicons
              name="warning"
              size={80}
              color={theme.colors.error}
              style={{marginBottom: 10}}
            />
          )}

          <Text style={styles.modalText}>{title}</Text>
          <Text style={styles.descriptionText}>{description}</Text>

          <View style={styles.btnContainer}>
            {/* Cancel Button */}
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <View style={styles.cancelContainer}>
                <Ionicons
                  name="close"
                  size={25}
                  color={theme.colors.white}
                  style={styles.icon}
                />
                <Text style={styles.cancelText}>Cancel</Text>
              </View>
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity onPress={onDeleteConfirm} disabled={loading}>
              <View style={styles.deleteContainer}>
                {/* Inner View for centering and spacing icon/text */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {loading ? (
                    <ActivityIndicator size={25} color={theme.colors.white} />
                  ) : (
                    <>
                      <Ionicons
                        name="trash"
                        size={25}
                        color={theme.colors.white}
                        style={styles.icon}
                      />
                      <Text style={styles.deleteText}>Delete</Text>
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

export default DeleteAccountModal;

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

  button: {
    flex: 1,
  },

  cancelContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.secondary,
    borderRadius: 10,
    gap: 10,
    paddingVertical: height * 0.022,
    paddingHorizontal: height * 0.02,
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.35,
  },

  deleteContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    paddingVertical: height * 0.022,
    paddingHorizontal: height * 0.02,
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.35,
  },

  cancelText: {
    fontSize: width * 0.04,
    color: theme.colors.white,
    fontFamily: theme.typography.roboto.regular,
  },
  
  deleteText: {
    fontSize: width * 0.04,
    color: theme.colors.white,
    fontFamily: theme.typography.roboto.regular,
  },

  icon: {
    marginRight: 8,
  },
});
