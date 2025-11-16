/**
 * @fileoverview Controller module for managing chat between users and organizers.
 * @module controllers/chatController
 */

const mongoose = require("mongoose");
const User = require("../../models/user-model/user.model");
const Organizer = require("../../models/organizer-model/organizer.model");
const Chat = require("../../models/chat-model/chat.model");

const CHAT_EVENTS = {
  // Client to Server events
  START_CHAT: "start_chat",
  SEND_MESSAGE: "send_message",
  GET_CHAT_HISTORY: "get_chat_history",
  GET_ALL_CHATS: "get_all_chats",
  DELETE_CHAT: "delete_chat",

  // Server to Client events
  NEW_CHAT: "new_chat",
  NEW_MESSAGE: "new_message",
  CHAT_HISTORY: "chat_history",
  ALL_CHATS_LIST: "all_chats_list",
  CHAT_DELETED: "chat_deleted",
  ERROR: "chat_error",
  SUCCESS: "chat_success",
};

/**
 * Send standardized error response
 */
const sendError = (socket, event, message, details = null) => {
  const errorResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
  };
  socket.emit(CHAT_EVENTS.ERROR, { event, ...errorResponse });
  console.error(`Chat Error [${event}]:`, message, details);
  return errorResponse;
};

/**
 * Send standardized success response
 */
const sendSuccess = (socket, event, message, data = null) => {
  const successResponse = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
    ...(data && { data }),
  };
  socket.emit(CHAT_EVENTS.SUCCESS, { event, ...successResponse });
  return successResponse;
};

/**
 * @description Initialize chat socket listeners
 * @param {import("socket.io").Server} io - Socket.io server instance
 */
