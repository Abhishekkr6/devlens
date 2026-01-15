import { NotificationModel } from "../models/notification.model";
import { publishEvent } from "../realtime/publisher";
import logger from "../utils/logger";

interface CreateNotificationParams {
    recipientId: string | any;
    type: "invite" | "success" | "alert" | "info" | "warning" | "system";
    title: string;
    message: string;
    link?: string;
    metadata?: any;
}

export const createNotification = async (params: CreateNotificationParams) => {
    try {
        logger.info({
            recipientId: params.recipientId,
            type: params.type,
            title: params.title
        }, "[NotificationService] Creating notification");

        // 1. Save to DB
        const notification = await NotificationModel.create(params);
        logger.info({
            notificationId: notification._id,
            recipientId: notification.recipientId,
            type: notification.type
        }, "[NotificationService] ✅ Notification saved to DB");

        // 2. Publish Real-time Event
        const eventPayload = {
            type: "notification:created",
            userId: String(notification.recipientId), // Use recipientId from saved notification
            data: notification.toObject ? notification.toObject() : notification,
        };

        logger.info({
            type: eventPayload.type,
            userId: eventPayload.userId,
            notificationId: notification._id
        }, "[NotificationService] 📤 Publishing WebSocket event");

        await publishEvent(eventPayload);

        logger.info("[NotificationService] ✅ WebSocket event published successfully");
        return notification;
    } catch (error) {
        logger.error({ error, params }, "Failed to create/publish notification");
        // We don't throw here to avoid breaking the main flow if notif fails
        return null;
    }
};
