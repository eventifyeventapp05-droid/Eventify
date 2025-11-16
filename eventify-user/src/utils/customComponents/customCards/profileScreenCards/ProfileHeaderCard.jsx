import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import {globalStyles} from '../../../../styles/globalStyles';
import Button from '../../customButton/Button';
import {theme} from '../../../../styles/theme';
import LinearGradient from 'react-native-linear-gradient';
import imgPlaceHolder from '../../../../assets/placeholders/default-avatar.png';

const {width, height} = Dimensions.get('screen');

const ProfileHeaderCard = ({
  image,
  name,
  phone,
  btnTitle,
  onPress,
  loading,
}) => {
  return (
    <SafeAreaView style={[globalStyles.container, styles.primaryContainer]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.white]}
        style={styles.gradientContainer}>
        <View style={styles.cardContainer}>
          <View style={styles.imgContainer}>
            {image ? (
              <Image source={{uri: image}} style={styles.img} />
            ) : (
              <Image source={imgPlaceHolder} style={styles.img} />
            )}
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.phone}>{phone}</Text>
          </View>
          <View style={styles.btnContainer}>
            <Button
              title={btnTitle}
              onPress={onPress}
              loading={loading}
              backgroundColor={theme.colors.primary}
              textColor={theme.colors.white}
            />
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ProfileHeaderCard;

const styles = StyleSheet.create({
  gradientContainer: {
    borderRadius: theme.borderRadius.large,
    marginHorizontal: width * 0.02,
    shadowColor: theme.colors.dark,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },

  cardContainer: {
    padding: height * 0.014,
    borderRadius: theme.borderRadius.large,
    backgroundColor: theme.colors.white + '90',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  imgContainer: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: theme.borderRadius.circle,
    overflow: 'hidden',
  },

  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  infoContainer: {
    top: height * 0.012,
  },

  name: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.bold,
    color: theme.colors.dark,
  },

  phone: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.medium,
    color: theme.colors.secondary,
    marginBottom: height * 0.03,
  },
});
