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
    if (!pub) return;

    try {
        const message = JSON.stringify(event);
        await pub.publish("events", message);
    } catch (error) {
        logger.error({ error }, "[Redis Publisher] Failed to publish event");
    }
};
