import { WebSocketServer } from "ws";
import logger from "../utils/logger";

/**
 * WebSocket Server (Simplified without Redis)
 * 
 * Basic WebSocket server for future real-time features.
 * Currently not used as frontend uses polling for updates.
 */
export const attachWebSocket = (server: any) => {
  const wss = new WebSocketServer({ server });

  logger.info("[WS] WebSocket server attached (polling-based updates active)");

  wss.on("connection", (ws) => {
    logger.info("[WS] Client connected");

    ws.on("close", () => {
      logger.info("[WS] Client disconnected");
    });

    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: "connected",
      message: "WebSocket connected - using polling for updates"
    }));
  });
};
