import React, {useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {theme} from '../../../styles/theme';
import Header from '../../../utils/customComponents/customHeader/Header';
import {globalStyles} from '../../../styles/globalStyles';
import LinearGradient from 'react-native-linear-gradient';

const {width, height} = Dimensions.get('window');

const PrivacyPolicy = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const statusBarColor = theme.colors.primary;
    StatusBar.setBackgroundColor(statusBarColor);
  }, []);

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.tertiary]}
      style={{flex: 1}}>
      <SafeAreaView style={[globalStyles.container, styles.primaryContainer]}>
        <View style={styles.headerContainer}>
          <Header
            title="Privacy Policy"
            onPressLeft={() => navigation.goBack('')}
          />
        </View>

        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitleText, {color: theme.colors.white}]}>
            Privacy Policy
          </Text>
          <Text
            style={[styles.headerDescriptionText, {color: theme.colors.white}]}>
            How we handle your data at Eventify.
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Text style={[styles.heading, {color: theme.colors.white}]}>
            Introduction
          </Text>
          <Text style={[styles.description, {color: theme.colors.white}]}>
            Welcome to Eventify! We value your privacy and are committed to
            protecting your data. This Privacy Policy explains how we collect,
            use, and safeguard your information when you use our platform to
            discover, register for, and manage events.
          </Text>

          <Text style={[styles.heading, {color: theme.colors.white}]}>
            Information Collection
          </Text>
          <Text style={[styles.description, {color: theme.colors.white}]}>
            We collect the following types of information:
          </Text>
          <View style={styles.bulletContainer}>
            <Ionicons
              name="person-outline"
              size={width * 0.06}
              color={theme.colors.white}
              style={styles.bulletIcon}
            />
            <Text style={[styles.bulletText, {color: theme.colors.white}]}>
              Personal Information: such as your name, email address, phone
              number, and profile details.
            </Text>
          </View>
          <View style={styles.bulletContainer}>
            <Ionicons
              name="calendar-outline"
              size={width * 0.06}
              color={theme.colors.white}
              style={styles.bulletIcon}
            />
            <Text style={[styles.bulletText, {color: theme.colors.white}]}>
              Event Registration Data: events you've registered for, attendance
              history, and preferences.
            </Text>
          </View>
          <View style={styles.bulletContainer}>
            <Ionicons
              name="location-outline"
              size={width * 0.06}
              color={theme.colors.white}
              style={styles.bulletIcon}
            />
            <Text style={[styles.bulletText, {color: theme.colors.white}]}>
              Location Data: to show you relevant events in your area (with your
              permission).
            </Text>
          </View>

          <Text style={[styles.heading, {color: theme.colors.white}]}>
            How We Use Your Information
          </Text>
          <Text style={[styles.description, {color: theme.colors.white}]}>
            We use your information to:
          </Text>
          <View style={styles.bulletContainer}>
            <Ionicons
              name="ticket-outline"
              size={width * 0.06}
              color={theme.colors.white}
              style={styles.bulletIcon}
            />
            <Text style={[styles.bulletText, {color: theme.colors.white}]}>
              Process event registrations and manage your ticket bookings.
            </Text>
          </View>
          <View style={styles.bulletContainer}>
            <Ionicons
              name="notifications-outline"
              size={width * 0.06}
              color={theme.colors.white}
              style={styles.bulletIcon}
            />
            <Text style={[styles.bulletText, {color: theme.colors.white}]}>
              Send event reminders, updates, and important notifications.
            </Text>
          </View>
          <View style={styles.bulletContainer}>
            <Ionicons
              name="star-outline"
              size={width * 0.06}
              color={theme.colors.white}
              style={styles.bulletIcon}
            />
            <Text style={[styles.bulletText, {color: theme.colors.white}]}>
              Personalize event recommendations based on your interests and
              location.
            </Text>
          </View>
          <View style={styles.bulletContainer}>
            <Ionicons
              name="shield-outline"
              size={width * 0.06}
              color={theme.colors.white}
              style={styles.bulletIcon}
            />
            <Text style={[styles.bulletText, {color: theme.colors.white}]}>
              Ensure the security of your account and event transactions.
            </Text>
          </View>

          <Text style={[styles.heading, {color: theme.colors.white}]}>
            Event Data Sharing
          </Text>
          <Text style={[styles.description, {color: theme.colors.white}]}>
            When you register for events, we may share necessary information
            with:
          </Text>
          <View style={styles.bulletContainer}>
            <Ionicons
              name="business-outline"
              size={width * 0.06}
              color={theme.colors.white}
              style={styles.bulletIcon}
            />
            <Text style={[styles.bulletText, {color: theme.colors.white}]}>
              Event organizers for attendance management and communication.
            </Text>
          </View>
          <View style={styles.bulletContainer}>
            <Ionicons
              name="card-outline"
              size={width * 0.06}
              color={theme.colors.white}
              style={styles.bulletIcon}
            />
            <Text style={[styles.bulletText, {color: theme.colors.white}]}>
              Payment processors for secure transaction handling.
            </Text>
          </View>

          <Text style={[styles.heading, {color: theme.colors.white}]}>
            Your Controls
          </Text>
          <Text style={[styles.description, {color: theme.colors.white}]}>
            You can manage your privacy preferences through:
          </Text>
          <View style={styles.bulletContainer}>
            <Ionicons
              name="settings-outline"
              size={width * 0.06}
              color={theme.colors.white}
              style={styles.bulletIcon}
            />
            <Text style={[styles.bulletText, {color: theme.colors.white}]}>
              App settings to control notifications and location services.
            </Text>
          </View>
          <View style={styles.bulletContainer}>
            <Ionicons
              name="eye-outline"
              size={width * 0.06}
              color={theme.colors.white}
              style={styles.bulletIcon}
            />
            <Text style={[styles.bulletText, {color: theme.colors.white}]}>
              Profile privacy settings to control visibility to event
              organizers.
            </Text>
          </View>

          <Text style={[styles.heading, {color: theme.colors.white}]}>
            Contact Us
          </Text>
          <Text style={[styles.description, {color: theme.colors.white}]}>
            If you have any questions about our Privacy Policy, feel free to
            contact us at:
          </Text>
          <View style={styles.contactContainer}>
            <Ionicons
              name="mail-outline"
              size={width * 0.06}
              color={theme.colors.white}
              style={styles.contactIcon}
            />
            <Text style={[styles.contactText, {color: theme.colors.white}]}>
              privacy@eventify.com
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  primaryContainer: {
    flex: 1,
  },

  headerTextContainer: {
    marginTop: height * 0.04,
    marginHorizontal: width * 0.04,
  },

  headerTitleText: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.roboto.bold,
  },

  headerDescriptionText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
  },

  contentContainer: {
    marginTop: height * 0.02,
    marginHorizontal: width * 0.04,
    paddingBottom: height * 0.05,
  },

  heading: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.roboto.semiBold,
    marginVertical: height * 0.02,
  },

  description: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
    marginBottom: height * 0.02,
    lineHeight: theme.typography.lineHeight.md,
    textAlign: 'justify',
  },

  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
    marginHorizontal: width * 0.04,
  },

  bulletIcon: {
    right: width * 0.05,
  },

  bulletText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
    lineHeight: theme.typography.lineHeight.md,
    textAlign: 'justify',
    flex: 1,
  },

  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.03,
    marginTop: height * 0.03,
  },

  contactIcon: {
    marginRight: width * 0.03,
  },

  contactText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
    lineHeight: theme.typography.lineHeight.md,
  },
});
