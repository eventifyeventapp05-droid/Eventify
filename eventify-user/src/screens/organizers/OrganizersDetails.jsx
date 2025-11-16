import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  SafeAreaView,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Header from '../../utils/customComponents/customHeader/Header';
import {useSelector} from 'react-redux';

const {width, height} = Dimensions.get('screen');

const theme = {
  colors: {
    primary: '#1A73E8',
    secondary: '#3C4043',
    tertiary: '#5F6368',
    white: '#FFFFFF',
    background: '#F8F9FA',
    cardBackground: '#FFFFFF',
    border: '#E0E0E0',
    shadow: 'rgba(0,0,0,0.12)',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#FF5252',
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
  borderRadius: {small: 8, medium: 16, large: 28, circle: 999},
  spacing: {sm: 8, md: 16, lg: 24, xl: 32},
};

const Organizer_Details = ({route, navigation}) => {
  const {organizer} = route.params;
  const [activeTab, setActiveTab] = useState('services');

  // GET USER ID FROM REDUX (CORRECT: _id)
  const currentUserId = useSelector(state => state.auth?.user?.id);
  console.log('Organizer Details - Current User ID:', currentUserId);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 9,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const profilePic =
    organizer.organizerProfile?.profilePicture ||
    `https://via.placeholder.com/150?text=${organizer.userName?.[0] || 'O'}`;

  const services = organizer.organizerProfile?.services || [];
  const availability = organizer.organizerProfile?.availability || [];
  const bookedEvents = organizer.bookedEvents || [];

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = dateString => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleChatPress = () => {
    if (!currentUserId) {
      alert('Please log in to start a chat');
      return;
    }

    navigation.navigate('Chat', {
      chatData: {
        participantId: organizer._id,
        participantName: organizer.userName,
        _id: null,
      },
      currentUserId,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Header
          title={organizer?.userName}
          onBack={() => navigation.goBack()}
        />
      </View>

      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* HERO CARD */}
          <View style={styles.heroCard}>
            <View style={styles.avatarWrapper}>
              <Image source={{uri: profilePic}} style={styles.avatar} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>
                {organizer.userName || 'Organizer'}
              </Text>
              <Text style={styles.role}>Professional Event Organizer</Text>
              <Text style={styles.email}>{organizer.email}</Text>
            </View>
            <TouchableOpacity style={styles.chatBtn} onPress={handleChatPress}>
              <Feather
                name="message-circle"
                size={26}
                color={theme.colors.white}
              />
            </TouchableOpacity>
          </View>

          {/* STATS */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{services.length}</Text>
              <Text style={styles.statLabel}>Services</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{bookedEvents.length}</Text>
              <Text style={styles.statLabel}>Events</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {availability.filter(a => a.isAvailable).length}
              </Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
          </View>

          {/* TABS */}
          <View style={styles.tabBar}>
            {['services', 'availability', 'events'].map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}>
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === tab && styles.activeTabLabel,
                  ]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* TAB CONTENT */}
          <View style={styles.contentCard}>
            {activeTab === 'services' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Services Offered</Text>
                {services.length > 0 ? (
                  <View style={styles.tagsContainer}>
                    {services.map((s, i) => (
                      <View key={i} style={styles.tag}>
                        <FontAwesome6
                          name="check"
                          size={14}
                          color={theme.colors.success}
                        />
                        <Text style={styles.tagText}>{s.trim()}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.empty}>No services listed.</Text>
                )}
              </View>
            )}

            {activeTab === 'availability' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Availability</Text>
                {availability.length > 0 ? (
                  <View>
                    {availability.map(slot => (
                      <View key={slot._id} style={styles.slotCard}>
                        <View>
                          <Text style={styles.slotDate}>
                            {formatDate(slot.date)}
                          </Text>
                          <Text style={styles.slotTime}>
                            {formatTime(slot.date)}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.slotStatus,
                            slot.isAvailable ? styles.available : styles.booked,
                          ]}>
                          <Text
                            style={[
                              styles.slotStatusText,
                              slot.isAvailable && styles.availableText,
                            ]}>
                            {slot.isAvailable ? 'Free' : 'Booked'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.empty}>No slots available.</Text>
                )}
              </View>
            )}

            {activeTab === 'events' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Booked Events</Text>
                {bookedEvents.length > 0 ? (
                  <View>
                    {bookedEvents.map(booking => {
                      const e = booking.eventId;
                      if (!e) return null;
                      return (
                        <TouchableOpacity
                          key={booking._id}
                          style={styles.eventItem}>
                          <Image
                            source={{
                              uri:
                                e.eventImage?.[0]?.url ||
                                'https://via.placeholder.com/100',
                            }}
                            style={styles.eventThumb}
                          />
                          <View style={styles.eventDetails}>
                            <Text style={styles.eventName} numberOfLines={1}>
                              {e.title || 'Untitled'}
                            </Text>
                            <Text style={styles.eventLocation}>
                              <Feather name="map-pin" size={12} />{' '}
                              {e.venue?.city || 'N/A'}
                            </Text>
                            <Text style={styles.eventDateText}>
                              {formatDate(e.dateTime?.start)}
                            </Text>
                            <View
                              style={[
                                styles.eventBadge,
                                styles[booking.status?.toLowerCase()] ||
                                  styles.pending,
                              ]}>
                              <Text style={styles.badgeText}>
                                {booking.status}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.empty}>No events booked.</Text>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default Organizer_Details;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: theme.colors.background},
  scrollContent: {paddingBottom: height * 0.12},
  headerContainer: {alignItems: 'center'},
  heroCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.lg,
    marginTop: height * 0.04,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    elevation: 12,
    shadowColor: theme.colors.shadow,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.18,
    shadowRadius: 16,
    alignItems: 'center',
  },
  avatarWrapper: {position: 'relative'},
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: theme.colors.white,
  },
  profileInfo: {flex: 1, marginLeft: theme.spacing.lg},
  name: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.roboto.bold,
    color: theme.colors.secondary,
  },
  role: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
    marginTop: 4,
    fontFamily: theme.typography.roboto.medium,
  },
  email: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.tertiary,
    marginTop: 6,
  },
  chatBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    elevation: 4,
  },
  statCard: {flex: 1, alignItems: 'center'},
  statValue: {
    fontSize: theme.typography.fontSize.xxl,
    fontFamily: theme.typography.roboto.bold,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.tertiary,
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    padding: 6,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.small,
    alignItems: 'center',
  },
  activeTab: {backgroundColor: theme.colors.primary},
  tabLabel: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.roboto.medium,
    color: theme.colors.tertiary,
  },
  activeTabLabel: {color: theme.colors.white},
  contentCard: {
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.xl,
    elevation: 4,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.roboto.bold,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.lg,
  },
  tagsContainer: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
  },
  tagText: {
    marginLeft: 8,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.success,
    fontFamily: theme.typography.roboto.medium,
  },
  slotCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.md,
  },
  slotDate: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.roboto.medium,
    color: theme.colors.secondary,
  },
  slotTime: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.tertiary,
    marginTop: 2,
  },
  slotStatus: {paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20},
  available: {backgroundColor: '#E8F5E9'},
  booked: {backgroundColor: '#FFEBEE'},
  slotStatusText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.roboto.bold,
  },
  availableText: {color: theme.colors.success},
  eventItem: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    elevation: 1,
  },
  eventThumb: {width: 90, height: 90},
  eventDetails: {flex: 1, padding: theme.spacing.md, justifyContent: 'center'},
  eventName: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.roboto.medium,
    color: theme.colors.secondary,
  },
  eventLocation: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.tertiary,
    marginTop: 4,
  },
  eventDateText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
    marginTop: 2,
  },
  eventBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
  },
  pending: {backgroundColor: '#FFF3E0'},
  confirmed: {backgroundColor: '#E8F5E9'},
  cancelled: {backgroundColor: '#FFEBEE'},
  badgeText: {
    fontSize: 10,
    fontFamily: theme.typography.roboto.bold,
    color: theme.colors.warning,
  },
  empty: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: theme.spacing.lg,
  },
});
