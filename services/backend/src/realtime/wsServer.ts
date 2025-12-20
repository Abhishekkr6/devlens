import { WebSocketServer } from "ws";
import Redis from "ioredis";
import logger from "../utils/logger";

export const attachWebSocket = (server: any) => {
  const wss = new WebSocketServer({ server });

  logger.info("[WS] WebSocket attached to Express server");

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    logger.warn("[WS] REDIS_URL not set, WebSocket real-time features may not work");
    return;
  }
  const redis = new Redis(redisUrl);

  redis.subscribe("events", () => {
    logger.info("[WS] Subscribed to Redis events");
  });

  redis.on("message", (_, message) => {
    const event = JSON.parse(message);

    wss.clients.forEach((client) => {
      try {
        client.send(JSON.stringify(event));
      } catch {}
    });
  });
};
