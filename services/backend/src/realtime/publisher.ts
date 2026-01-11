import logger from "../utils/logger";

/**
 * Event Publisher (No-op without Redis)
 * 
 * This function is kept for backward compatibility but does nothing
 * since we've moved to polling-based updates instead of Redis pub/sub.
 */
export const publishEvent = async (event: any) => {
    logger.debug(
        { eventType: event.type },
        "Event publish skipped - using polling instead of Redis pub/sub"
    );
    // No-op: Frontend uses polling for updates
};
