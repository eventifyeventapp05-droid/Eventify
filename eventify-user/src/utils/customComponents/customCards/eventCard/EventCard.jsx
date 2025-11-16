import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {theme} from '../../../../styles/theme';

const {width, height} = Dimensions.get('screen');

const EventCard = ({event, onPress}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Helper functions
  const getPrimaryImage = () => {
    const primaryImage = event.eventImage?.find(img => img.isPrimary);
    return primaryImage?.url || event.eventImage?.[0]?.url;
  };

  const formatDateTime = dateString => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('en-US', {weekday: 'short'}),
      date: date.getDate(),
      month: date.toLocaleDateString('en-US', {month: 'short'}),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };
  };

  const startDate = formatDateTime(event.dateTime?.start);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        {/* Event Image */}
        <View style={styles.imageWrapper}>
          {getPrimaryImage() ? (
            <Image source={{uri: getPrimaryImage()}} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons
                name="calendar-outline"
                size={width * 0.08}
                color={theme.colors.gray}
              />
            </View>
          )}

          {/* Date Badge */}
          <View style={styles.dateBadge}>
            <Text style={styles.dateDay}>{startDate.day}</Text>
            <Text style={styles.dateNumber}>{startDate.date}</Text>
            <Text style={styles.dateMonth}>{startDate.month}</Text>
          </View>
        </View>

        {/* Event Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>

          {/* Date and Time */}
          <View style={styles.datetimeContainer}>
            <Ionicons name="time-outline" size={14} color={theme.colors.gray} />
            <Text style={styles.datetimeText}>
              {startDate.day}, {startDate.date} {startDate.month} •{' '}
              {startDate.time}
            </Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default EventCard;

const styles = StyleSheet.create({
  card: {
    width: width * 0.42,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    padding: width * 0.02,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.lightGray,
    overflow: 'hidden',
    marginBottom: height * 0.012,
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.lightGray,
  },

  dateBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.small,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  dateDay: {
    fontSize: 10,
    fontFamily: theme.typography.roboto.medium,
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },

  dateNumber: {
    fontSize: 16,
    fontFamily: theme.typography.roboto.bold,
    color: theme.colors.dark,
    lineHeight: 18,
  },

  dateMonth: {
    fontSize: 10,
    fontFamily: theme.typography.roboto.medium,
    color: theme.colors.gray,
    textTransform: 'uppercase',
  },

  content: {
    paddingHorizontal: 4,
  },

  title: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.semiBold,
    color: theme.colors.dark,
    marginBottom: 6,
    lineHeight: 18,
  },

  datetimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  datetimeText: {
    fontSize: 11,
    fontFamily: theme.typography.roboto.regular,
    color: theme.colors.gray,
    marginLeft: 4,
    flex: 1,
  },
});
