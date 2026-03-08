"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

/**
 * Direct Chat Interface
 * This is a simplified messaging interface used when navigating from an appointment.
 * It shows only the conversation with a specific doctor/patient without a sidebar.
 */
export default function DirectChatPage() {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [otherUserName, setOtherUserName] = useState("");
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [error, setError] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get("patientId");
  const doctorIdParam = searchParams.get("doctorId");

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (raw) {
      const userData = JSON.parse(raw);
      setUser(userData);
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (user && patientIdParam && doctorIdParam) {
      loadDirectChat(patientIdParam, doctorIdParam);
      // Poll for updates every 5 seconds
      const interval = setInterval(() => {
        loadDirectChat(patientIdParam, doctorIdParam);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user, patientIdParam, doctorIdParam]);

  const loadDirectChat = async (patientId: string, doctorId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const url = `http://localhost:4000/api/chat/${patientId}/${doctorId}`;
      console.log("Loading chat from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to load chat (Status: ${response.status})`;
        throw new Error(errorMessage);
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

      setError("");

      // Scroll to bottom
      setTimeout(() => {
        const messagesContainer = document.getElementById("messages-container");
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    } catch (err) {
      console.error("Error loading chat:", err);
      setError(err instanceof Error ? err.message : "Failed to load chat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;

    try {
      const userId = user?._id || user?.id || user?.userId;

      if (!userId) {
        alert("User not loaded");
        return;
      }

      const token = localStorage.getItem("token");

      const url = `http://localhost:4000/api/chat/${selectedChat.patientId}/${selectedChat.doctorId}/message`;
      console.log("Sending message to:", url);

      const response = await fetch(url, {
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
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to send message (Status: ${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setMessages(data.chat?.messages || []);
      setMessageInput("");

      // Scroll to bottom after sending message
      setTimeout(() => {
        const messagesContainer = document.getElementById("messages-container");
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    } catch (err) {
      console.error("Error sending message:", err);
      alert(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editingContent.trim() || !selectedChat) return;

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
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

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
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-emerald-50 to-teal-100">
        <div className="animate-pulse text-gray-600 text-sm">Loading...</div>
      </div>
    );
  }

  if (loading && messages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-emerald-50 to-teal-100">
        <div className="animate-pulse text-gray-600 text-sm">Loading chat...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-emerald-50 to-teal-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href={user.role === "patient" ? "/patient/dashboard" : "/doctor/dashboard"}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Go Back
          </Link>
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
            user.role === "patient" ? "/patient/dashboard" : "/doctor/dashboard"
          }
          className="text-white hover:opacity-80 transition-opacity text-xl"
          title="Go back"
        >
          ✕
        </Link>
      </div>

      {/* Messages Container */}
      <div
        id="messages-container"
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-600">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">Start a conversation</p>
              <p className="text-sm">
                Send a message to begin chatting with {otherUserName}
              </p>
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
                className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-md ${
                    isOwn
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-900 border border-gray-300 rounded-bl-none"
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
                      <p className="text-sm break-words">{msg.content}</p>
                      {msg.isEdited && !msg.isDeleted && (
                        <p className={`text-xs mt-1 ${
                          isOwn ? "text-blue-200" : "text-gray-400"
                        }`}>
                          (edited)
                        </p>
                      )}
                      <p
                        className={`text-xs mt-2 ${
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
      <div className="p-4 sm:p-6 bg-white border-t-2 border-gray-300 shadow-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm sm:text-base"
            disabled={!selectedChat}
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || !selectedChat}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full hover:shadow-lg transition-all font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
