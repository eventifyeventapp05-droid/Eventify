import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {getOrganizers, clearError} from '../../redux/slices/organizerSlice';
import Header from '../../utils/customComponents/customHeader/Header';
import LinearGradient from 'react-native-linear-gradient'; // Already in project

const theme = {
  colors: {
    primary: '#1A73E8',
    secondary: '#3C4043',
    tertiary: '#5F6368',
    white: '#FFFFFF',
    background: '#F5F5F5',
    cardBackground: '#FFFFFF',
    border: '#E0E0E0',
    shadow: 'rgba(0,0,0,0.15)',
    error: '#FF5252',
    gradientStart: '#1A73E8',
    gradientEnd: '#0D47A1',
  },
  typography: {
    fontSize: {xs: 12, sm: 14, md: 16, lg: 20, xl: 24, xxl: 30},
    roboto: {
      light: 'Roboto-Light',
      regular: 'Roboto-Regular',
      medium: 'Roboto-Medium',
      bold: 'Roboto-Bold',
    },
  },
  borderRadius: {small: 8, medium: 12, large: 24, circle: 999},
  spacing: {sm: 8, md: 16, lg: 24},
};

const {width, height} = Dimensions.get('screen');

// Memoized Card with Staggered Animation
const OrganizerCard = ({item, onPress, index}) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{scale: scaleAnim}],
      }}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={onPress}>
        {/* Avatar with Glow */}
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri:
                item.organizerProfile?.profilePicture ||
                'https://via.placeholder.com/150',
            }}
            style={styles.avatar}
          />
          <View style={styles.avatarGlow} />
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{item.userName}</Text>
          <Text style={styles.services} numberOfLines={2}>
            {item.organizerProfile?.services?.join(' • ') ||
              'Services not listed'}
          </Text>
        </View>

        {/* Gradient Button */}
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
          style={styles.viewBtn}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}>
          <Text style={styles.viewBtnText}>View</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const OrganizersScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {organizers, loading, error} = useSelector(state => state.organizers);

  console.log('Organizers Data:', organizers);

  useEffect(() => {
    dispatch(getOrganizers());
    return () => dispatch(clearError());
  }, [dispatch]);

  const renderOrganizerCard = ({item, index}) => (
    <OrganizerCard
      item={item}
      index={index}
      onPress={() =>
        navigation.navigate('Organizer_Details', {organizer: item})
      }
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Organizers" onPressLeft={() => navigation.goBack()} />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => dispatch(getOrganizers())}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : organizers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No organizers found.</Text>
        </View>
      ) : (
        <FlatList
          data={organizers}
          keyExtractor={item => item._id}
          renderItem={renderOrganizerCard}
          contentContainerStyle={{padding: theme.spacing.md}}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default OrganizersScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: theme.colors.background},
  loaderContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.md,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.small,
  },
  retryBtnText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
  },
  emptyContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.tertiary,
  },

  // ============= ENHANCED CARD =============
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(224, 224, 224, 0.6)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },

  avatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    borderColor: theme.colors.white,
  },
  avatarGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: 'rgba(26, 115, 232, 0.25)',
    zIndex: -1,
  },

  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.roboto.medium,
    color: theme.colors.secondary,
    letterSpacing: 0.2,
  },
  services: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.light,
    color: theme.colors.tertiary,
    marginTop: 4,
    lineHeight: 18,
  },

  viewBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.small,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  viewBtnText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.bold,
    letterSpacing: 0.5,
  },
});
