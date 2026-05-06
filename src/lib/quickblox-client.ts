// Shared QuickBlox SDK loader and connection state
// Both useQuickBlox (chat) and useQuickBloxCalls (WebRTC) use this to prevent double-loading the SDK
// and to coordinate XMPP connection between the two hooks

let qbSDK: any = null;
let chatConnected = false;

/**
 * Load QuickBlox SDK from CDN (idempotent — safe to call multiple times)
 * Returns the QB global instance
 */
export async function loadQuickBloxSDK(): Promise<any> {
  if (qbSDK) return qbSDK;

  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject("SSR — no window");
    if ((window as any).QB) {
      qbSDK = (window as any).QB;
      return resolve(qbSDK);
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/quickblox@2.23.0/quickblox.min.js";
    script.onload = () => {
      qbSDK = (window as any).QB;
      resolve(qbSDK);
    };
    script.onerror = () => reject("Failed to load QuickBlox SDK from CDN");
    document.head.appendChild(script);
  });
}

/**
 * Check if the QB XMPP chat connection is already established
 * Used to prevent double-connecting when both hooks initialize
 */
export const isChatConnected = () => chatConnected;

/**
 * Set the chat connection flag (called by useQuickBlox when XMPP connects)
 */
export const setChatConnected = (value: boolean) => {
  chatConnected = value;
};

/**
 * Get the QB SDK instance (if loaded)
 */
export const getQB = () => qbSDK;
