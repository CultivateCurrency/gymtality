"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { loadQuickBloxSDK, setChatConnected, isChatConnected, getQB } from "@/lib/quickblox-client";

async function backendFetch(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });
  return res.json();
}

interface QBSession {
  token: string;
  qbUserId: number;
  appId: string;
  accountKey: string;
}

interface QBDialog {
  _id: string;
  name: string;
  type: number; // 2=group, 3=private
  occupants_ids: number[];
  last_message: string;
  last_message_date_sent: number;
  unread_messages_count: number;
  photo: string | null;
}

interface QBMessage {
  _id: string;
  chat_dialog_id: string;
  message: string;
  sender_id: number;
  date_sent: number;
  read: boolean;
}

interface ChatUser {
  id: string;
  fullName: string;
  username: string;
  profilePhoto: string | null;
  role: string;
  qbUserId: number | null;
}

export function useQuickBlox() {
  const [session, setSession] = useState<QBSession | null>(null);
  const [dialogs, setDialogs] = useState<QBDialog[]>([]);
  const [messages, setMessages] = useState<QBMessage[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDialogId, setActiveDialogId] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const activeDialogIdRef = useRef<string | null>(null);

  // Initialize QB session and XMPP connection for real-time messaging
  const initSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Register user in QB (safe to call multiple times)
      await backendFetch("/api/messages/register", { method: "POST" });

      // Get session token
      const json = await backendFetch("/api/messages/session");
      if (!json.success) throw new Error(json.error);
      const sessionData = json.data as QBSession;
      setSession(sessionData);

      // Initialize XMPP connection for real-time messaging
      if (!isChatConnected()) {
        try {
          const QB = await loadQuickBloxSDK();
          const appId = process.env.NEXT_PUBLIC_QUICKBLOX_APP_ID;

          if (appId && QB) {
            // Initialize QB with WebRTC config (safe to call multiple times)
            QB.init(Number(appId), null, null, {
              debug: { mode: 0 },
              webrtc: {
                answerTimeInterval: 30,
                disconnectTimeInterval: 10,
                statsReportTimeInterval: false,
              },
            });

            // Connect to XMPP chat for real-time message delivery + WebRTC signaling
            QB.chat.connect(
              {
                userId: sessionData.qbUserId,
                password: `qb_${sessionData.qbUserId}_gymtality`,
              },
              (connectErr: any) => {
                if (connectErr) {
                  console.error("QB chat connect error:", connectErr);
                  return;
                }

                setChatConnected(true);

                // Typing indicator listener
                QB.chat.onMessageTypingListener = (isTyping: boolean, senderQbId: number, dialogId: string) => {
                  if (dialogId === activeDialogIdRef.current) {
                    setTypingUsers(prev => ({ ...prev, [String(senderQbId)]: isTyping }));
                    if (isTyping) {
                      setTimeout(() => {
                        setTypingUsers(prev => ({ ...prev, [String(senderQbId)]: false }));
                      }, 5000);
                    }
                  }
                };

                // Real-time message listener — receives messages over XMPP when they arrive
                QB.chat.onMessageListener = (senderId: number, msg: any) => {
                  const msgDialogId = msg.extension?.dialog_id || msg.dialog_id;

                  // Only append to messages state if this is the active dialog
                  if (msgDialogId === activeDialogIdRef.current) {
                    const qbMsg: QBMessage = {
                      _id: msg.id || `temp-${Date.now()}`,
                      chat_dialog_id: msgDialogId,
                      message: msg.body,
                      sender_id: senderId,
                      date_sent: msg.timestamp || Math.floor(Date.now() / 1000),
                      read: false,
                    };
                    setMessages((prev) => {
                      // Avoid duplicates
                      if (prev.some((m) => m._id === qbMsg._id)) return prev;
                      return [...prev, qbMsg];
                    });
                  }

                  // Always update dialogs to refresh unread counts in sidebar
                  fetchDialogs();
                };
              }
            );
          }
        } catch (qbErr) {
          console.error("Failed to initialize QB XMPP:", qbErr);
        }
      }

      return sessionData;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch dialogs
  const fetchDialogs = useCallback(async () => {
    try {
      const json = await backendFetch("/api/messages/");
      if (json.success) setDialogs(json.data ?? []);
    } catch (e) {
      console.error("Failed to fetch dialogs:", e);
    }
  }, []);

  // Fetch messages for a dialog
  const fetchMessages = useCallback(async (dialogId: string) => {
    try {
      const json = await backendFetch(`/api/messages/rooms/${dialogId}/messages`);
      if (json.success) setMessages(json.data ?? []);
    } catch (e) {
      console.error("Failed to fetch messages:", e);
    }
  }, []);

  // Send a message with optimistic update
  const sendMessage = useCallback(async (dialogId: string, message: string, recipientId: number) => {
    try {
      if (!session) return false;

      // Optimistic update: add message to state immediately (instant UI feedback)
      const optimisticId = `opt-${Date.now()}`;
      const optimisticMsg: QBMessage = {
        _id: optimisticId,
        chat_dialog_id: dialogId,
        message,
        sender_id: session.qbUserId,
        date_sent: Math.floor(Date.now() / 1000),
        read: true,
      };
      setMessages((prev) => [...prev, optimisticMsg]);

      // Send via REST API
      const json = await backendFetch(`/api/messages/rooms/${dialogId}/messages`, {
        method: "POST",
        body: JSON.stringify({ message, recipientQbUserId: recipientId }),
      });

      if (json.success) {
        // On success, remove optimistic message (backend will deliver via XMPP to other users)
        // For the sender, keep the optimistic message (they already see it)
        await fetchDialogs(); // Update last message in dialogs
        return true;
      } else {
        // On error, remove the optimistic message
        setMessages((prev) => prev.filter((m) => m._id !== optimisticId));
        return false;
      }
    } catch (e) {
      console.error("Failed to send message:", e);
      // On error, remove optimistic message
      setMessages((prev) => prev.filter((m) => m._id?.toString().startsWith("opt-")));
      return false;
    }
  }, [session, fetchDialogs]);

  // Create a new 1-to-1 dialog
  const createDialog = useCallback(async (occupantQbId: number, name: string) => {
    try {
      const json = await backendFetch("/api/messages/room", {
        method: "POST",
        body: JSON.stringify({ occupants_ids: [occupantQbId], name, type: 3 }),
      });
      if (json.success) {
        await fetchDialogs();
        return json.data;
      }
      return null;
    } catch (e) {
      console.error("Failed to create dialog:", e);
      return null;
    }
  }, [fetchDialogs]);

  // Search users for new chat
  const searchUsers = useCallback(async (query: string) => {
    try {
      const json = await backendFetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (json.success) setUsers(json.data ?? []);
    } catch (e) {
      console.error("Failed to search users:", e);
    }
  }, []);

  // Select a dialog and load its messages
  const selectDialog = useCallback(async (dialogId: string) => {
    setActiveDialogId(dialogId);
    setTypingUsers({});
    await fetchMessages(dialogId);
  }, [fetchMessages]);

  // Send typing status to the other participant via XMPP
  const sendTypingIndicator = useCallback((recipientQbId: number, isTyping: boolean) => {
    const QB = getQB();
    if (!QB || !isChatConnected()) return;
    if (isTyping) {
      QB.chat.sendIsTypingStatus(recipientQbId);
    } else {
      QB.chat.sendIsStopTypingStatus(recipientQbId);
    }
  }, []);

  // Keep activeDialogIdRef in sync for use in XMPP listener closure
  useEffect(() => {
    activeDialogIdRef.current = activeDialogId;
  }, [activeDialogId]);

  // Initialize session and XMPP connection on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      const sess = await initSession();
      if (sess && mounted) {
        await fetchDialogs();
      }
    })();
    return () => { mounted = false; };
  }, [initSession, fetchDialogs]);

  // Fallback polling: refresh dialogs every 30s to update unread counts
  // Real-time message delivery via XMPP listener (replaces 5s polling for messages)
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (session && isChatConnected()) {
      pollRef.current = setInterval(() => {
        fetchDialogs(); // Update sidebar unread counts
      }, 30000); // 30s fallback sync
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [session, fetchDialogs]);

  return {
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
    fetchDialogs,
    fetchMessages,
  };
}
