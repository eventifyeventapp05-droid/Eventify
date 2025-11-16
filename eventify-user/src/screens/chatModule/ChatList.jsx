import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  // Added useCallback
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import {useSelector} from 'react-redux';

import {theme} from '../../styles/theme';
import {globalStyles} from '../../styles/globalStyles';
import Header from '../../utils/customComponents/customHeader/Header';
import Loader from '../../utils/customComponents/customLoader/Loader';

import socketManager from '../../utils/customSocket/SocketManager';
import * as socketActions from '../../utils/customSocket/socketActions/SocketActions';

const {width, height} = Dimensions.get('screen');

const ChatList = () => {
  const navigation = useNavigation();

  // Get user ID from Redux
  const currentUserId = useSelector(state => state.auth.user?.id);

  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // -----------------------
  // HANDLERS (using useCallback for performance)
  // -----------------------
  const handleChatDeleted = useCallback(data => {
    console.log('🗑 Chat deleted:', data);
    setChats(prev => prev.filter(chat => chat._id !== data.chatId));
  }, []);

  const handleNewChat = useCallback(() => {
    console.log('🔄 New chat detected – refreshing all chats...');
    // Re-fetch all chats to update the list, ensuring we don't rely on fragmented message data
    socketActions.getAllChats();
  }, []);

  const handleChatsList = useCallback(
    data => {
      console.log('📥 Received ALL_CHATS_LIST:', data);
      setIsLoading(false); // Stop loading once data is received

      if (data?.chats) {
        // Ensure currentUserId is available before mapping
        if (!currentUserId) {
          console.error(
            'handleChatsList received data but currentUserId is missing.',
          );
          return;
        }

        const stringifiedCurrentUserId = String(currentUserId);

        const mappedChats = data.chats.map(chat => {
          // Robustly get the last message
          const lastMessage = chat.messages?.[chat.messages.length - 1] || null;

          let participantName = 'Unknown Participant'; // Safe default
          let participantId = null;

          // Robust ID extraction: Prioritize populated object's _id
          const chatUserId = String(
            chat.user._id || chat.user.$oid || chat.user,
          );
          const organizerId = String(
            chat.organizer._id || chat.organizer.$oid || chat.organizer,
          );

          if (chatUserId === stringifiedCurrentUserId) {
            // Current user is the 'user', display the 'organizer'
            participantName = chat.organizer?.userName || 'Organizer';
            participantId = organizerId;
          } else if (organizerId === stringifiedCurrentUserId) {
            // Current user is the 'organizer', display the 'user'
            participantName = chat.user?.userName || 'User';
            participantId = chatUserId;
          }

          return {
            // Ensure consistent key for FlatList
            _id: chat._id.$oid || chat._id,
            participantName,
            participantId,
            lastMessage: lastMessage
              ? {
                  text: lastMessage.text,
                  sentAt: lastMessage.sentAt.$date || lastMessage.sentAt,
                }
              : null,
          };
        });

        console.log('📌 Setting chats:', mappedChats.length);
        setChats(mappedChats);
      } else {
        console.log('❌ No "chats" field received or data is incomplete.');
        setChats([]);
      }

      // Start fade animation after data processing
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    },
    [currentUserId, fadeAnim], // Dependencies for useCallback
  );

  // -----------------------
  // LIFECYCLE / SOCKET INITIALIZATION
  // -----------------------
  useEffect(() => {
    if (!currentUserId) {
      console.log('🛑 Waiting for currentUserId from Redux...');
      return;
    }

    // --- FIX: SET userId on socketManager ---
    socketManager.userId = currentUserId;
    console.log('✅ Socket Manager User ID set to:', currentUserId);
    // ----------------------------------------

    console.log('🔌 Checking socket connection…', socketManager.isConnected());

    if (!socketManager.isConnected()) {
      console.log('⚡ Initializing socket…');
      socketManager.initialize();
    }

    console.log('👂 Adding listeners…');
    socketActions.listenToAllChatsList(handleChatsList);
    socketActions.listenToChatDeleted(handleChatDeleted);
    socketActions.listenToNewChat(handleNewChat);

    // Initial fetch of chats
    console.log('📩 Emitting GET_ALL_CHATS…');
    socketActions.getAllChats();

    return () => {
      console.log('🧹 Removing listeners…');
      socketActions.removeAllChatsListListener();
      socketActions.removeChatDeletedListener();
      socketActions.removeNewChatListener();
    };
  }, [currentUserId, handleChatsList, handleChatDeleted, handleNewChat]);
  // Added handlers to dependencies since they are defined outside this effect

  // -----------------------
  // OPEN CHAT
  // -----------------------
  const openChat = chat => {
    console.log('➡ Opening chat:', chat);
    // Pass the entire chat item object and the current user's ID
    navigation.navigate('Chat', {
      chatData: chat,
      currentUserId: currentUserId,
    });
  };

  // -----------------------
  // RENDER CHAT ITEM
  // -----------------------
  const renderChatItem = ({item}) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => openChat(item)}>
      <View style={styles.iconWrapper}>
        <FontAwesome6
          name="user"
          size={width * 0.07}
          color={theme.colors.dark}
        />
      </View>

      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.participantName}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage?.text || 'No messages yet'}
        </Text>
      </View>

      <Text style={styles.timeText}>
        {item.lastMessage?.sentAt
          ? new Date(item.lastMessage.sentAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : ''}
      </Text>
    </TouchableOpacity>
  );

  // -----------------------
  // COMPONENT UI
  // -----------------------
  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.tertiary]}
      style={styles.gradientContainer}>
      <View style={globalStyles.container}>
        <Header title="My Chats" onPressLeft={() => navigation.goBack()} />

        {/* Display Loader if still fetching user ID or chat data */}
        {isLoading || !currentUserId ? (
          <View style={styles.loaderContainer}>
            <Loader />
          </View>
        ) : chats.length > 0 ? (
          <Animated.View style={{flex: 1, opacity: fadeAnim}}>
            <FlatList
              data={chats}
              keyExtractor={item => item._id}
              renderItem={renderChatItem}
              contentContainerStyle={{padding: height * 0.02}}
            />
          </Animated.View>
        ) : (
          <View style={styles.emptyContainer}>
            <Feather
              name="message-circle"
              size={width * 0.2}
              color={theme.colors.white}
            />
            <Text style={styles.emptyText}>No chats found</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

export default ChatList;

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },

  chatItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: height * 0.02,
    borderRadius: theme.borderRadius.medium,
    marginBottom: height * 0.02,
    alignItems: 'center',
  },

  iconWrapper: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width * 0.04,
    elevation: 4,
  },

  chatInfo: {
    flex: 1,
  },

  chatName: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.roboto.semiBold,
    color: theme.colors.dark,
  },

  lastMessage: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
    color: theme.colors.gray,
    marginTop: 2,
  },

  timeText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.roboto.regular,
    color: theme.colors.gray,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.roboto.semiBold,
    color: theme.colors.white,
    marginTop: 10,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
