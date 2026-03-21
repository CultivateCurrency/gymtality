"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize QB session
  const initSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/messages/session", { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSession(json.data);
      return json.data as QBSession;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch dialogs
  const fetchDialogs = useCallback(async (token?: string) => {
    const qbToken = token || session?.token;
    if (!qbToken) return;
    try {
      const res = await fetch("/api/messages/dialogs", {
        headers: { "x-qb-token": qbToken },
      });
      const json = await res.json();
      if (json.success) setDialogs(json.data);
    } catch (e) {
      console.error("Failed to fetch dialogs:", e);
    }
  }, [session?.token]);

  // Fetch messages for a dialog
  const fetchMessages = useCallback(async (dialogId: string, token?: string) => {
    const qbToken = token || session?.token;
    if (!qbToken) return;
    try {
      const res = await fetch(`/api/messages/chat?dialogId=${dialogId}`, {
        headers: { "x-qb-token": qbToken },
      });
      const json = await res.json();
      if (json.success) setMessages(json.data);
    } catch (e) {
      console.error("Failed to fetch messages:", e);
    }
  }, [session?.token]);

  // Send a message
  const sendMessage = useCallback(async (dialogId: string, message: string, recipientId: number) => {
    if (!session?.token) return;
    try {
      const res = await fetch("/api/messages/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-qb-token": session.token,
        },
        body: JSON.stringify({ dialogId, message, recipientId }),
      });
      const json = await res.json();
      if (json.success) {
        // Refresh messages after sending
        await fetchMessages(dialogId);
        await fetchDialogs();
      }
      return json.success;
    } catch (e) {
      console.error("Failed to send message:", e);
      return false;
    }
  }, [session?.token, fetchMessages, fetchDialogs]);

  // Create a new dialog with a user
  const createDialog = useCallback(async (occupantId: number, name: string) => {
    if (!session?.token) return null;
    try {
      const res = await fetch("/api/messages/dialogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-qb-token": session.token,
        },
        body: JSON.stringify({ occupantId, name }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchDialogs();
        return json.data;
      }
      return null;
    } catch (e) {
      console.error("Failed to create dialog:", e);
      return null;
    }
  }, [session?.token, fetchDialogs]);

  // Search users for new chat
  const searchUsers = useCallback(async (query: string) => {
    try {
      const res = await fetch(`/api/messages/users?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (json.success) setUsers(json.data);
    } catch (e) {
      console.error("Failed to search users:", e);
    }
  }, []);

  // Select a dialog
  const selectDialog = useCallback(async (dialogId: string) => {
    setActiveDialogId(dialogId);
    await fetchMessages(dialogId);
  }, [fetchMessages]);

  // Initialize on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      const sess = await initSession();
      if (sess && mounted) {
        await fetchDialogs(sess.token);
      }
    })();
    return () => { mounted = false; };
  }, [initSession, fetchDialogs]);

  // Poll for new messages every 5s when a dialog is active
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (activeDialogId && session?.token) {
      pollRef.current = setInterval(() => {
        fetchMessages(activeDialogId);
        fetchDialogs();
      }, 5000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeDialogId, session?.token, fetchMessages, fetchDialogs]);

  return {
    session,
    dialogs,
    messages,
    users,
    loading,
    error,
    activeDialogId,
    selectDialog,
    sendMessage,
    createDialog,
    searchUsers,
    fetchDialogs,
    fetchMessages,
  };
}
