import React, {useEffect, useRef} from 'react';
import {Image, StyleSheet, Dimensions, Animated} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import {theme} from '../../styles/theme';

import Home from '../../screens/dashboard/Main';
import Profile from '../../screens/profileModule/Profile';
import AllEvents from '../../screens/dashboard/allEvents/AllEvents';
import CreateEvent from '../../screens/eventModule/CreateEvent';
import OrganizersScreen from '../../screens/organizers/Organizers';

const Tab = createBottomTabNavigator();
const {width, height} = Dimensions.get('screen');

const AnimatedTabIcon = ({focused, source}) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.2 : 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={[styles.iconWrapper, {transform: [{scale}]}]}>
      {focused && (
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.iconGlow}
          start={{x: 0.2, y: 0.2}}
          end={{x: 0.8, y: 0.8}}
        />
      )}
      <Image
        source={source}
        style={[
          styles.icon,
          {tintColor: focused ? theme.colors.white : theme.colors.gray},
        ]}
      />
    </Animated.View>
  );
};

const BottomNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.colors.white,
        tabBarInactiveTintColor: theme.colors.gray,
        tabBarStyle: [
          styles.tabBar,
          {backgroundColor: theme.colors.primary, ...theme.elevation.depth3},
        ],
      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({focused}) => (
            <AnimatedTabIcon
              focused={focused}
              source={
                focused
                  ? require('../../assets/navigatorIcons/home-filled.png')
                  : require('../../assets/navigatorIcons/home.png')
              }
            />
          ),
        }}
      />

      <Tab.Screen
        name="Explore"
        component={AllEvents}
        options={{
          tabBarIcon: ({focused}) => (
            <AnimatedTabIcon
              focused={focused}
              source={
                focused
                  ? require('../../assets/navigatorIcons/explore-filled.png')
                  : require('../../assets/navigatorIcons/explore.png')
              }
            />
          ),
        }}
      />

      <Tab.Screen
        name="CreateEvent"
        component={CreateEvent}
        options={{
          tabBarIcon: ({focused}) => (
            <AnimatedTabIcon
              focused={focused}
              source={
                focused
                  ? require('../../assets/navigatorIcons/event-filled.png')
                  : require('../../assets/navigatorIcons/event.png')
              }
            />
          ),
        }}
      />

      <Tab.Screen
        name="Organizers"
        component={OrganizersScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <AnimatedTabIcon
              focused={focused}
              source={
                focused
                  ? require('../../assets/navigatorIcons/event-filled.png')
                  : require('../../assets/navigatorIcons/event.png')
              }
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({focused}) => (
            <AnimatedTabIcon
              focused={focused}
              source={
                focused
                  ? require('../../assets/navigatorIcons/profile-filled.png')
                  : require('../../assets/navigatorIcons/profile.png')
              }
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomNavigator;

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: width * 0.04,
    right: width * 0.04,
    height: height * 0.085,
    paddingTop: height * 0.02,
    borderTopWidth: 0,
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
  },

  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  icon: {
    width: width * 0.07,
    height: height * 0.04,
    resizeMode: 'contain',
    zIndex: 10,
  },

  iconGlow: {
    position: 'absolute',
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: theme.borderRadius.circle,
    opacity: 0.35,
    zIndex: 1,
  },
});
