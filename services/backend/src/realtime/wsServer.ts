import { WebSocketServer } from "ws";
import logger from "../utils/logger";

// Global WebSocket server instance and connected clients
let wss: WebSocketServer | null = null;
const connectedClients = new Set<any>();

export const attachWebSocket = (server: any) => {
  wss = new WebSocketServer({ server });

  logger.info("[WS] WebSocket server attached ✅");

  wss.on("connection", (ws) => {
    logger.info("[WS] Client connected");
    connectedClients.add(ws);
    logger.info(`[WS] Total clients connected: ${connectedClients.size}`);

    ws.on("close", () => {
      logger.info("[WS] Client disconnected");
      connectedClients.delete(ws);
      logger.info(`[WS] Total clients connected: ${connectedClients.size}`);
    });

    ws.on("error", (error) => {
      logger.error({ message: "[WS] Error:", error });
      connectedClients.delete(ws);
    });

    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: "connected",
      message: "WebSocket connected ✅"
    }));
  });
};

/**
 * Broadcast event to all connected WebSocket clients
 */
export const broadcastToClients = (event: any) => {
  if (!wss) {
    logger.warn("[WS] WebSocket server not initialized");
    return;
  }

  logger.info(`[WS] Broadcasting event to ${connectedClients.size} client(s): type=${event.type}, userId=${event.userId}`);

  connectedClients.forEach((ws) => {
    try {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(event));
        logger.debug(`[WS] ✅ Event sent to client for userId: ${event.userId}`);
      }
    } catch (error) {
      logger.error({ message: "[WS] Failed to send event to client:", error });
      connectedClients.delete(ws);
    }
  });
};
