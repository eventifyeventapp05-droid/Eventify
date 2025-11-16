import React, {useEffect, useCallback, useState, memo} from 'react';
import {
  StyleSheet,
  StatusBar,
  View,
  ScrollView,
  Text,
  Image,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import {getUser} from '../../../redux/slices/userSlice';
import Header from '../../../utils/customComponents/customHeader/Header';
import {theme} from '../../../styles/theme';
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const {width, height} = Dimensions.get('screen');

// Skeleton Card Component
const SkeletonCard = () => (
  <View style={styles.bookingCard}>
    <View style={styles.skeletonImage} />
    <View style={styles.bookingInfo}>
      <View style={styles.skeletonLineLg} />
      <View style={styles.skeletonLineSm} />
      <View style={styles.skeletonLineSm} />
      <View style={styles.skeletonLineMd} />
    </View>
  </View>
);

// Booking Card Component (memoized)
const BookingCard = memo(({booking}) => {
  const event = booking.eventId;
  const primaryImage =
    event.eventImage?.find(img => img.isPrimary)?.url ||
    'https://via.placeholder.com/150';

  const startDate = moment(event.dateTime.start).format('MMM D, YYYY');
  const startTime = moment(event.dateTime.start).format('hh:mm A');

  const isPending = booking.bookingStatus === 'PENDING';

  return (
    <View style={styles.bookingCard}>
      <Image
        source={{uri: primaryImage}}
        style={styles.eventImage}
        resizeMode="cover"
      />

      <View style={styles.bookingInfo}>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons
            name="map-marker"
            size={16}
            color={theme.colors.tertiary}
          />
          <Text style={styles.eventDetails}>
            {event.venue?.name}, {event.venue?.city}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons
            name="calendar"
            size={16}
            color={theme.colors.tertiary}
          />
          <Text style={styles.eventDetails}>{startDate}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={16}
            color={theme.colors.tertiary}
          />
          <Text style={styles.eventDetails}>{startTime}</Text>
        </View>

        <View style={styles.ticketInfo}>
          <View style={styles.ticketRow}>
            <MaterialCommunityIcons
              name="ticket"
              size={16}
              color={theme.colors.secondary}
            />
            <Text style={styles.ticketText}>
              {booking.ticketType} × {booking.quantity}
            </Text>
          </View>
          <Text style={styles.priceText}>
            PKR {booking.totalPrice.toLocaleString()}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              isPending ? styles.pendingBadge : styles.confirmedBadge,
            ]}>
            <MaterialCommunityIcons
              name={isPending ? 'alert-circle-outline' : 'ticket'}
              size={16}
              color={theme.colors.white}
            />
            <Text style={styles.statusText}>{booking.bookingStatus}</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const MyBookings = ({navigation}) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const userProfile = useSelector(state => state.user.user);
  const loading = useSelector(state => state.user.loading);
  const error = useSelector(state => state.user.error);

  const [refreshing, setRefreshing] = useState(false);

  const fetchUserData = useCallback(() => {
    if (user?.id) {
      dispatch(getUser(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    StatusBar.setBackgroundColor(theme.colors.primary);
    StatusBar.setBarStyle('light-content');
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserData().finally(() => setRefreshing(false));
  }, [fetchUserData]);

  const bookings = userProfile?.bookedEvents || [];

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.tertiary]}
      style={styles.container}>
      <View style={styles.headerContainer}>
        <Header title="My Bookings" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.white]}
            tintColor={theme.colors.white}
          />
        }>
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={48}
              color={theme.colors.error}
            />
            <Text style={styles.errorText}>Failed to load bookings.</Text>
            <TouchableOpacity
              onPress={fetchUserData}
              style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : bookings.length > 0 ? (
          bookings.map(booking => (
            <BookingCard key={booking._id} booking={booking} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Image style={styles.emptyImage} resizeMode="contain" />
            <Text style={styles.emptyTitle}>No Bookings Yet</Text>
            <Text style={styles.emptySubtitle}>
              Explore events and book your next adventure!
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate('Main')}>
              <Text style={styles.exploreText}>Explore Events</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

export default MyBookings;

// === STYLES ===
const styles = StyleSheet.create({
  container: {flex: 1},
  headerContainer: {
    marginBottom: height * 0.015,
    paddingBottom: height * 0.01,
  },
  scrollContent: {
    paddingBottom: height * 0.12,
    paddingHorizontal: 15,
  },

  // Skeleton
  skeletonImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#e0e0e0',
  },
  skeletonLineLg: {
    height: 20,
    width: '80%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonLineSm: {
    height: 14,
    width: '60%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonLineMd: {
    height: 16,
    width: '40%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 10,
  },

  // Card
  bookingCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    marginBottom: 18,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 6},
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  eventImage: {
    width: '100%',
    height: 180,
  },
  bookingInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.roboto.bold,
    color: theme.colors.secondary,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventDetails: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
    color: theme.colors.tertiary,
    marginLeft: 6,
  },
  ticketInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.medium,
    color: theme.colors.secondary,
    marginLeft: 6,
  },
  priceText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.roboto.bold,
    color: theme.colors.primary,
  },

  // Status
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pendingBadge: {
    backgroundColor: theme.colors.warning,
  },
  confirmedBadge: {
    backgroundColor: theme.colors.success,
  },
  statusText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.roboto.medium,
    marginLeft: 6,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    marginTop: height * 0.1,
    paddingHorizontal: 30,
  },
  emptyImage: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.roboto.bold,
    color: theme.colors.white,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },
  exploreText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.roboto.bold,
    fontSize: theme.typography.fontSize.md,
  },

  // Error
  errorContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  errorText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.roboto.medium,
  },
});
