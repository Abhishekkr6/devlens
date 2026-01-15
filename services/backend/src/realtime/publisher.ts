import logger from "../utils/logger";
import { broadcastToClients } from "./wsServer";

/**
 * Event Publisher with WebSocket Broadcasting
 * 
 * Broadcasts real-time events to all connected WebSocket clients
 */
export const publishEvent = async (event: any) => {
    try {
        logger.info({
            message: "[Publisher] Publishing event:",
            type: event.type,
            userId: event.userId,
            timestamp: new Date().toISOString()
        });

        // Broadcast to all connected WebSocket clients
        broadcastToClients(event);

        logger.info("[Publisher] ✅ Event published successfully");
    } catch (error) {
        logger.error({
            message: "[Publisher] ❌ Error publishing event:",
            error: error instanceof Error ? error.message : String(error)
        });
        throw error;
    }
};
