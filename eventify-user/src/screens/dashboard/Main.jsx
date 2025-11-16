import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  StatusBar,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import {theme} from '../../styles/theme';
import {globalStyles} from '../../styles/globalStyles';
import Header from '../../utils/customComponents/customHeader/Header';
import {useDispatch, useSelector} from 'react-redux';
import {getUser} from '../../redux/slices/userSlice';
import {getAllEvents} from '../../redux/slices/eventSlice';
import LinearGradient from 'react-native-linear-gradient';
import Loader from '../../utils/customComponents/customLoader/Loader';
import EventCard from '../../utils/customComponents/customCards/eventCard/EventCard';
import Ionicons from 'react-native-vector-icons/Ionicons';

const {width, height} = Dimensions.get('screen');

const Home = ({navigation}) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const events = useSelector(state => state.events.events);
  const eventsLoading = useSelector(state => state.events.loading);

  console.log('Events in Home:', events);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Animated values for No Events
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Category config
  const categoryConfig = {
    CONCERT: {name: 'Concert', icon: 'musical-notes-outline', color: '#E74C3C'},
    BUSINESS: {name: 'Business', icon: 'business-outline', color: '#4A90E2'},
    COMEDY: {name: 'Comedy', icon: 'happy-outline', color: '#F39C12'},
    EXHIBITION: {name: 'Exhibition', icon: 'images-outline', color: '#9B59B6'},
    SPORTS: {name: 'Sports', icon: 'basketball-outline', color: '#27AE60'},
    WORKSHOP: {name: 'Workshop', icon: 'school-outline', color: '#34495E'},
    FOOD: {name: 'Food', icon: 'restaurant-outline', color: '#E67E22'},
    ART: {name: 'Art', icon: 'color-palette-outline', color: '#8E44AD'},
    DEFAULT: {name: 'Event', icon: 'calendar-outline', color: '#95A5A6'},
  };

  // Extract unique categories
  useEffect(() => {
    if (events && events.length > 0) {
      const uniqueCategories = Array.from(
        new Set(events.map(event => event.category)),
      ).map((cat, index) => {
        const config = categoryConfig[cat] || categoryConfig.DEFAULT;
        return {
          id: index.toString(),
          name: config.name,
          originalCategory: cat,
          color: config.color,
          icon: config.icon,
        };
      });
      setCategories(uniqueCategories);
    }
  }, [events]);

  useEffect(() => {
    StatusBar.setBackgroundColor(theme.colors.primary);

    // Animate No Events section on mount
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
  }, []);

  useEffect(() => {
    if (user?.id) {
      dispatch(getUser(user.id));
      dispatch(getAllEvents());
    }
  }, [dispatch, user]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Event & Category Handlers
  const handleEventPress = event =>
    navigation.navigate('Event_Details', {event});

  const handleCategoryPress = category =>
    navigation.navigate('Category_Events', {
      category: category.originalCategory,
      categoryName: category.name,
    });

  const handleBrowseAll = () => navigation.navigate('All_Categories');

  const handleSeeAllFeatured = () => navigation.navigate('All_Events');

  // Render
  const renderEventCard = ({item}) => (
    <EventCard event={item} onPress={() => handleEventPress(item)} />
  );

  const renderCategoryItem = ({item}) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategoryPress(item)}>
      <View style={[styles.categoryIcon, {backgroundColor: item.color}]}>
        <Ionicons name={item.icon} size={24} color={theme.colors.white} />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderSection = (title, data, showAll = false, limit = false) => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {showAll && data.length > 0 && (
          <Text style={styles.seeAllText} onPress={handleSeeAllFeatured}>
            See All
          </Text>
        )}
      </View>

      {data && data.length > 0 ? (
        <FlatList
          data={limit ? data.slice(0, 3) : data}
          renderItem={renderEventCard}
          keyExtractor={item => item._id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No events found</Text>
        </View>
      )}
    </View>
  );

  // Search filtering
  const allEvents = events || [];
  const filteredEvents = allEvents.filter(
    event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const featuredEvents = filteredEvents.filter(event => event.isFeatured);

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.tertiary]}
      style={globalStyles.container}>
      <Header
        title="Home"
        showSearchBar
        searchText={searchQuery}
        onSearch={text => setSearchQuery(text)}
      />

      {isLoading || eventsLoading ? (
        <View style={styles.loaderContainer}>
          <Loader />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
              Welcome, {user?.userName || 'User'}! 👋
            </Text>
            <Text style={styles.subtitle}>
              Discover amazing events around you
            </Text>
          </View>

          {featuredEvents.length > 0 &&
            renderSection('Featured Events', featuredEvents, true, true)}

          {filteredCategories.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <TouchableOpacity onPress={handleBrowseAll}>
                  <Text style={styles.seeAllText}>Browse all</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={filteredCategories.slice(0, 4)}
                renderItem={renderCategoryItem}
                keyExtractor={item => item.id}
                numColumns={4}
                columnWrapperStyle={styles.categoriesRow}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {filteredEvents.length === 0 && (
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
              <Text style={styles.noEventsText}>No Event Found</Text>
              <Text style={styles.noEventsSubtext}>
                Check back later or try searching for something else!
              </Text>
            </Animated.View>
          )}
        </ScrollView>
      )}
    </LinearGradient>
  );
};

export default Home;

const styles = StyleSheet.create({
  scrollContent: {paddingBottom: height * 0.1},
  welcomeContainer: {
    marginTop: height * 0.02,
    paddingHorizontal: width * 0.06,
    marginBottom: height * 0.02,
  },
  welcomeText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.roboto.semiBold,
    marginBottom: 4,
  },
  subtitle: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
    opacity: 0.8,
  },
  sectionContainer: {
    marginTop: height * 0.03,
    paddingHorizontal: width * 0.04,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.02,
    paddingHorizontal: width * 0.02,
  },
  sectionTitle: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.roboto.semiBold,
  },
  seeAllText: {
    color: theme.colors.accent,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.medium,
  },
  categoriesRow: {justifyContent: 'space-between', marginBottom: height * 0.02},
  categoryItem: {
    alignItems: 'center',
    width: width * 0.2,
    marginBottom: height * 0.02,
  },
  categoryIcon: {
    width: width * 0.14,
    height: width * 0.14,
    borderRadius: theme.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryName: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.roboto.medium,
    textAlign: 'center',
  },
  columnWrapper: {justifyContent: 'space-between', marginBottom: height * 0.02},
  emptyState: {alignItems: 'center', paddingVertical: height * 0.03},
  emptyStateText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
    opacity: 0.7,
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
  loaderContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});
