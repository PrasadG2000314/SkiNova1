"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ChatPage() {
  const [user, setUser] = useState<any>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [directChatMode, setDirectChatMode] = useState(false);
  const [otherUserName, setOtherUserName] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isPerformingAction, setIsPerformingAction] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get("patientId");
  const doctorIdParam = searchParams.get("doctorId");

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem("user")
        : null;

    if (raw) {
      const userData = JSON.parse(raw);
      setUser(userData);
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      // If we have direct chat parameters, load that chat directly
      if (patientIdParam && doctorIdParam) {
        setDirectChatMode(true);
        loadDirectChat(patientIdParam, doctorIdParam);
        // Set up polling for new messages (every 5 seconds) - but ONLY if no action is being performed
        const interval = setInterval(() => {
          if (!isPerformingAction) {
            loadDirectChat(patientIdParam, doctorIdParam);
          }
        }, 5000);
        return () => clearInterval(interval);
      } else {
        // Otherwise, load all chats
        fetchAllChats();
        const interval = setInterval(fetchAllChats, 3000);
        return () => clearInterval(interval);
      }
    }
  }, [user, patientIdParam, doctorIdParam, isPerformingAction]);

  const loadDirectChat = async (patientId: string, doctorId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:4000/api/chat/${patientId}/${doctorId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load chat");
      }

      const data = await response.json();
      const chat = data.chat;
      
      setSelectedChat(chat);
      setMessages(chat.messages || []);

      // Set the other user's name
      if (user.role === "patient") {
        setOtherUserName(chat.doctorName || "Doctor");
      } else {
        setOtherUserName(chat.patientName || "Patient");
      }

      // Scroll to bottom
      setTimeout(() => {
        const messagesContainer = document.getElementById("messages-container");
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    } catch (err) {
      console.error("Error loading chat:", err);
      alert("Failed to load chat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllChats = async () => {
    try {
      const userId = user?._id || user?.id || user?.userId;
      if (!userId) return;

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:4000/api/chat/user/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }

      const data = await response.json();
      setChats(data.chats || []);
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };

  const handleSelectChat = async (chat: any) => {
    setSelectedChat(chat);
    setMessages(chat.messages || []);

    // Set the other user's name
    if (user.role === "patient") {
      setOtherUserName(chat.doctorName || "Doctor");
    } else {
      setOtherUserName(chat.patientName || "Patient");
    }

    // Scroll to bottom when chat is selected
    setTimeout(() => {
      const messagesContainer =
        document.getElementById("messages-container");
      if (messagesContainer) {
        messagesContainer.scrollTop =
          messagesContainer.scrollHeight;
      }
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;

    try {
      const userId = user?._id || user?.id || user?.userId;

      const otherUserId =
        user?.role === "patient"
          ? selectedChat.doctorId
          : selectedChat.patientId;

      if (!userId || !otherUserId) {
        alert("Chat info not loaded");
        return;
      }

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:4000/api/chat/${selectedChat.patientId}/${selectedChat.doctorId}/message`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderId: userId,
            senderName: user.name,
            senderRole: user.role,
            content: messageInput,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      setMessages(data.chat?.messages || []);
      setMessageInput("");

      // Scroll to bottom after sending message
      setTimeout(() => {
        const messagesContainer =
          document.getElementById("messages-container");
        if (messagesContainer) {
          messagesContainer.scrollTop =
            messagesContainer.scrollHeight;
        }
      }, 100);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to send message"
      );
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editingContent.trim() || !selectedChat) return;

    setIsPerformingAction(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:4000/api/chat/${selectedChat.patientId}/${selectedChat.doctorId}/message/${messageId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: editingContent,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to edit message");
      }

      const data = await response.json();
      setMessages(data.chat?.messages || []);
      setEditingMessageId(null);
      setEditingContent("");
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to edit message"
      );
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    setIsPerformingAction(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:4000/api/chat/${selectedChat.patientId}/${selectedChat.doctorId}/message/${messageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete message");
      }

      const data = await response.json();
      setMessages(data.chat?.messages || []);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete message"
      );
    } finally {
      setIsPerformingAction(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-emerald-50 to-teal-100">
        <div className="animate-pulse text-gray-600 text-sm">
          Loading...
        </div>
      </div>
    );
  }

  // Direct chat mode - simplified interface
  if (directChatMode) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-emerald-50 to-teal-100">
          <div className="animate-pulse text-gray-600 text-sm">
            Loading chat...
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-sky-100 via-emerald-50 to-teal-100 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 sm:p-3 shadow-lg flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold">Chat with {otherUserName}</h1>
            <p className="text-xs text-blue-100 mt-0.5">{user.name}</p>
          </div>
          <Link
            href={
              user.role === "patient"
                ? "/patient/dashboard"
                : "/doctor/dashboard"
            }
            className="text-white hover:opacity-80 transition-opacity text-xl"
          >
            ✕
          </Link>
        </div>

        {/* Messages Container */}
        <div
          id="messages-container"
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-br from-sky-50 to-emerald-50"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-lg font-semibold mb-2">Start a conversation</p>
                <p className="text-sm">Send a message to begin chatting with {otherUserName}</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isOwn =
                msg.senderId === user._id ||
                msg.senderId === user.id ||
                msg.senderId === user.userId;

              return (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    isOwn ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-md ${
                      isOwn
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
                    }`}
                  >
                    {editingMessageId === msg._id?.toString() ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingContent}
                          onChange={(e) =>
                            setEditingContent(e.target.value)
                          }
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-gray-900 text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() =>
                            handleEditMessage(msg._id?.toString() || "")
                          }
                          className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingMessageId(null);
                            setEditingContent("");
                          }}
                          className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm break-words">
                          {msg.content}
                        </p>
                        {msg.isEdited && !msg.isDeleted && (
                          <p className={`text-xs mt-1 ${
                            isOwn ? "text-blue-200" : "text-gray-400"
                          }`}>
                            (edited)
                          </p>
                        )}
                        <p
                          className={`text-xs mt-1 ${
                            isOwn ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </>
                    )}
                  </div>
                  {isOwn && !msg.isDeleted && (
                    <div className="flex gap-2 mt-1">
                      {editingMessageId !== msg._id?.toString() && (
                        <>
                          <button
                            onClick={() => {
                              setEditingMessageId(msg._id?.toString() || null);
                              setEditingContent(msg.content);
                            }}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors whitespace-nowrap shadow-sm font-semibold"
                            title="Edit message"
                          >
                            ✎ Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteMessage(msg._id?.toString() || "")
                            }
                            className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors whitespace-nowrap shadow-sm font-semibold"
                            title="Delete message"
                          >
                            🗑 Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 sm:p-6 bg-white border-t border-gray-200 shadow-lg">
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && handleSendMessage()
              }
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
            />
            <button
              onClick={handleSendMessage}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full hover:shadow-lg transition-all font-semibold text-sm sm:text-base"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Regular chat list mode
  return (
    <div className="min-h-screen pt-16 bg-gray-100 flex">
      {/* Sidebar - Chat List */}
      <div className="w-full sm:w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              Messages
            </h1>
            <Link
              href={
                user.role === "patient"
                  ? "/patient/dashboard"
                  : "/doctor/dashboard"
              }
              className="text-white hover:opacity-80 transition-opacity"
            >
              ✕
            </Link>
          </div>
          <p className="text-sm text-blue-100 mt-1">
            {user.name}
          </p>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p className="text-center">No chats yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {chats.map((chat) => {
                const otherName =
                  user.role === "patient"
                    ? chat.doctorName
                    : chat.patientName;

                const lastMessage =
                  chat.messages?.[
                    chat.messages.length - 1
                  ];

                const isSelected =
                  selectedChat?._id === chat._id;

                return (
                  <button
                    key={chat._id}
                    onClick={() =>
                      handleSelectChat(chat)
                    }
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      isSelected
                        ? "bg-blue-50 border-l-4 border-blue-600"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">
                        {otherName}
                      </p>
                      {lastMessage && (
                        <p className="text-xs text-gray-500">
                          {new Date(
                            lastMessage.timestamp
                          ).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute:
                                "2-digit",
                            }
                          )}
                        </p>
                      )}
                    </div>

                    {lastMessage && (
                      <p className="text-sm text-gray-600 truncate">
                        {lastMessage.senderId ===
                          user._id ||
                        lastMessage.senderId ===
                          user.id ||
                        lastMessage.senderId ===
                          user.userId
                          ? "You: "
                          : ""}
                        {lastMessage.content}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="hidden sm:flex flex-1 flex-col bg-white h-screen">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {user.role === "patient"
                    ? selectedChat.doctorName
                    : selectedChat.patientName}
                </h2>
                <p className="text-sm text-blue-100">
                  Online
                </p>
              </div>
            </div>

            {/* Messages */}
            <div
              id="messages-container"
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p className="text-center">
                    No messages yet. Start a
                    conversation!
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isOwn =
                    msg.senderId === user._id ||
                    msg.senderId === user.id ||
                    msg.senderId ===
                      user.userId;

                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${
                        isOwn
                          ? "items-end"
                          : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwn
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
                        }`}
                      >
                        {editingMessageId === msg._id?.toString() ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editingContent}
                              onChange={(e) =>
                                setEditingContent(e.target.value)
                              }
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-gray-900 text-sm"
                              autoFocus
                            />
                            <button
                              onClick={() =>
                                handleEditMessage(msg._id?.toString() || "")
                              }
                              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingMessageId(null);
                                setEditingContent("");
                              }}
                              className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm break-words">
                              {msg.content}
                            </p>
                            {msg.isEdited && !msg.isDeleted && (
                              <p className={`text-xs mt-1 ${
                                isOwn ? "text-blue-200" : "text-gray-400"
                              }`}>
                                (edited)
                              </p>
                            )}
                            <p
                              className={`text-xs mt-1 ${
                                isOwn
                                  ? "text-blue-100"
                                  : "text-gray-500"
                              }`}
                            >
                              {new Date(
                                msg.timestamp
                              ).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute:
                                    "2-digit",
                                }
                              )}
                            </p>
                          </>
                        )}
                      </div>
                      {isOwn && !msg.isDeleted && (
                        <div className="flex gap-2 mt-1">
                          {editingMessageId !== msg._id?.toString() && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingMessageId(msg._id?.toString() || null);
                                  setEditingContent(msg.content);
                                }}
                                className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors whitespace-nowrap shadow-sm font-semibold"
                                title="Edit message"
                              >
                                ✎ Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteMessage(msg._id?.toString() || "")
                                }
                                className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors whitespace-nowrap shadow-sm font-semibold"
                                title="Delete message"
                              >
                                🗑 Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) =>
                    setMessageInput(
                      e.target.value
                    )
                  }
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    handleSendMessage()
                  }
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  onClick={
                    handleSendMessage
                  }
                  className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-semibold"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-center text-lg">
              Select a chat to start
              messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 

