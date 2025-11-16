// screens/Chat.js
import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

import {theme} from '../../styles/theme';
import socketManager from '../../utils/customSocket/SocketManager';
import * as socketActions from '../../utils/customSocket/socketActions/SocketActions';
import Header from '../../utils/customComponents/customHeader/Header';
import InputField from '../../utils/customComponents/customInputField/InputField';
import Loader from '../../utils/customComponents/customLoader/Loader';

const {width} = Dimensions.get('screen');

const Chat = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {chatData, currentUserId} = route.params;

  console.log('Chat Screen - Params:', {chatData, currentUserId});

  const participantId = chatData?.participantId;
  const chatTitle = chatData?.participantName || 'Chat';
  const currentChatIdFromParams = chatData?._id || null;

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [currentChatId, setCurrentChatId] = useState(currentChatIdFromParams);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const flatListRef = useRef(null);
  const optimisticMessageIdRef = useRef(null);

  // ONLY FOR START_CHAT SUCCESS
  const handleStartChatSuccess = useCallback(response => {
    console.log('START_CHAT SUCCESS:', response);

    if (!response.success || response.event !== 'startChat') return;

    const {chatId, messages: serverMessages} = response.data || {};

    if (!chatId) {
      setIsLoading(false);
      return;
    }

    setCurrentChatId(chatId);

    if (serverMessages && serverMessages.length > 0) {
      const sorted = serverMessages.sort(
        (a, b) => new Date(a.sentAt) - new Date(b.sentAt),
      );
      setMessages(sorted);
    }

    setIsLoading(false);
  }, []);

  const handleChatHistory = useCallback(data => {
    console.log('CHAT_HISTORY:', data);
    if (data?.messages && data.messages.length > 0) {
      const sorted = data.messages.sort(
        (a, b) => new Date(a.sentAt) - new Date(b.sentAt),
      );
      setMessages(sorted);
    }
    setIsLoading(false);
  }, []);

  const handleNewMessage = useCallback(data => {
    const msg = data.message;
    if (!msg) return;

    // Prevent optimistic duplicate
    if (
      optimisticMessageIdRef.current &&
      msg._id === optimisticMessageIdRef.current
    ) {
      optimisticMessageIdRef.current = null;
      return;
    }

    setMessages(prev => [...prev, msg]);
  }, []);

  const handleError = useCallback(err => {
    console.error('SOCKET ERROR:', err);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!participantId || !currentUserId) {
      setIsLoading(false);
      return;
    }

    socketManager.userId = currentUserId;
    if (!socketManager.isConnected()) {
      socketManager.initialize();
    }
    setIsConnected(true);

    // CORRECT: Use listenToStartChatSuccess
    socketActions.listenToStartChatSuccess(handleStartChatSuccess);
    socketActions.listenToChatHistory(handleChatHistory);
    socketActions.listenToNewMessage(handleNewMessage);
    socketActions.listenToError(handleError);

    if (!currentChatIdFromParams) {
      console.log('STARTING NEW CHAT...');
      socketActions.startChat({
        userId: currentUserId,
        organizerId: participantId,
        initialMessage: 'Hello, I need help with my booking',
      });
    } else {
      console.log('FETCHING HISTORY...');
      socketActions.getChatHistory({chatId: currentChatIdFromParams});
    }

    return () => {
      socketActions.removeAllChatListeners();
      optimisticMessageIdRef.current = null;
    };
  }, [participantId, currentUserId, currentChatIdFromParams]);

  const onSendMessage = () => {
    const text = messageText.trim();
    if (!text || !currentChatId || !isConnected) return;

    const tempId = Date.now().toString();
    optimisticMessageIdRef.current = tempId;
    const tempMsg = {
      _id: tempId,
      sender: 'USER',
      text,
      sentAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempMsg]);
    socketActions.sendMessage({chatId: currentChatId, text});
    setMessageText('');
  };

  const renderMessage = ({item}) => {
    const isUser = item.sender === 'USER';
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userMessage : styles.participantMessage,
        ]}>
        <Text
          style={
            isUser ? styles.userMessageText : styles.participantMessageText
          }>
          {item.text}
        </Text>
        <Text style={[styles.messageTime, {color: isUser ? '#FFF' : '#888'}]}>
          {new Date(item.sentAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.tertiary]}
      style={styles.gradientContainer}>
      <View style={{flex: 1}}>
        <Header title={chatTitle} onPressLeft={() => navigation.goBack()} />
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {isLoading ? (
            <View style={styles.loaderContainer}>
              <Loader />
              <Text style={{marginTop: 10, color: '#fff'}}>Connecting...</Text>
            </View>
          ) : messages.length > 0 ? (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={item => item._id}
              renderItem={renderMessage}
              contentContainerStyle={styles.messagesContainer}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({animated: true})
              }
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Feather name="message-circle" size={80} color="#ccc" />
              <Text style={styles.emptyText}>
                Start your conversation with {chatTitle}
              </Text>
            </View>
          )}

          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <InputField
                value={messageText}
                onChangeText={setMessageText}
                placeholder={`Message ${chatTitle}...`}
                placeholderTextColor="#999"
                editable={isConnected}
                leftIcon={
                  <Feather
                    name="message-circle"
                    size={20}
                    color={theme.colors.primary}
                  />
                }
              />
            </View>
            <TouchableOpacity
              style={[
                styles.sendButton,
                {opacity: isConnected && messageText.trim() ? 1 : 0.5},
              ]}
              onPress={onSendMessage}
              disabled={!isConnected || !messageText.trim()}>
              <FontAwesome6 name="paper-plane" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </LinearGradient>
  );
};

export default Chat;

const styles = StyleSheet.create({
  gradientContainer: {flex: 1},
  messagesContainer: {padding: 16, paddingBottom: 80},
  messageBubble: {
    maxWidth: width * 0.75,
    padding: 12,
    borderRadius: 18,
    marginVertical: 6,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
    borderTopRightRadius: 6,
  },
  participantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderTopLeftRadius: 6,
  },
  userMessageText: {color: '#fff', fontSize: 15},
  participantMessageText: {color: '#000', fontSize: 15},
  messageTime: {fontSize: 11, marginTop: 4, alignSelf: 'flex-end'},
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {fontSize: 16, color: '#aaa', marginTop: 16, textAlign: 'center'},
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputContainer: {flex: 1, marginRight: 12},
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});
