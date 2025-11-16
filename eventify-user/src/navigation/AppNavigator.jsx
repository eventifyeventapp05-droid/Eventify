import React, {useState} from 'react';
import {StatusBar} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {theme} from '../styles/theme';

// Shared Screens
import Splash from '../screens/shared/Splash';

// Auth Screens
import Signin from '../screens/auth/Signin';
import Signup from '../screens/auth/Signup';

// Bottom Navigator
import BottomNavigator from './bottomNavigator/BottomNavigator';

// Profile & Legal Screens
import Account from '../screens/profileModule/profileSubScreens/Account';
import PrivacyPolicy from '../screens/profileModule/profileSubScreens/PrivacyPolicy';
import TermsAndConditions from '../screens/profileModule/profileSubScreens/AppUsage';
import AllEvents from '../screens/dashboard/allEvents/AllEvents';
import AllCategories from '../screens/dashboard/allCategories/AllCategories';
import CategoryEvents from '../screens/dashboard/categoryEvents/CategoryEvents';
import EventDetails from '../screens/eventModule/EventDetails';
import TicketBooking from '../screens/ticketBooking/TicketBooking';
import MyBookings from '../screens/profileModule/profileSubScreens/MyBookings';
import CreateEvent from '../screens/eventModule/CreateEvent';
import ChatList from '../screens/chatModule/ChatList';
import Chat from '../screens/chatModule/Chat';
import OrganizersDetails from '../screens/organizers/OrganizersDetails';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [statusBarColor, setStatusBarColor] = useState(theme.colors.primary);

  return (
    <>
      <StatusBar backgroundColor={statusBarColor} barStyle="light-content" />
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName="Splash">
        {/* Shared Routes */}
        <Stack.Screen name="Splash">
          {props => <Splash {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        {/* Auth Routes */}
        <Stack.Screen name="Signin">
          {props => <Signin {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        <Stack.Screen name="Signup">
          {props => <Signup {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        {/* Dashboard Routes */}
        <Stack.Screen name="Main">
          {props => (
            <BottomNavigator {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="All_Events">
          {props => (
            <AllEvents {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Event_Details">
          {props => (
            <EventDetails {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="All_Categories">
          {props => (
            <AllCategories {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Category_Events">
          {props => (
            <CategoryEvents {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Create_Event">
          {props => (
            <CreateEvent {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Buy_Ticket">
          {props => (
            <TicketBooking {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* Legal & Info Screens */}
        <Stack.Screen name="My_Account">
          {props => (
            <Account {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Privacy_Policy">
          {props => (
            <PrivacyPolicy {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="App_Usage">
          {props => (
            <TermsAndConditions
              {...props}
              setStatusBarColor={setStatusBarColor}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="My_Bookings">
          {props => (
            <MyBookings {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Chat_List">
          {props => (
            <ChatList {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Chat">
          {props => <Chat {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

         <Stack.Screen name="Organizer_Details">
          {props => <OrganizersDetails {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>
      </Stack.Navigator>
    </>
  );
};

export default AppNavigator;
