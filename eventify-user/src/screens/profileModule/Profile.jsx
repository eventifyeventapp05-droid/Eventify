import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  StatusBar,
  View,
  Dimensions,
  ScrollView,
  Text,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {theme} from '../../styles/theme';
import Header from '../../utils/customComponents/customHeader/Header';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {deleteAccount, getUser} from '../../redux/slices/userSlice';
import ProfileHeaderCard from '../../utils/customComponents/customCards/profileScreenCards/ProfileHeaderCard';
import ProfileScreenCard from '../../utils/customComponents/customCards/profileScreenCards/ProfileCard';
import LogoutModal from '../../utils/customModals/LogoutModal';
import DeleteAccountModal from '../../utils/customModals/DeleteAccountModal';
import Toast from 'react-native-toast-message';

const {width, height} = Dimensions.get('screen');

const Profile = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const loading = useSelector(state => state.user.loading);
  const user = useSelector(state => state.auth.user);
  const userProfile = useSelector(state => state.user.user);
  const profilePicture = useSelector(state => state.user.user?.profilePicture);
  const name = useSelector(state => state.user.user?.userName);
  const phone = useSelector(state => state.user.user?.phone);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const statusBarColor = theme.colors.primary;
    StatusBar.setBackgroundColor(statusBarColor);
  }, []);

  const handleProfileNavigate = () => {
    navigation.navigate('My_Account', {
      user: userProfile,
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      if (user && user.id) {
        dispatch(getUser(user.id));
      }
    }, [user]),
  );

  const handleLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const handleDeleteAccountModal = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteAccount = async () => {
    try {
      console.log('[handleDeleteAccount] Initiating deletion');

      const result = await dispatch(deleteAccount(user.id)).unwrap();
      console.log('[handleDeleteAccount] Deletion result:', result);

      setShowDeleteModal(false);

      setTimeout(() => {
        Toast.show({
          type: 'success',
          text1: 'Account Deleted',
          text2: result.message || 'Your account has been removed',
        });
        navigation.reset({
          index: 0,
          routes: [{name: 'Signin'}],
        });
      }, 500);
    } catch (error) {
      console.error('[handleDeleteAccount] Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Deletion Failed',
        text2: error.includes('Network Error')
          ? 'Network connection failed'
          : error || 'Could not delete account',
      });
    }
  };

  const handleChatNavigate = () => {
    console.log('Navigating to Chat with userId:', user?.id);
    navigation.navigate('Chat', {
      userId: user?.id,
    });
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.tertiary]}
      style={styles.container}>
      <View style={styles.headerContainer}>
        <Header title="Profile" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileInfoContainer}>
          <ProfileHeaderCard
            image={profilePicture}
            name={name}
            phone={phone}
            btnTitle="Logout"
            onPress={handleLogoutModal}
          />
        </View>

        <View style={styles.profileCards}>
          <View style={styles.accountContainer}>
            <ProfileScreenCard
              title="My Account"
              iconName="person"
              iconColor={theme.colors.white}
              rightIcon="chevron-forward"
              onPressFunction={handleProfileNavigate}
            />
          </View>

          <View style={styles.privacyPolicyContainer}>
            <ProfileScreenCard
              title="Privacy Policy"
              iconName="shield"
              iconColor={theme.colors.white}
              rightIcon="chevron-forward"
              onPressFunction={() => navigation.navigate('Privacy_Policy')}
            />
          </View>

          <View style={styles.termsConditionContainer}>
            <ProfileScreenCard
              title="Terms & Conditions"
              iconName="briefcase"
              iconColor={theme.colors.white}
              rightIcon="chevron-forward"
              onPressFunction={() => navigation.navigate('App_Usage')}
            />
          </View>

          <View style={styles.bookingContainer}>
            <ProfileScreenCard
              title="My Bookings"
              iconName="clipboard"
              iconColor={theme.colors.white}
              rightIcon="chevron-forward"
              onPressFunction={() => navigation.navigate('My_Bookings')}
            />
          </View>

          <View style={styles.chatListContainer}>
            <ProfileScreenCard
              title="Chat Lists"
              iconName="chatbubble-ellipses"
              iconColor={theme.colors.white}
              rightIcon="chevron-forward"
              onPressFunction={() => navigation.navigate('Chat_List')}
            />
          </View>

          <View style={styles.deleteProfileContainer}>
            <ProfileScreenCard
              title="Delete My Profile"
              iconName="trash"
              iconColor={theme.colors.error}
              rightIcon="chevron-forward"
              onPressFunction={handleDeleteAccountModal}
            />
          </View>
        </View>
      </ScrollView>

      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Logout!"
        description="Are Your Sure You Want To Logout ?"
      />

      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDeleteConfirm={handleDeleteAccount}
        loading={loading}
        title="Delete Account"
        description="This will permanently erase all your data. This cannot be undone."
      />
    </LinearGradient>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerContainer: {
    marginBottom: height * 0.015,
    paddingBottom: height * 0.01,
  },

  scrollContent: {
    paddingBottom: height * 0.1,
  },

  sectionHeaderContainer: {
    paddingHorizontal: width * 0.04,
    paddingBottom: height * 0.02,
  },

  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.roboto.semiBold,
    color: theme.colors.tertiary,
  },

  headerDescription: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
    color: theme.colors.gray,
  },

  profileCards: {
    marginTop: height * 0.034,
    marginHorizontal: width * 0.04,
    gap: theme.gap(1),
  },
});
