"use client";

let socket: WebSocket | null = null;
const listeners: ((event: unknown) => void)[] = [];

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
    } catch {
      // fall through to default
    }
  }

  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (/localhost|127\.0\.0\.1/i.test(origin)) {
      return "ws://localhost:4000";
    }
  }

  return DEFAULT_REMOTE_WS;
};

let heartbeatInterval: NodeJS.Timeout | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
const HEARTBEAT_INTERVAL = 30000;
const RECONNECT_DELAY = 3000;

export const connectWS = () => {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return socket;
  }

  // Clear existing timeouts
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  if (heartbeatInterval) clearInterval(heartbeatInterval);

  console.log("[WS] Connecting...");
  socket = new WebSocket(resolveWsUrl());

  socket.onopen = () => {
    console.log("[WS] Connected");
    // Start Heartbeat
    heartbeatInterval = setInterval(() => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "ping" }));
      }
    }, HEARTBEAT_INTERVAL);
  };

  socket.onerror = (error) => {
    console.error("[WS] Connection error:", error);
  };

  socket.onclose = () => {
    console.log("[WS] Disconnected. Reconnecting...");
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    socket = null;

    reconnectTimeout = setTimeout(() => {
      connectWS();
    }, RECONNECT_DELAY);
  };

  socket.onmessage = (msg) => {
    try {
      const data = JSON.parse(msg.data);
      if (data.type === "pong") return; // Ignore pongs

      console.log("[WS] Event received:", data.type, data);
      listeners.forEach((cb) => cb(data));
    } catch (err) {
      console.error("[WS] Failed to parse message:", err);
    }
  };

  return socket;
};

// Auto-reconnect on visibility change (wake from sleep)
if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      if (!socket || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
        console.log("[WS] Page visible, reconnecting...");
        connectWS();
      }
    }
  });

  window.addEventListener("online", () => {
    console.log("[WS] Network online, reconnecting...");
    connectWS();
  });
}

export const subscribeWS = (cb: (event: unknown) => void) => {
  listeners.push(cb);
  return () => {
    const index = listeners.indexOf(cb);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};
