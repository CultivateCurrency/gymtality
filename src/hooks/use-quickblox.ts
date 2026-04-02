"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("gymtality-auth");
    if (!raw) return null;
    return JSON.parse(raw)?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

async function backendFetch(path: string, options?: RequestInit) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize QB session — register first (idempotent), then get session token
  const initSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Register user in QB (safe to call multiple times)
      await backendFetch("/api/messages/register", { method: "POST" });

      // Get session token
      const json = await backendFetch("/api/messages/session");
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

  // Send a message
  const sendMessage = useCallback(async (dialogId: string, message: string, _recipientId: number) => {
    try {
      const json = await backendFetch(`/api/messages/rooms/${dialogId}/messages`, {
        method: "POST",
        body: JSON.stringify({ message }),
      });
      if (json.success) {
        await fetchMessages(dialogId);
        await fetchDialogs();
      }
      return json.success ?? false;
    } catch (e) {
      console.error("Failed to send message:", e);
      return false;
    }
  }, [fetchMessages, fetchDialogs]);

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
    await fetchMessages(dialogId);
  }, [fetchMessages]);

  // Initialize on mount
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

  // Poll for new messages every 5s when a dialog is active
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (activeDialogId && session) {
      pollRef.current = setInterval(() => {
        fetchMessages(activeDialogId);
        fetchDialogs();
      }, 5000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeDialogId, session, fetchMessages, fetchDialogs]);

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
