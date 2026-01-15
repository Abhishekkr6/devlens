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

  const totalClients = connectedClients.size;
  logger.info(`[WS] 📢 Broadcasting event: type=${event.type}, userId=${event.userId}, totalConnectedClients=${totalClients}`);

  if (totalClients === 0) {
    logger.warn(`[WS] ⚠️ No connected clients to broadcast to!`);
    return;
  }

  let sentCount = 0;
  let failedCount = 0;

  connectedClients.forEach((ws) => {
    try {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(event));
        sentCount++;
        logger.debug(`[WS] ✅ Event sent. Total sent: ${sentCount}`);
      } else {
        logger.warn(`[WS] Client not in OPEN state: readyState=${ws.readyState}`);
        failedCount++;
      }
    } catch (error) {
      logger.error({ message: "[WS] Failed to send event:", error });
      connectedClients.delete(ws);
      failedCount++;
    }
  });

  logger.info(`[WS] 📊 Broadcast summary: totalClients=${totalClients}, sentCount=${sentCount}, failedCount=${failedCount}, eventType=${event.type}, targetUserId=${event.userId}`);
};
