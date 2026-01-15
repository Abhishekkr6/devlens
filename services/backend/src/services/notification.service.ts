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
        logger.info("[NotificationService] Creating notification:", {
            recipientId: params.recipientId,
            type: params.type,
            title: params.title
        });

        // 1. Save to DB
        const notification = await NotificationModel.create(params);
        logger.info("[NotificationService] ✅ Notification saved to DB:", {
            notificationId: notification._id,
            recipientId: notification.recipientId,
            type: notification.type
        });

        // 2. Publish Real-time Event
        const eventPayload = {
            type: "notification:created",
            userId: String(notification.recipientId), // Use recipientId from saved notification
            data: notification.toObject ? notification.toObject() : notification,
        };

        logger.info("[NotificationService] 📤 Publishing WebSocket event...", {
            type: eventPayload.type,
            userId: eventPayload.userId,
            notificationId: notification._id
        });

        await publishEvent(eventPayload);

        logger.info("[NotificationService] ✅ WebSocket event published successfully");
        return notification;
    } catch (error) {
        logger.error({ error, params }, "Failed to create/publish notification");
        // We don't throw here to avoid breaking the main flow if notif fails
        return null;
    }
};
