"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  Send,
  Phone,
  VideoIcon,
  MoreVertical,
  Plus,
  Info,
  Loader2,
  ArrowLeft,
  MessageSquare,
  X,
} from "lucide-react";
import { useQuickBlox } from "@/hooks/use-quickblox";
import { useQuickBloxCalls } from "@/hooks/use-quickblox-calls";
import { CallOverlay } from "@/components/call-overlay";

function formatTime(epochSeconds: number): string {
  if (!epochSeconds) return "";
  const date = new Date(epochSeconds * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
}

function formatMessageTime(epochSeconds: number): string {
  if (!epochSeconds) return "";
  const date = new Date(epochSeconds * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessagesPage() {
  const {
    session,
    dialogs,
    messages,
    users,
    loading,
    error,
    activeDialogId,
    typingUsers,
    selectDialog,
    sendMessage,
    sendTypingIndicator,
    createDialog,
    searchUsers,
  } = useQuickBlox();

  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    callInfo,
    localStream,
    remoteStream,
    duration,
    isMuted,
    isVideoOff,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  } = useQuickBloxCalls(session?.token || null, session?.qbUserId || null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Search users when typing in new chat
  useEffect(() => {
    if (newChatSearch.length >= 1) {
      searchUsers(newChatSearch);
    }
  }, [newChatSearch, searchUsers]);

  const activeDialog = dialogs.find((d) => d._id === activeDialogId);

  const filteredDialogs = dialogs.filter((d) =>
    d.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleSend() {
    if (!messageText.trim() || !activeDialogId || !activeDialog || !session) return;

    setSending(true);
    // Find the other occupant in the dialog
    const recipientQbId = activeDialog.occupants_ids.find((id) => id !== session.qbUserId);
    if (recipientQbId) {
      await sendMessage(activeDialogId, messageText.trim(), recipientQbId);
    }
    setMessageText("");
    setSending(false);
  }

  async function handleStartChat(user: { id: string; fullName: string; qbUserId: number | null }) {
    if (!user.qbUserId) return;

    // Check if dialog already exists with this user
    const existing = dialogs.find(
      (d) => d.type === 3 && d.occupants_ids.includes(user.qbUserId!)
    );
    if (existing) {
      selectDialog(existing._id);
    } else {
      const dialog = await createDialog(user.qbUserId, user.fullName);
      if (dialog) {
        selectDialog(dialog._id);
      }
    }
    setShowNewChat(false);
    setNewChatSearch("");
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center h-[calc(100vh-7rem)]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
          <p className="text-zinc-400">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const isNotConfigured = error.toLowerCase().includes("not configured") || error.toLowerCase().includes("not set up");
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center h-[calc(100vh-7rem)]">
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 max-w-sm space-y-3 text-center">
          <MessageSquare className="h-8 w-8 text-orange-500 mx-auto" />
          <h3 className="font-semibold text-white">
            {isNotConfigured ? "Chat Coming Soon" : "Chat Temporarily Unavailable"}
          </h3>
          <p className="text-sm text-zinc-400">
            {isNotConfigured
              ? "Direct messaging is being set up. Check back soon!"
              : "We're having trouble connecting to chat. Please try again in a moment."}
          </p>
          {!isNotConfigured && (
            <Button
              size="sm"
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Call Overlay */}
      {callInfo.state !== "idle" && (
        <CallOverlay
          type={callInfo.type}
          state={callInfo.state}
          callerName={callInfo.callerName}
          duration={duration}
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          localStream={localStream}
          remoteStream={remoteStream}
          onAccept={acceptCall}
          onReject={rejectCall}
          onEnd={endCall}
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
        />
      )}
      <div className="flex h-[calc(100vh-7rem)] gap-0 rounded-xl overflow-hidden border border-zinc-800">
        {/* Conversation List */}
        <div className="w-80 shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col">
          {/* List Header */}
          <div className="p-4 border-b border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Messages</h2>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                onClick={() => {
                  setShowNewChat(!showNewChat);
                  setNewChatSearch("");
                }}
              >
                {showNewChat ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </Button>
            </div>

            {showNewChat ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Search users..."
                  value={newChatSearch}
                  onChange={(e) => setNewChatSearch(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-9"
                  autoFocus
                />
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-9"
                />
              </div>
            )}
          </div>

          {/* New Chat User List */}
          {showNewChat && (
            <div className="flex-1 overflow-y-auto">
              {users.length === 0 && newChatSearch.length >= 1 && (
                <div className="p-4 text-center text-zinc-500 text-sm">No users found</div>
              )}
              {newChatSearch.length < 1 && (
                <div className="p-4 text-center text-zinc-500 text-sm">Type to search users</div>
              )}
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleStartChat(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition hover:bg-zinc-800/50"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-zinc-700 text-zinc-300 text-sm">
                      {user.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-white text-sm truncate block">
                      {user.fullName}
                    </span>
                    <span className="text-xs text-zinc-500 capitalize">{user.role.toLowerCase()}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Conversations */}
          {!showNewChat && (
            <div className="flex-1 overflow-y-auto">
              {filteredDialogs.length === 0 && (
                <div className="p-6 text-center space-y-2">
                  <MessageSquare className="h-8 w-8 text-zinc-600 mx-auto" />
                  <p className="text-sm text-zinc-500">No conversations yet</p>
                  <p className="text-xs text-zinc-600">
                    Tap + to start a new chat
                  </p>
                </div>
              )}
              {filteredDialogs.map((dialog) => (
                <button
                  key={dialog._id}
                  onClick={() => selectDialog(dialog._id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                    activeDialogId === dialog._id
                      ? "bg-zinc-800"
                      : "hover:bg-zinc-800/50"
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-zinc-700 text-zinc-300 text-sm">
                        {(dialog.name || "?").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white text-sm truncate">
                        {dialog.name || "Chat"}
                      </span>
                      <span className="text-xs text-zinc-500 shrink-0">
                        {formatTime(dialog.last_message_date_sent)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate">
                      {dialog.last_message || "No messages yet"}
                    </p>
                  </div>
                  {dialog.unread_messages_count > 0 && (
                    <span className="bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shrink-0">
                      {dialog.unread_messages_count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-zinc-950">
          {activeDialog ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-zinc-900">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-zinc-700 text-zinc-300 text-sm">
                      {(activeDialog.name || "?").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-white text-sm">
                      {activeDialog.name || "Chat"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {activeDialog.type === 3 ? "Direct Message" : "Group Chat"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                    onClick={() => {
                      const recipientQbId = activeDialog.occupants_ids.find((id) => id !== session?.qbUserId);
                      if (recipientQbId) startCall(recipientQbId, "audio", activeDialog.name || "User");
                    }}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                    onClick={() => {
                      const recipientQbId = activeDialog.occupants_ids.find((id) => id !== session?.qbUserId);
                      if (recipientQbId) startCall(recipientQbId, "video", activeDialog.name || "User");
                    }}
                  >
                    <VideoIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-zinc-500 text-sm">
                      No messages yet. Say hello!
                    </p>
                  </div>
                )}
                {[...messages].reverse().map((msg) => {
                  const isMe = msg.sender_id === session?.qbUserId;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isMe
                            ? "bg-orange-500 text-white"
                            : "bg-zinc-800 text-zinc-100"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p
                          className={`text-[10px] mt-1 ${
                            isMe ? "text-orange-200" : "text-zinc-500"
                          }`}
                        >
                          {formatMessageTime(msg.date_sent)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Typing Indicator */}
              {Object.values(typingUsers).some(Boolean) && (
                <div className="px-4 pb-1 flex justify-start">
                  <div className="bg-zinc-800 rounded-2xl px-4 py-2">
                    <p className="text-xs text-zinc-400 italic">Typing...</p>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-900">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value);
                      const recipientQbId = activeDialog?.occupants_ids.find((id) => id !== session?.qbUserId);
                      if (recipientQbId && activeDialogId) {
                        sendTypingIndicator(recipientQbId, true);
                        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
                        typingTimerRef.current = setTimeout(() => {
                          sendTypingIndicator(recipientQbId, false);
                        }, 2000);
                      }
                    }}
                    className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    disabled={sending}
                  />
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={handleSend}
                    disabled={sending || !messageText.trim()}
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3">
                <MessageSquare className="h-12 w-12 text-zinc-700 mx-auto" />
                <p className="text-zinc-500">Select a conversation to start chatting</p>
                <p className="text-xs text-zinc-600">
                  Or tap + to start a new conversation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
