import { useEffect, useState, useCallback } from "react";
import { useSocket } from "../Socket.utility";

export const useChatEvents = () => {
  const socket = useSocket();

  // State
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);

  // Generic emit with response helper
  const emitWithResponse = useCallback(
    (event, payload, successEvent, timeout = 10000) => {
      return new Promise((resolve, reject) => {
        if (!socket.connected) {
          reject(new Error("Socket not connected"));
          return;
        }

        console.log(`📤 Emitting ${event}:`, payload);
        socket.emit(event, payload);

        const handleSuccess = (res) => {
          console.log(`✅ ${successEvent} received:`, res);
          clearTimeout(timeoutId);
          socket.off("error", handleError);
          resolve(res);
        };

        const handleError = (err) => {
          console.error(`❌ Error for ${event}:`, err);
          clearTimeout(timeoutId);
          socket.off(successEvent, handleSuccess);
          reject(err);
        };

        const handleTimeout = () => {
          console.warn(`⏰ Timeout for ${event}`);
          socket.off(successEvent, handleSuccess);
          socket.off("error", handleError);
          reject(new Error("Request timeout"));
        };

        const timeoutId = setTimeout(handleTimeout, timeout);

        socket.once(successEvent, handleSuccess);
        socket.once("error", handleError);
      });
    },
    [socket]
  );

  // -------------------------
  // Chat Operations
  // -------------------------

  /** Get all chats for admin/super-admin */
  const getAllChats = useCallback(async () => {
    try {
      const res = await emitWithResponse("getAllChats", {}, "allChatsList");

      if (res && Array.isArray(res)) {
        setChats(res);
      } else if (res?.chats) {
        setChats(res.chats);
      }

      return res;
    } catch (error) {
      console.error("Failed to fetch all chats:", error);
      throw error;
    }
  }, [emitWithResponse]);

  /** Start new chat */
  const startChat = useCallback(
    async (userId, organizerId, initialMessage) => {
      try {
        const res = await emitWithResponse(
          "startChat",
          { userId, organizerId, initialMessage },
          "success"
        );

        // Update chats list
        const chatData = res?.data;
        if (chatData) {
          setChats((prev) => {
            const exists = prev.some((c) => c._id === chatData.chatId);
            return exists
              ? prev.map((c) =>
                  c._id === chatData.chatId ? { ...c, ...chatData } : c
                )
              : [{ _id: chatData.chatId, ...chatData }, ...prev];
          });
          setCurrentChat(chatData);
          setMessages(chatData.messages || []);
        }

        return res;
      } catch (error) {
        console.error("Failed to start chat:", error);
        throw error;
      }
    },
    [emitWithResponse]
  );

  /** Send a message in current chat */
  const sendMessage = useCallback(
    async (chatId, text) => {
      try {
        const res = await emitWithResponse(
          "sendMessage",
          { chatId, text },
          "success"
        );

        const messageData = res?.data?.message;
        if (messageData && currentChat?._id === chatId) {
          setMessages((prev) => [...prev, messageData]);
        }

        return res;
      } catch (error) {
        console.error("Failed to send message:", error);
        throw error;
      }
    },
    [emitWithResponse, currentChat]
  );

  /** Get chat history */
  const getChatHistory = useCallback(
    async (chatId) => {
      try {
        const res = await emitWithResponse(
          "getChatHistory",
          { chatId },
          "chatHistory"
        );

        if (res) {
          setCurrentChat({ _id: chatId, ...res });
          setMessages(res.messages || []);
        }

        return res;
      } catch (error) {
        console.error("Failed to get chat history:", error);
        throw error;
      }
    },
    [emitWithResponse]
  );

  /** Delete chat */
  const deleteChat = useCallback(
    async (chatId) => {
      try {
        const res = await emitWithResponse("deleteChat", { chatId }, "success");

        setChats((prev) => prev.filter((c) => c._id !== chatId));
        if (currentChat?._id === chatId) {
          setCurrentChat(null);
          setMessages([]);
        }

        return res;
      } catch (error) {
        console.error("Failed to delete chat:", error);
        throw error;
      }
    },
    [emitWithResponse, currentChat]
  );

  // -------------------------
  // Real-time Event Listeners
  // -------------------------
  useEffect(() => {
    if (!socket) return;

    console.log("🎧 Setting up chat event listeners...");

    const handleNewChat = (data) => {
      console.log("🆕 New chat received:", data);
      if (data) {
        setChats((prev) => {
          const exists = prev.some((c) => c._id === data.chatId);
          return exists
            ? prev.map((c) => (c._id === data.chatId ? { ...c, ...data } : c))
            : [{ _id: data.chatId, ...data }, ...prev];
        });
      }
    };

    const handleNewMessage = (data) => {
      console.log("📥 New message received:", data);
      if (data?.chatId === currentChat?._id && data?.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    const handleChatDeleted = (data) => {
      console.log("🗑️ Chat deleted event received:", data);
      const chatId = data?.chatId;
      if (chatId) {
        setChats((prev) => prev.filter((c) => c._id !== chatId));
        if (currentChat?._id === chatId) {
          setCurrentChat(null);
          setMessages([]);
        }
      }
    };

    const handleAllChatsList = (chats) => {
      console.log("📋 All chats list received:", chats);
      if (Array.isArray(chats)) {
        setChats(chats);
      }
    };

    // Register listeners
    socket.on("newChat", handleNewChat);
    socket.on("newMessage", handleNewMessage);
    socket.on("chatDeleted", handleChatDeleted);
    socket.on("allChatsList", handleAllChatsList);

    socket.on("connect", () => console.log("✅ Socket connected for chats"));
    socket.on("disconnect", (reason) =>
      console.warn("❌ Socket disconnected:", reason)
    );
    socket.on("connect_error", (err) =>
      console.error("⚠️ Socket connection error:", err.message)
    );

    return () => {
      console.log("🧹 Cleaning up chat event listeners...");
      socket.off("newChat", handleNewChat);
      socket.off("newMessage", handleNewMessage);
      socket.off("chatDeleted", handleChatDeleted);
      socket.off("allChatsList", handleAllChatsList);
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, [socket, currentChat]);

  return {
    // State
    chats,
    currentChat,
    messages,

    // Functions
    getAllChats,
    startChat,
    sendMessage,
    getChatHistory,
    deleteChat,

    // State setters
    setCurrentChat,
    setMessages,
    setChats,
  };
};