exports.initializeChatSocket = (io) => {
  console.log("Initializing chat socket handlers...");

  io.on("connection", (socket) => {
    console.log(
      `Chat socket connected for user: ${socket.user.id}, role: ${socket.user.role}`
    );

    /**
    

    /**
     * @description Start new chat
     */
    socket.on(CHAT_EVENTS.START_CHAT, async (data) => {
      try {
        console.log("START_CHAT received:", {
          data,
          socketUser: socket.user,
          socketId: socket.id,
        });

        const { userId, organizerId, initialMessage } = data;

        // Validate input
        if (!userId || !organizerId) {
          return sendError(
            socket,
            CHAT_EVENTS.START_CHAT,
            "User ID and Organizer ID are required"
          );
        }

        // Authorization check
        if (socket.user.id !== userId) {
          return sendError(
            socket,
            CHAT_EVENTS.START_CHAT,
            "You can only start chats for your own account"
          );
        }

        if (socket.user.role !== "USER") {
          return sendError(
            socket,
            CHAT_EVENTS.START_CHAT,
            "Only regular users can start chats with organizers"
          );
        }

        // Validate MongoDB IDs
        if (
          !mongoose.Types.ObjectId.isValid(userId) ||
          !mongoose.Types.ObjectId.isValid(organizerId)
        ) {
          return sendError(
            socket,
            CHAT_EVENTS.START_CHAT,
            "Invalid user or organizer ID format"
          );
        }

        // Check if organizer exists
        const organizer = await Organizer.findById(organizerId);
        if (!organizer) {
          return sendError(
            socket,
            CHAT_EVENTS.START_CHAT,
            "Organizer not found"
          );
        }

        // Check for existing active chat
        let existingChat = await Chat.findOne({
          user: userId,
          organizer: organizerId,
          isActive: true,
        })
          .populate("user", "userName email profileImage")
          .populate("organizer", "organizerName email profileImage");

        if (existingChat) {
          console.log("Existing chat found:", existingChat._id);

          // Join the existing chat room
          socket.join(`chat_${existingChat._id}`);

          return sendSuccess(
            socket,
            CHAT_EVENTS.START_CHAT,
            "Existing chat found",
            {
              chatId: existingChat._id,
              messages: existingChat.messages,
              participants: {
                user: existingChat.user,
                organizer: existingChat.organizer,
              },
              isNew: false,
            }
          );
        }

        // Create new chat
        const newChat = new Chat({
          user: userId,
          organizer: organizerId,
          messages: [
            {
              sender: "USER",
              text:
                initialMessage ||
                "Hello! I'd like to inquire about your events.",
              sentAt: new Date(),
            },
          ],
          isActive: true,
        });

        await newChat.save();

        // Populate the chat with user/organizer details
        const populatedChat = await Chat.findById(newChat._id)
          .populate("user", "userName email profileImage")
          .populate("organizer", "organizerName email profileImage");

        console.log("New chat created:", populatedChat._id);

        // Join the new chat room
        socket.join(`chat_${populatedChat._id}`);

        // Send success to user
        sendSuccess(
          socket,
          CHAT_EVENTS.START_CHAT,
          "Chat started successfully",
          {
            chatId: populatedChat._id,
            messages: populatedChat.messages,
            participants: {
              user: populatedChat.user,
              organizer: populatedChat.organizer,
            },
            isNew: true,
          }
        );

        // Notify organizer about new chat
        io.to(organizerId).emit(CHAT_EVENTS.NEW_CHAT, {
          chatId: populatedChat._id,
          user: populatedChat.user,
          initialMessage: populatedChat.messages[0],
          timestamp: new Date().toISOString(),
        });

        console.log(
          `Chat started successfully for user: ${userId} with organizer: ${organizerId}`
        );
      } catch (error) {
        console.error("START_CHAT error:", error);
        sendError(
          socket,
          CHAT_EVENTS.START_CHAT,
          "Failed to start chat",
          error.message
        );
      }
    });

    /**
     * @description Send message in chat
     */
    socket.on(CHAT_EVENTS.SEND_MESSAGE, async (data) => {
      try {
        const { chatId, text } = data;
        const senderType =
          socket.user.role === "ORGANIZER" ? "ORGANIZER" : "USER";

        console.log("SEND_MESSAGE received:", {
          chatId,
          text,
          senderType,
          userId: socket.user.id,
        });

        // Validate input
        if (!chatId || !text?.trim()) {
          return sendError(
            socket,
            CHAT_EVENTS.SEND_MESSAGE,
            "Chat ID and message text are required"
          );
        }

        if (!mongoose.Types.ObjectId.isValid(chatId)) {
          return sendError(
            socket,
            CHAT_EVENTS.SEND_MESSAGE,
            "Invalid chat ID format"
          );
        }

        // Find chat
        const chat = await Chat.findById(chatId);
        if (!chat) {
          return sendError(socket, CHAT_EVENTS.SEND_MESSAGE, "Chat not found");
        }

        // Authorization check
        if (
          (senderType === "USER" && socket.user.id !== chat.user.toString()) ||
          (senderType === "ORGANIZER" &&
            socket.user.id !== chat.organizer.toString())
        ) {
          return sendError(
            socket,
            CHAT_EVENTS.SEND_MESSAGE,
            "Unauthorized to send message in this chat"
          );
        }

        // Create and save message
        const newMessage = {
          sender: senderType,
          text: text.trim(),
          sentAt: new Date(),
        };

        chat.messages.push(newMessage);
        chat.lastActivity = new Date();
        chat.isActive = true;
        await chat.save();

        // Send success to sender
        sendSuccess(
          socket,
          CHAT_EVENTS.SEND_MESSAGE,
          "Message sent successfully",
          {
            chatId: chat._id,
            message: newMessage,
          }
        );

        // Determine recipient and broadcast message
        const recipientId =
          senderType === "USER"
            ? chat.organizer.toString()
            : chat.user.toString();

        // Broadcast to chat room and recipient's personal room
        io.to(`chat_${chatId}`).emit(CHAT_EVENTS.NEW_MESSAGE, {
          chatId: chat._id,
          message: newMessage,
          senderInfo: {
            id: socket.user.id,
            role: socket.user.role,
          },
        });

        // Also send to recipient's personal room for notifications
        io.to(recipientId).emit(CHAT_EVENTS.NEW_MESSAGE, {
          chatId: chat._id,
          message: newMessage,
          senderInfo: {
            id: socket.user.id,
            role: socket.user.role,
          },
        });

        console.log(
          `Message sent in chat ${chatId} by ${senderType} ${socket.user.id}`
        );
      } catch (error) {
        console.error("SEND_MESSAGE error:", error);
        sendError(
          socket,
          CHAT_EVENTS.SEND_MESSAGE,
          "Failed to send message",
          error.message
        );
      }
    });

    /**
     * @description Get chat history
     */
    socket.on(CHAT_EVENTS.GET_CHAT_HISTORY, async (data) => {
      try {
        const { chatId } = data;

        if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
          return sendError(
            socket,
            CHAT_EVENTS.GET_CHAT_HISTORY,
            "Valid chat ID is required"
          );
        }

        const chat = await Chat.findById(chatId)
          .populate("user", "userName email profileImage")
          .populate("organizer", "organizerName email profileImage");

        if (!chat) {
          return sendError(
            socket,
            CHAT_EVENTS.GET_CHAT_HISTORY,
            "Chat not found"
          );
        }

        // Authorization check
        if (
          socket.user.id !== chat.user._id.toString() &&
          socket.user.id !== chat.organizer._id.toString()
        ) {
          return sendError(
            socket,
            CHAT_EVENTS.GET_CHAT_HISTORY,
            "Unauthorized to view this chat"
          );
        }

        // Join the chat room
        socket.join(`chat_${chatId}`);

        // Send chat history
        socket.emit(CHAT_EVENTS.CHAT_HISTORY, {
          success: true,
          chatId: chat._id,
          user: chat.user,
          organizer: chat.organizer,
          messages: chat.messages,
          isActive: chat.isActive,
          lastActivity: chat.lastActivity,
        });

        console.log(
          `Chat history sent for chat ${chatId} to user ${socket.user.id}`
        );
      } catch (error) {
        console.error("GET_CHAT_HISTORY error:", error);
        sendError(
          socket,
          CHAT_EVENTS.GET_CHAT_HISTORY,
          "Failed to get chat history",
          error.message
        );
      }
    });

    /**
     * @description Get all chats for organizer
     */
    socket.on(CHAT_EVENTS.GET_ALL_CHATS, async () => {
      try {
        if (socket.user.role !== "ORGANIZER") {
          return sendError(
            socket,
            CHAT_EVENTS.GET_ALL_CHATS,
            "Only organizers can view all chats"
          );
        }

        const chats = await Chat.find({
          organizer: socket.user.id,
          isActive: true,
        })
          .sort({ lastActivity: -1, updatedAt: -1 })
          .populate("user", "userName email profileImage")
          .populate("organizer", "organizerName email profileImage");

        socket.emit(CHAT_EVENTS.ALL_CHATS_LIST, {
          success: true,
          chats: chats,
          total: chats.length,
        });

        console.log(
          `Sent ${chats.length} chats to organizer ${socket.user.id}`
        );
      } catch (error) {
        console.error("GET_ALL_CHATS error:", error);
        sendError(
          socket,
          CHAT_EVENTS.GET_ALL_CHATS,
          "Failed to fetch chats",
          error.message
        );
      }
    });

    /**
     * @description Delete chat
     */
    socket.on(CHAT_EVENTS.DELETE_CHAT, async (data) => {
      try {
        const { chatId } = data;

        if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
          return sendError(
            socket,
            CHAT_EVENTS.DELETE_CHAT,
            "Valid chat ID is required"
          );
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
          return sendError(socket, CHAT_EVENTS.DELETE_CHAT, "Chat not found");
        }

        // Only organizer can delete chats
        if (
          socket.user.role !== "ORGANIZER" ||
          socket.user.id !== chat.organizer.toString()
        ) {
          return sendError(
            socket,
            CHAT_EVENTS.DELETE_CHAT,
            "Only the organizer of this chat can delete it"
          );
        }

        const participants = {
          userId: chat.user.toString(),
          organizerId: chat.organizer.toString(),
        };

        // Soft delete by setting isActive to false
        chat.isActive = false;
        chat.lastActivity = new Date();
        await chat.save();

        sendSuccess(
          socket,
          CHAT_EVENTS.DELETE_CHAT,
          "Chat deleted successfully",
          {
            chatId: chat._id,
            deletedAt: new Date(),
          }
        );

        // Notify both participants
        io.to(participants.userId).emit(CHAT_EVENTS.CHAT_DELETED, {
          chatId: chat._id,
          deletedAt: new Date(),
        });

        io.to(participants.organizerId).emit(CHAT_EVENTS.CHAT_DELETED, {
          chatId: chat._id,
          deletedAt: new Date(),
        });

        console.log(`Chat ${chatId} deleted by organizer ${socket.user.id}`);
      } catch (error) {
        console.error("DELETE_CHAT error:", error);
        sendError(
          socket,
          CHAT_EVENTS.DELETE_CHAT,
          "Failed to delete chat",
          error.message
        );
      }
    });

    /**
     * @description Handle disconnection
     */
    socket.on("disconnect", (reason) => {
      console.log(
        `Chat socket disconnected - User: ${socket.user?.id}, Reason: ${reason}, Socket ID: ${socket.id}`
      );
    });

    /**
     * @description Handle errors
     */
    socket.on("error", (error) => {
      console.error(`Chat socket error for user ${socket.user?.id}:`, error);
    });
  });

  console.log("Chat socket handlers initialized successfully");
};
