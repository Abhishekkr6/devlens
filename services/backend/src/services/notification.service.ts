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
        console.log("[NotificationService] Creating notification:", {
            recipientId: params.recipientId,
            type: params.type,
            title: params.title
        });

        // 1. Save to DB
        const notification = await NotificationModel.create(params);
        console.log("[NotificationService] ✅ Notification saved to DB:", notification._id);

        // 2. Publish Real-time Event
        console.log("[NotificationService] Publishing WebSocket event...", {
            type: "notification:created",
            userId: String(params.recipientId),
            notificationId: notification._id
        });

        await publishEvent({
            type: "notification:created",
            userId: String(params.recipientId),
            data: notification,
        });

        console.log("[NotificationService] ✅ WebSocket event published successfully");
        return notification;
    } catch (error) {
        logger.error({ error, params }, "Failed to create/publish notification");
        console.error("[NotificationService] ❌ Error:", error);
        // We don't throw here to avoid breaking the main flow if notif fails
        return null;
    }
};
