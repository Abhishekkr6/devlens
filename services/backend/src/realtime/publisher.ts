import Redis from "ioredis";
import logger from "../utils/logger";

let publisher: Redis | null = null;

const getPublisher = () => {
    if (!publisher) {
        const redisUrl = process.env.REDIS_URL;
        if (redisUrl) {
            publisher = new Redis(redisUrl);
            publisher.on("error", (err) => {
                logger.error({ err }, "[Redis Publisher] Error");
            });
        } else {
            logger.warn("[Redis Publisher] REDIS_URL not provided");
        }
    }
    return publisher;
};

export const publishEvent = async (event: any) => {
    const pub = getPublisher();

    if (!pub) {
        console.warn("[Redis Publisher] ⚠️ Publisher not available - REDIS_URL missing?");
        logger.warn("[Redis Publisher] Cannot publish event - no Redis connection");
        return;
    }

    try {
        const message = JSON.stringify(event);
        console.log("[Redis Publisher] Publishing event:", {
            type: event.type,
            userId: event.userId,
            channel: "events"
        });

        await pub.publish("events", message);
        console.log("[Redis Publisher] ✅ Event published successfully");
    } catch (error) {
        console.error("[Redis Publisher] ❌ Failed to publish:", error);
        logger.error({ error }, "[Redis Publisher] Failed to publish event");
    }
};
