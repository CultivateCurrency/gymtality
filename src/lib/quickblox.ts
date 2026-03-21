import crypto from "crypto";

// QuickBlox REST API helpers (server-side only)
// Docs: https://docs.quickblox.com/reference

const QB_API = "https://api.quickblox.com";

function getConfig() {
  const appId = process.env.QUICKBLOX_APP_ID;
  const authKey = process.env.QUICKBLOX_AUTH_KEY;
  const authSecret = process.env.QUICKBLOX_AUTH_SECRET;
  if (!appId || !authKey || !authSecret) {
    throw new Error("QuickBlox credentials not configured");
  }
  return { appId, authKey, authSecret };
}

// Generate QB signature for session creation
function generateSignature(params: Record<string, string | number>, authSecret: string): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHmac("sha1", authSecret).update(sorted).digest("hex");
}

// Create an application session (no user)
export async function createAppSession(): Promise<string> {
  const { appId, authKey, authSecret } = getConfig();
  const nonce = Math.floor(Math.random() * 1e9);
  const timestamp = Math.floor(Date.now() / 1000);

  const params: Record<string, string | number> = {
    application_id: appId,
    auth_key: authKey,
    nonce,
    timestamp,
  };
  const signature = generateSignature(params, authSecret);

  const res = await fetch(`${QB_API}/session.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ application_id: appId, auth_key: authKey, nonce, timestamp, signature }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`QB session error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.session.token;
}

// Create a user session (login)
export async function createUserSession(login: string, password: string): Promise<{ token: string; userId: number }> {
  const { appId, authKey, authSecret } = getConfig();
  const nonce = Math.floor(Math.random() * 1e9);
  const timestamp = Math.floor(Date.now() / 1000);

  const params: Record<string, string | number> = {
    application_id: appId,
    auth_key: authKey,
    nonce,
    timestamp,
    "user[login]": login,
    "user[password]": password,
  };
  const signature = generateSignature(params, authSecret);

  const res = await fetch(`${QB_API}/session.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      application_id: appId,
      auth_key: authKey,
      nonce,
      timestamp,
      signature,
      user: { login, password },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`QB user session error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return { token: data.session.token, userId: data.session.user_id };
}

// Create a QuickBlox user
export async function createQBUser(
  appToken: string,
  login: string,
  password: string,
  fullName: string
): Promise<number> {
  const res = await fetch(`${QB_API}/users.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "QB-Token": appToken,
    },
    body: JSON.stringify({
      user: { login, password, full_name: fullName },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`QB create user error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.user.id;
}

// Get QB user by login
export async function getQBUser(appToken: string, login: string): Promise<{ id: number; full_name: string } | null> {
  const res = await fetch(`${QB_API}/users/by_login.json?login=${encodeURIComponent(login)}`, {
    headers: { "QB-Token": appToken },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`QB get user error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return { id: data.user.id, full_name: data.user.full_name };
}

// Create a 1:1 dialog
export async function createDialog(
  userToken: string,
  occupantId: number,
  name: string
): Promise<{ _id: string; occupants_ids: number[] }> {
  const res = await fetch(`${QB_API}/chat/Dialog.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "QB-Token": userToken,
    },
    body: JSON.stringify({
      type: 3, // 1:1 private dialog
      occupants_ids: occupantId.toString(),
      name,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`QB create dialog error: ${res.status} ${text}`);
  }

  return res.json();
}

// List dialogs for user
export async function listDialogs(userToken: string): Promise<any[]> {
  const res = await fetch(`${QB_API}/chat/Dialog.json`, {
    headers: { "QB-Token": userToken },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`QB list dialogs error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.items || [];
}

// List messages in a dialog
export async function listMessages(
  userToken: string,
  dialogId: string,
  limit = 50
): Promise<any[]> {
  const res = await fetch(
    `${QB_API}/chat/Message.json?chat_dialog_id=${dialogId}&sort_desc=date_sent&limit=${limit}`,
    { headers: { "QB-Token": userToken } }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`QB list messages error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.items || [];
}

// Send a message via REST (for push/offline delivery)
export async function sendMessage(
  userToken: string,
  dialogId: string,
  message: string,
  recipientId: number
): Promise<any> {
  const res = await fetch(`${QB_API}/chat/Message.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "QB-Token": userToken,
    },
    body: JSON.stringify({
      chat_dialog_id: dialogId,
      message,
      recipient_id: recipientId,
      send_to_chat: 1,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`QB send message error: ${res.status} ${text}`);
  }

  return res.json();
}
