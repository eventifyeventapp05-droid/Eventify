import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../../../styles/theme';

const {width, height} = Dimensions.get('screen');

const Header = ({
  title,
  logo,
  leftIcon,
  onPressLeft,
  showSearchBar = false,
  searchText = '',
  onSearch = () => {},
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.headerContainer,
        {opacity: fadeAnim, transform: [{scale: scaleAnim}]},
      ]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradientBackground}>
        <View style={styles.topRow}>
          {leftIcon && (
            <TouchableOpacity onPress={onPressLeft} activeOpacity={0.8}>
              {React.isValidElement(leftIcon) ? (
                leftIcon
              ) : (
                <Image
                  source={leftIcon}
                  style={[styles.icon, {tintColor: theme.colors.white}]}
                />
              )}
            </TouchableOpacity>
          )}

          <View style={styles.logoTitleGroup}>
            {logo && <Image source={logo} style={styles.logo} />}
            <Text style={[styles.title, {color: theme.colors.white}]}>
              {title}
            </Text>
          </View>
        </View>

        {showSearchBar && (
          <View style={styles.searchBarContainer}>
            <View style={styles.searchBar}>
              <MaterialCommunityIcons
                name="magnify"
                size={width * 0.05}
                color="#fff"
                style={{marginRight: width * 0.03}}
              />
              <TextInput
                placeholder="Search"
                placeholderTextColor="#fff"
                style={styles.searchInput}
                value={searchText}
                onChangeText={onSearch}
              />
            </View>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
  },
  gradientBackground: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.018,
    paddingBottom: height * 0.015,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logoTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: width * 0.04,
  },
  logo: {
    width: width * 0.3,
    height: height * 0.04,
    resizeMode: 'contain',
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.roboto.semiBold,
  },
  icon: {
    width: width * 0.06,
    height: width * 0.06,
    resizeMode: 'contain',
  },
  searchBarContainer: {
    width: '100%',
    marginTop: height * 0.015,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: width * 0.04,
    borderRadius: width * 0.07,
    height: height * 0.055,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
  },
});
