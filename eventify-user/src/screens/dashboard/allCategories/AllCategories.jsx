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
  TouchableOpacity,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {getAllEvents} from '../../../redux/slices/eventSlice';
import {theme} from '../../../styles/theme';
import Header from '../../../utils/customComponents/customHeader/Header';
import {globalStyles} from '../../../styles/globalStyles';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const {width, height} = Dimensions.get('screen');

const AllCategories = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const events = useSelector(state => state.events.events); // get all events
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Animation refs
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
    DEFAULT: {name: 'Category', icon: 'grid-outline', color: '#95A5A6'},
  };

  useEffect(() => {
    StatusBar.setBackgroundColor(theme.colors.primary);
    dispatch(getAllEvents());
  }, [dispatch]);

  // Extract unique categories from events
  useEffect(() => {
    if (events && events.length > 0) {
      const uniqueCategories = Array.from(
        new Set(events.map(e => e.category)),
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

      // Animate No Categories
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
    }
  }, [events]);

  // Filter categories by search query
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCategoryPress = category => {
    // Navigate to CategoryEvents screen for that category
    navigation.navigate('Category_Events', {
      category: category.originalCategory,
      categoryName: category.name,
    });
  };

  const renderCategoryItem = ({item}) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategoryPress(item)}>
      <View style={[styles.categoryIcon, {backgroundColor: item.color}]}>
        <Ionicons name={item.icon} size={30} color={theme.colors.white} />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.tertiary]}
      style={globalStyles.container}>
      <Header
        title="All Categories"
        showSearchBar
        searchText={searchQuery}
        onSearch={text => setSearchQuery(text)}
      />

      {filteredCategories.length > 0 ? (
        <FlatList
          data={filteredCategories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
        />
      ) : (
        <Animated.View
          style={[
            styles.noCategoriesContainer,
            {opacity: fadeAnim, transform: [{scale: scaleAnim}]},
          ]}>
          <Ionicons
            name="grid-outline"
            size={80}
            color="rgba(255,255,255,0.5)"
            style={{marginBottom: 20}}
          />
          <Text style={styles.noCategoriesText}>No Categories Found</Text>
          <Text style={styles.noCategoriesSubtext}>
            Try another search or check back later.
          </Text>
        </Animated.View>
      )}
    </LinearGradient>
  );
};

export default AllCategories;

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
  categoryItem: {
    alignItems: 'center',
    width: width * 0.45,
    marginBottom: height * 0.03,
  },
  categoryIcon: {
    width: width * 0.4,
    height: width * 0.2,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryName: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.roboto.medium,
    textAlign: 'center',
  },
  noCategoriesContainer: {
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
  noCategoriesText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.roboto.medium,
    textAlign: 'center',
    marginBottom: 6,
  },
  noCategoriesSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
    textAlign: 'center',
  },
});
