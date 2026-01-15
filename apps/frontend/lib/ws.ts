"use client";

let socket: WebSocket | null = null;
const listeners: ((event: unknown) => void)[] = [];
let retryCount = 0;
const MAX_RETRIES = 5;

const DEFAULT_REMOTE_WS = "wss://teampulse-w2s8.onrender.com";

const resolveWsUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (envUrl) return envUrl;

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.BACKEND_URL;
  if (apiUrl) {
    try {
      const parsed = new URL(apiUrl);
      parsed.protocol = parsed.protocol === "https:" ? "wss:" : "ws:";
      parsed.pathname = parsed.pathname.replace(/\/?api\/?v1?$/i, "");
      return parsed.toString().replace(/\/$/, "");
    } catch { }
  }

  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (/localhost|127\.0\.0\.1/i.test(origin)) {
      return "ws://localhost:4000";
    }
  }

  return DEFAULT_REMOTE_WS;
};

export const connectWS = () => {
  if (socket) {
    console.log("[WS] Already connected, reusing existing socket");
    return socket;
  }

  const wsUrl = resolveWsUrl();
  console.log("[WS] Connecting to:", wsUrl);
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("[WS] ✅ Connected successfully");
    console.log("[WS] Active listeners:", listeners.length);
    retryCount = 0; // Reset retry counter on successful connection
  };

  socket.onclose = () => {
    if (retryCount >= MAX_RETRIES) {
      console.warn(`[WS] ❌ Max retry attempts (${MAX_RETRIES}) reached. Stopping reconnection.`);
      return;
    }

    retryCount++;
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s (max 30s)
    const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);

    console.log(`[WS] ❌ Disconnected. Reconnecting in ${delay / 1000}s... (Attempt ${retryCount}/${MAX_RETRIES})`);
    setTimeout(() => {
      socket = null;
      connectWS();
    }, delay);
  };

  socket.onerror = (error) => {
    console.error("[WS] ⚠️ Error:", error);
  };

  socket.onmessage = (msg) => {
    try {
      const data = JSON.parse(msg.data);
      console.log("[WS] 📨 Message received:", {
        type: data.type,
        userId: data.userId,
        dataKeys: data.data ? Object.keys(data.data) : null,
        fullPayload: data
      });
      console.log(`[WS] Broadcasting to ${listeners.length} listener(s)`);
      listeners.forEach((cb, index) => {
        try {
          console.log(`[WS] Calling listener #${index + 1}`);
          cb(data);
        } catch (error) {
          console.error(`[WS] Listener #${index + 1} threw an error:`, error);
        }
      });
    } catch (error) {
      console.error("[WS] Failed to parse message:", error, msg.data);
    }
  };

  return socket;
};

export const subscribeWS = (cb: (event: unknown) => void) => {
  listeners.push(cb);
  console.log(`[WS] 📝 Listener registered. Total listeners: ${listeners.length}`);

  return () => {
    const i = listeners.indexOf(cb);
    if (i > -1) {
      listeners.splice(i, 1);
      console.log(`[WS] 🗑️ Listener unregistered. Total listeners: ${listeners.length}`);
    }
  };
};
