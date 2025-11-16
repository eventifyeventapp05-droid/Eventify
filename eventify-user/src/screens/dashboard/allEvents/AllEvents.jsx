import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {getAllEvents} from '../../../redux/slices/eventSlice';
import {theme} from '../../../styles/theme';
import Loader from '../../../utils/customComponents/customLoader/Loader';
import EventCard from '../../../utils/customComponents/customCards/eventCard/EventCard';
import Header from '../../../utils/customComponents/customHeader/Header';
import {globalStyles} from '../../../styles/globalStyles';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const {width, height} = Dimensions.get('screen');

const AllEvents = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const events = useSelector(state => state.events.events);
  const eventsLoading = useSelector(state => state.events.loading);
  const [searchQuery, setSearchQuery] = useState('');

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    StatusBar.setBackgroundColor(theme.colors.primary);
    dispatch(getAllEvents());

    // Animate No Events
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [dispatch]);

  // Filter events based on search query
  const filteredEvents =
    events?.filter(
      event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const handleEventPress = event => {
    navigation.navigate('Event_Details', {event});
  };

  const renderEventCard = ({item}) => (
    <EventCard event={item} onPress={() => handleEventPress(item)} />
  );

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.tertiary]}
      style={globalStyles.container}>
      {/* Header with search */}
      <Header
        title="All Events"
        showSearchBar
        searchText={searchQuery}
        onSearch={text => setSearchQuery(text)}
      />

      {eventsLoading ? (
        <View style={styles.loaderContainer}>
          <Loader />
        </View>
      ) : filteredEvents.length > 0 ? (
        <FlatList
          data={filteredEvents}
          renderItem={renderEventCard}
          keyExtractor={item => item._id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
        />
      ) : (
        <Animated.View
          style={[
            styles.noEventsContainer,
            {opacity: fadeAnim, transform: [{scale: scaleAnim}]},
          ]}>
          <Ionicons
            name="calendar-outline"
            size={80}
            color="rgba(255,255,255,0.5)"
            style={{marginBottom: 20}}
          />
          <Text style={styles.noEventsText}>No Events Found</Text>
          <Text style={styles.noEventsSubtext}>
            Try another search or check back later.
          </Text>
        </Animated.View>
      )}
    </LinearGradient>
  );
};

export default AllEvents;

const styles = StyleSheet.create({
  flatListContent: {
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: height * 0.02,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noEventsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.1,
    paddingHorizontal: width * 0.1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    marginHorizontal: width * 0.05,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginTop: height * 0.14,
  },
  noEventsText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.roboto.medium,
    textAlign: 'center',
    marginBottom: 6,
  },
  noEventsSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
    textAlign: 'center',
  },
});
