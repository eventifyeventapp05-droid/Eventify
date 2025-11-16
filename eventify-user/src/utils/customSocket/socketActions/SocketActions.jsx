import socketManager from '../SocketManager';
import {CHAT_EVENTS} from '../socketEvents/SocketEvents';

// ======================
// Events to EMIT (send)
// ======================

export const startChat = data => {
  socketManager.emit(CHAT_EVENTS.START_CHAT, data);
};

export const sendMessage = data => {
  socketManager.emit(CHAT_EVENTS.SEND_MESSAGE, data);
};

export const getChatHistory = data => {
  socketManager.emit(CHAT_EVENTS.GET_CHAT_HISTORY, data);
};

export const getAllChats = () => {
  socketManager.emit(CHAT_EVENTS.GET_ALL_CHATS);
};

export const deleteChat = data => {
  socketManager.emit(CHAT_EVENTS.DELETE_CHAT, data);
};

// ======================
// Events to LISTEN (receive)
// ======================

let startChatSuccessCallback = null;
let newChatCallback = null;
let newMessageCallback = null;
let chatHistoryCallback = null;
let allChatsListCallback = null;
let chatDeletedCallback = null;
let errorCallback = null;
let successCallback = null;

// LISTEN TO START_CHAT SUCCESS ONLY
export const listenToStartChatSuccess = callback => {
  startChatSuccessCallback = callback;
  socketManager.on(CHAT_EVENTS.SUCCESS, response => {
    if (response.event === CHAT_EVENTS.START_CHAT) {
      callback(response);
    }
  });
};

// Listen for new chat notifications (organizer)
export const listenToNewChat = callback => {
  newChatCallback = callback;
  socketManager.on(CHAT_EVENTS.NEW_CHAT, callback);
};

// Listen for new messages
export const listenToNewMessage = callback => {
  newMessageCallback = callback;
  socketManager.on(CHAT_EVENTS.NEW_MESSAGE, callback);
};

// Listen for chat history responses
export const listenToChatHistory = callback => {
  chatHistoryCallback = callback;
  socketManager.on(CHAT_EVENTS.CHAT_HISTORY, callback);
};

// Listen for all chats list (organizer)
export const listenToAllChatsList = callback => {
  allChatsListCallback = callback;
  socketManager.on(CHAT_EVENTS.ALL_CHATS_LIST, callback);
};

// Listen for chat deleted notifications
export const listenToChatDeleted = callback => {
  chatDeletedCallback = callback;
  socketManager.on(CHAT_EVENTS.CHAT_DELETED, callback);
};

// Listen for generic success responses (if needed)
export const listenToSuccess = callback => {
  successCallback = callback;
  socketManager.on(CHAT_EVENTS.SUCCESS, callback);
};

// Listen for error responses from server
export const listenToError = callback => {
  errorCallback = callback;
  socketManager.on(CHAT_EVENTS.ERROR, callback);
};

// ======================
// Clean up (to remove listeners)
// ======================

export const removeStartChatSuccessListener = () => {
  if (startChatSuccessCallback) {
    socketManager.off(CHAT_EVENTS.SUCCESS, startChatSuccessCallback);
    startChatSuccessCallback = null;
  }
};

export const removeNewChatListener = () => {
  if (newChatCallback) {
    socketManager.off(CHAT_EVENTS.NEW_CHAT, newChatCallback);
    newChatCallback = null;
  }
};

export const removeNewMessageListener = () => {
  if (newMessageCallback) {
    socketManager.off(CHAT_EVENTS.NEW_MESSAGE, newMessageCallback);
    newMessageCallback = null;
  }
};

export const removeChatHistoryListener = () => {
  if (chatHistoryCallback) {
    socketManager.off(CHAT_EVENTS.CHAT_HISTORY, chatHistoryCallback);
    chatHistoryCallback = null;
  }
};

export const removeAllChatsListListener = () => {
  if (allChatsListCallback) {
    socketManager.off(CHAT_EVENTS.ALL_CHATS_LIST, allChatsListCallback);
    allChatsListCallback = null;
  }
};

export const removeChatDeletedListener = () => {
  if (chatDeletedCallback) {
    socketManager.off(CHAT_EVENTS.CHAT_DELETED, chatDeletedCallback);
    chatDeletedCallback = null;
  }
};

export const removeErrorListener = () => {
  if (errorCallback) {
    socketManager.off(CHAT_EVENTS.ERROR, errorCallback);
    errorCallback = null;
  }
};

export const removeSuccessListener = () => {
  if (successCallback) {
    socketManager.off(CHAT_EVENTS.SUCCESS, successCallback);
    successCallback = null;
  }
};

export const removeAllChatListeners = () => {
  removeStartChatSuccessListener();
  removeNewChatListener();
  removeNewMessageListener();
  removeChatHistoryListener();
  removeAllChatsListListener();
  removeChatDeletedListener();
  removeErrorListener();
  removeSuccessListener();
};

// ======================
// Utility functions for common operations
// ======================

export const startNewChat = (userId, organizerId, initialMessage = '') => {
  return startChat({
    userId,
    organizerId,
    initialMessage:
      initialMessage || "Hello! I'd like to inquire about your events.",
  });
};

export const sendChatMessage = (chatId, text) => {
  return sendMessage({chatId, text});
};

export const fetchChatHistory = chatId => {
  return getChatHistory({chatId});
};

export const deleteChatById = chatId => {
  return deleteChat({chatId});
};

export const setupChatListeners = callbacks => {
  const {
    onStartChatSuccess,
    onNewChat,
    onNewMessage,
    onChatHistory,
    onAllChatsList,
    onChatDeleted,
    onError,
    onSuccess,
  } = callbacks;

  if (onStartChatSuccess) listenToStartChatSuccess(onStartChatSuccess);
  if (onNewChat) listenToNewChat(onNewChat);
  if (onNewMessage) listenToNewMessage(onNewMessage);
  if (onChatHistory) listenToChatHistory(onChatHistory);
  if (onAllChatsList) listenToAllChatsList(onAllChatsList);
  if (onChatDeleted) listenToChatDeleted(onChatDeleted);
  if (onError) listenToError(onError);
  if (onSuccess) listenToSuccess(onSuccess);
};
