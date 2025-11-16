import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {bookTicket, clearError} from '../../redux/slices/ticketBookingSlice';
import Header from '../../utils/customComponents/customHeader/Header';
import Toast from 'react-native-toast-message';

const {width, height} = Dimensions.get('screen');

// Theme definition (Kept outside for easier use in styles)
const theme = {
  colors: {
    primary: '#1A73E8',
    secondary: '#3C4043',
    tertiary: '#5F6368',
    white: '#FFFFFF',
    background: '#F5F5F5',
    border: '#E0E0E0',
    success: '#00B894',
    warning: '#FBC02D',
    lightGray: '#F0F0F0',
    disabled: '#A0C3FF', // Added a disabled color for buttons
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
  borderRadius: {small: 8, medium: 12, large: 24},
};

const {colors, typography, borderRadius} = theme;
const {fontSize, roboto} = typography;

const TicketBooking = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  // Destructure params for cleaner access
  const {event, ticketType} = useRoute().params;

  const [quantity, setQuantity] = useState(1);
  const [animateValue] = useState(new Animated.Value(1));

  // Destructure state values
  const {loading, error} = useSelector(state => state.bookings);
  const maxQuantity = ticketType.quantity - ticketType.sold;
  const isMinQuantity = quantity === 1;
  const isMaxQuantity = quantity === maxQuantity;

  // Animate quantity changes
  const animateQuantity = () => {
    Animated.sequence([
      Animated.timing(animateValue, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animateValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (error) {
      // console.log('[Screen] Booking Error:', error); // Removed verbose log
      Toast.show({
        type: 'error',
        text1: 'Booking Failed',
        text2: error,
        position: 'top',
        visibilityTime: 2500,
      });
      dispatch(clearError());
    }
  }, [error, dispatch]); // Added dispatch to dependency array

  const increment = () => {
    if (!isMaxQuantity) {
      setQuantity(prev => prev + 1);
      animateQuantity();
      // console.log('[Screen] Quantity Incremented:', quantity + 1); // Removed verbose log
    }
  };

  const decrement = () => {
    if (!isMinQuantity) {
      setQuantity(prev => prev - 1);
      animateQuantity();
      // console.log('[Screen] Quantity Decremented:', quantity - 1); // Removed verbose log
    }
  };

  const handleBookTicket = async () => {
    // console.log('[Screen] Attempting to book:', { // Removed verbose log
    //   eventId: event._id,
    //   ticketType: ticketType.name,
    //   quantity,
    // });

    if (quantity <= 0 || quantity > maxQuantity) {
      console.error('[Screen] Invalid quantity selected:', quantity);
      Toast.show({
        type: 'error',
        text1: 'Invalid Quantity',
        text2: `Please select 1 to ${maxQuantity} tickets.`,
        position: 'top',
        visibilityTime: 2500,
      });
      return;
    }

    try {
      const resultAction = await dispatch(
        bookTicket({
          eventId: event._id,
          ticketType: ticketType.name,
          quantity,
        }),
      );

      // console.log('[Screen] Result Action:', resultAction); // Removed verbose log

      if (bookTicket.fulfilled.match(resultAction)) {
        console.log('[Screen] Booking Success');
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Ticket booked successfully!',
          position: 'top',
          visibilityTime: 2500,
        });
        navigation.goBack();
      } else {
        // Handle rejection payload which might be an object {message: "..."} or a string
        const errorMessage =
          resultAction.payload && typeof resultAction.payload === 'object'
            ? resultAction.payload.message || 'An unknown error occurred.'
            : resultAction.payload || 'Booking failed due to a server error.';

        console.error('[Screen] Booking Failed:', errorMessage);
        Toast.show({
          type: 'error',
          text1: 'Booking Failed',
          text2: errorMessage,
          position: 'top',
          visibilityTime: 2500,
        });
      }
    } catch (err) {
      console.error('[Screen] Exception Booking Ticket:', err);
      Toast.show({
        type: 'error',
        text1: 'Booking Error',
        text2: 'Something went wrong. Please try again.',
        position: 'top',
        visibilityTime: 2500,
      });
    }
  };

  const totalPrice = ticketType.price * quantity;

  return (
    <SafeAreaView style={localStyles.container}>
      <Header title="Book Ticket" onPressLeft={() => navigation.goBack()} />

      <View style={localStyles.content}>
        {/* Event Title */}
        <Text style={localStyles.eventTitle} accessibilityRole="header">
          {event.title}
        </Text>

        {/* Ticket Card */}
        <View style={localStyles.ticketCard}>
          <Text style={localStyles.ticketLabel}>Ticket Type</Text>
          <Text style={localStyles.ticketValue}>{ticketType.name}</Text>

          <Text style={[localStyles.ticketLabel, {marginTop: 10}]}>Price</Text>
          <Text style={localStyles.ticketValue}>
            PKR {ticketType.price.toLocaleString()}
          </Text>
        </View>

        {/* Quantity Selector */}
        <View style={localStyles.quantityBox}>
          <Text style={localStyles.quantityLabel}>Quantity</Text>
          <View style={localStyles.quantityControls}>
            <TouchableOpacity
              style={[
                localStyles.quantityBtn,
                isMinQuantity && localStyles.quantityBtnDisabled,
              ]}
              onPress={decrement}
              disabled={isMinQuantity}
              accessibilityLabel="Decrease quantity"
              accessibilityRole="button">
              <Text style={localStyles.quantityBtnText}>-</Text>
            </TouchableOpacity>

            <Animated.Text
              style={[
                localStyles.quantityText,
                {transform: [{scale: animateValue}]},
              ]}
              accessibilityLabel={`Selected quantity: ${quantity}`}>
              {quantity}
            </Animated.Text>

            <TouchableOpacity
              style={[
                localStyles.quantityBtn,
                isMaxQuantity && localStyles.quantityBtnDisabled,
              ]}
              onPress={increment}
              disabled={isMaxQuantity}
              accessibilityLabel="Increase quantity"
              accessibilityRole="button">
              <Text style={localStyles.quantityBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={localStyles.availableText}>
            {maxQuantity} tickets available
          </Text>
        </View>

        {/* Total Price */}
        <View style={localStyles.totalBox}>
          <Text style={localStyles.totalLabel}>Total Price</Text>
          <Text style={localStyles.totalValue}>
            PKR {totalPrice.toLocaleString()}
          </Text>
        </View>

        {/* Book Button */}
        <TouchableOpacity
          style={[localStyles.bookBtn, loading && localStyles.bookBtnLoading]}
          onPress={handleBookTicket}
          disabled={loading}
          accessibilityLabel={loading ? 'Booking ticket' : 'Book ticket now'}
          accessibilityRole="button">
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={localStyles.bookBtnText}>Book Ticket</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Renamed styles to localStyles to avoid conflict with 'styles' object usage
const localStyles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: 20},
  eventTitle: {
    fontSize: fontSize.xl,
    fontFamily: roboto.bold,
    color: colors.secondary,
    marginBottom: 25,
    textAlign: 'center',
  },
  ticketCard: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: borderRadius.medium,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 25,
  },
  ticketLabel: {
    fontSize: fontSize.sm,
    fontFamily: roboto.medium,
    color: colors.tertiary,
  },
  ticketValue: {
    fontSize: fontSize.md,
    fontFamily: roboto.bold,
    color: colors.secondary,
    marginTop: 4,
  },
  quantityBox: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: borderRadius.medium,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 25,
  },
  quantityLabel: {
    fontSize: fontSize.sm,
    fontFamily: roboto.medium,
    color: colors.tertiary,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  quantityBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: borderRadius.small,
  },
  quantityBtnDisabled: {
    backgroundColor: colors.disabled, // Use a softer color when disabled
  },
  quantityBtnText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontFamily: roboto.medium,
  },
  quantityText: {
    fontSize: fontSize.lg,
    fontFamily: roboto.bold,
    marginHorizontal: 25,
    color: colors.secondary,
  },
  availableText: {
    fontSize: fontSize.xs,
    fontFamily: roboto.regular,
    color: colors.tertiary,
    textAlign: 'center',
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.lightGray,
    padding: 15,
    borderRadius: borderRadius.medium,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: colors.border, // Added a border for definition
  },
  totalLabel: {
    fontSize: fontSize.md,
    fontFamily: roboto.medium,
    color: colors.secondary,
  },
  totalValue: {
    fontSize: fontSize.md,
    fontFamily: roboto.bold,
    color: colors.primary,
  },
  bookBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: borderRadius.large,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  bookBtnLoading: {
    backgroundColor: colors.primary, // Keep color, opacity handled by prop
  },
  bookBtnText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontFamily: roboto.medium,
  },
});

export default TicketBooking;
