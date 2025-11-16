import { useEffect, useState, useRef } from "react";
import "../../../styles/global.styles.css";
import "./Chats.css";
import Modal from "../../../utilities/Modal/Modal.utlity";
import InputField from "../../../utilities/InputField/InputField.utility";
import Loader from "../../../utilities/Loader/Loader.utility";
import { toast } from "react-hot-toast";
import { useChatEvents } from "../../../utilities/Socket/ChatEvents/Chat.events.utility";

const Chats = () => {
  const {
    chats,
    getAllChats,
    deleteChat,
    getChatHistory,
    messages,
    deleteMessage,
    setMessages,
    setCurrentChat,
    sendMessage,
  } = useChatEvents();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [loadingAction, setLoadingAction] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
  const [isDeleteMessageModalOpen, setIsDeleteMessageModalOpen] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef(null);

  // Fetch all chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        await getAllChats();
      } catch (err) {
        toast.error("Failed to fetch chats");
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, [getAllChats]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  /**
   * Handle chat deletion
   */
  const handleDeleteChat = async (chatId) => {
    setLoadingAction(`delete-${chatId}`);
    try {
      await deleteChat(chatId);
      toast.success("Chat deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete chat");
    } finally {
      setLoadingAction(null);
      setIsDeleteModalOpen(false);
    }
  };

  /**
   * Handle viewing chat messages
   */
  const handleViewMessages = async (chat) => {
    try {
      setMessages([]);
      setSelectedChat(chat);
      setCurrentChat(chat);
      setMessagesLoading(true);
      setIsMessagesModalOpen(true);
      await getChatHistory(chat._id);
    } catch (err) {
      toast.error("Failed to load messages");
    } finally {
      setMessagesLoading(false);
    }
  };

  /**
   * Handle sending a message
   */
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    try {
      await sendMessage(selectedChat._id, newMessage.trim());
      setNewMessage("");
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  /**
   * Handle deleting a message
   */
  const handleDeleteMessage = async () => {
    if (!selectedMessage || !selectedChat) return;

    setLoadingAction(`delete-message-${selectedMessage._id}`);
    try {
      await deleteMessage(
        selectedChat._id,
        selectedMessage._id,
        "Admin moderation"
      );
      toast.success("Message deleted successfully");
      setIsDeleteMessageModalOpen(false);
      setSelectedMessage(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete message");
    } finally {
      setLoadingAction(null);
    }
  };

  /**
   * Open delete message modal
   */
  const openDeleteMessageModal = (message) => {
    setSelectedMessage(message);
    setIsDeleteMessageModalOpen(true);
  };

  /**
   * Reset all modals
   */
  const resetModals = () => {
    setIsDeleteModalOpen(false);
    setIsMessagesModalOpen(false);
    setIsDeleteMessageModalOpen(false);
    setSelectedChat(null);
    setSelectedMessage(null);
    setLoadingAction(null);
    setNewMessage("");
  };

  /**
   * Format relative time for display
   */
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        if (diffInMinutes < 1) return "Just now";
        return `${diffInMinutes}m ago`;
      }
      return `${Math.floor(diffInHours)}h ago`;
    }

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Format date for messages with proper validation
   */
  const formatMessageTime = (message) => {
    let dateToFormat = null;

    if (message.sentAt) {
      try {
        const date = new Date(message.sentAt);
        if (!isNaN(date.getTime())) {
          dateToFormat = date;
        }
      } catch (e) {
        console.warn("Invalid date format in message.sentAt", e);
      }
    }

    if (!dateToFormat && message._id) {
      try {
        if (typeof message._id === "string" && message._id.length >= 8) {
          const timestamp = parseInt(message._id.substring(0, 8), 16);
          const date = new Date(timestamp * 1000);
          if (!isNaN(date.getTime())) {
            dateToFormat = date;
          }
        }
      } catch (e) {
        console.warn("Failed to extract date from message._id", e);
      }
    }

    if (dateToFormat) {
      return formatRelativeTime(dateToFormat);
    }

    return "Time Unknown";
  };

  /**
   * Get chat status badge
   */
  const getStatusBadge = (chat) => {
    const isActive = chat.isActive !== false;
    
    return (
      <span className={`status ${isActive ? "status-active" : "status-inactive"}`}>
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  /**
   * Get participant names for display
   */
  const getParticipantNames = (chat) => {
    if (chat.user && chat.organizer) {
      return `User: ${chat.user.userName || "Unknown"} | Organizer: ${chat.organizer.userName || "Unknown"}`;
    }
    return "No participants info";
  };

  // Filter chats by search
  const filteredChats = chats.filter((chat) =>
    chat._id?.toLowerCase().includes(search.toLowerCase()) ||
    (chat.user?.userName && chat.user.userName.toLowerCase().includes(search.toLowerCase())) ||
    (chat.organizer?.userName && chat.organizer.userName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <section id="manage-chats">
      <div className="chats-container">
        <h2 className="chats-title">Manage Chats ({chats.length})</h2>
        
        <div className="chats-header">
          <InputField
            placeholder="Search by chat ID, user, or organizer"
            type="text"
            editable
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<i className="fas fa-search"></i>}
            textColor="#000"
            width={300}
          />
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="loader-container">
              <Loader />
            </div>
          ) : filteredChats.length > 0 ? (
            <table className="chats-table">
              <thead>
                <tr>
                  <th>Chat ID</th>
                  <th>Participants</th>
                  <th>Status</th>
                  <th>Messages</th>
                  <th>Created</th>
                  <th>Last Activity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredChats.map((chat) => (
                  <tr key={chat._id}>
                    <td className="chat-id-cell">#{chat._id?.slice(-8)}</td>
                    <td className="participants-cell">
                      <div className="participants-info">
                        <div className="participants-names">
                          {getParticipantNames(chat)}
                        </div>
                      </div>
                    </td>
                    <td>{getStatusBadge(chat)}</td>
                    <td className="messages-cell">
                      <span className="messages-count">
                        {chat.messages?.length || 0}
                      </span>
                    </td>
                    <td>
                      {chat.createdAt ? new Date(chat.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td>
                      {chat.updatedAt ? formatRelativeTime(new Date(chat.updatedAt)) : "N/A"}
                    </td>
                    <td className="actions">
                      <button
                        className="action-btn messages-btn"
                        onClick={() => handleViewMessages(chat)}
                        title="View Messages"
                        disabled={messagesLoading}
                      >
                        <i className="fas fa-comments"></i>
                      </button>

                      <button
                        className="action-btn delete-btn"
                        onClick={() => {
                          setSelectedChat(chat);
                          setIsDeleteModalOpen(true);
                        }}
                        disabled={loadingAction === `delete-${chat._id}`}
                        title="Delete Chat"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-chats-found">
              <div className="empty-content">
                <i className="fas fa-comments"></i>
                <p>No Chats Found</p>
                {search && (
                  <p className="search-hint">Try adjusting your search terms</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Delete Chat Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={resetModals}
          title="Delete Chat"
          loading={loadingAction?.startsWith("delete-")}
          buttons={[
            {
              label: "Cancel",
              className: "btn-secondary",
              onClick: resetModals,
            },
            {
              label: "Delete Chat",
              className: "danger-btn",
              onClick: () => handleDeleteChat(selectedChat?._id),
              loading: loadingAction === `delete-${selectedChat?._id}`,
            },
          ]}
        >
          <p>
            Are you sure you want to delete chat{" "}
            <strong>#{selectedChat?._id?.slice(-8)}</strong>?
          </p>
          <p className="warning-text">
            This action cannot be undone. All chat messages will be permanently deleted.
          </p>
          {selectedChat && (
            <div className="chat-details">
              <p>
                <strong>Chat ID:</strong> #{selectedChat._id?.slice(-8)}
              </p>
              <p>
                <strong>Participants:</strong> {getParticipantNames(selectedChat)}
              </p>
              <p>
                <strong>Total Messages:</strong> {selectedChat.messages?.length || 0}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {selectedChat.createdAt ? new Date(selectedChat.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          )}
        </Modal>

        {/* Messages Modal */}
        <Modal
          isOpen={isMessagesModalOpen}
          onClose={resetModals}
          title={`Chat #${selectedChat?._id?.slice(-8)} - Messages (${messages.length})`}
          size="large"
        >
          <div className="messages-modal-content">
            <div className="messages-container-enhanced">
              {messagesLoading ? (
                <div className="loader-container">
                  <Loader />
                </div>
              ) : messages.length === 0 ? (
                <div className="no-messages-found">
                  <i className="fas fa-comment-slash"></i>
                  <p>No messages found in this chat</p>
                </div>
              ) : (
                <div className="messages-scrollable">
                  {messages.map((message) => (
                    <div 
                      key={message._id} 
                      className={`message-bubble ${message.sender === "USER" ? "user-message" : "organizer-message"}`}
                    >
                      <div className="message-avatar">
                        {message.sender?.profilePicture ? (
                          <img
                            src={message.sender.profilePicture}
                            alt={`${message.sender.userName || "User"}'s profile`}
                            className="avatar-image"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "block";
                            }}
                          />
                        ) : null}
                        <i
                          className={`fas ${message.sender === "USER" ? "fa-user" : "fa-user-tie"} avatar-fallback`}
                          style={{
                            display: message.sender?.profilePicture
                              ? "none"
                              : "block",
                          }}
                        ></i>
                      </div>
                      <div className="message-content-enhanced">
                        <div className="message-header-enhanced">
                          <div className="message-user-info">
                            <strong className="message-username">
                              {message.sender === "USER" 
                                ? (selectedChat?.user?.userName || "User")
                                : (selectedChat?.organizer?.userName || "Organizer")
                              }
                            </strong>
                            <span className="message-time-enhanced">
                              {formatMessageTime(message)}
                            </span>
                          </div>
                          {!message.isDeleted && (
                            <button
                              className="action-btn delete-btn small"
                              onClick={() => openDeleteMessageModal(message)}
                              title="Delete Message"
                              disabled={loadingAction?.startsWith("delete-message-")}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </div>
                        <div className="message-text-enhanced">
                          {message.isDeleted ? (
                            <div className="deleted-message">
                              <i className="fas fa-ban"></i>
                              <span>
                                This message was deleted
                                {message.deleteReason && `: ${message.deleteReason}`}
                              </span>
                            </div>
                          ) : (
                            message.text
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Reply Box */}
            <div className="reply-box">
              <input
                type="text"
                placeholder="Type your message as admin..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
              />
              <button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </Modal>

        {/* Delete Message Modal */}
        <Modal
          isOpen={isDeleteMessageModalOpen}
          onClose={resetModals}
          title="Delete Message"
          loading={loadingAction?.startsWith("delete-message-")}
          buttons={[
            {
              label: "Cancel",
              className: "btn-secondary",
              onClick: resetModals,
            },
            {
              label: "Delete Message",
              className: "danger-btn",
              onClick: handleDeleteMessage,
              loading: loadingAction === `delete-message-${selectedMessage?._id}`,
            },
          ]}
        >
          <p>
            Are you sure you want to delete this message from{" "}
            <strong>
              {selectedMessage?.sender === "USER" 
                ? (selectedChat?.user?.userName || "User")
                : (selectedChat?.organizer?.userName || "Organizer")
              }
            </strong>
            ?
          </p>
          <div className="message-preview">
            <strong>Message:</strong>
            <p>"{selectedMessage?.text}"</p>
          </div>
          <p className="warning-text">
            This action cannot be undone and the message will be permanently removed from the chat.
          </p>
        </Modal>
      </div>
    </section>
  );
};

export default Chats;