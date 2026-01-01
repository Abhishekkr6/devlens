import { NotificationModel } from "../models/notification.model";
import { publishEvent } from "../realtime/publisher";
import logger from "../utils/logger";

interface CreateNotificationParams {
    recipientId: string | any;
    type: "invite" | "success" | "alert" | "info" | "warning";
    title: string;
    message: string;
    link?: string;
    metadata?: any;
}

export const createNotification = async (params: CreateNotificationParams) => {
    try {
        // 1. Save to DB
        const notification = await NotificationModel.create(params);

        // 2. Publish Real-time Event
        await publishEvent({
            type: "notification:created",
            userId: String(params.recipientId),
            data: notification,
        });

        return notification;
    } catch (error) {
        logger.error({ error, params }, "Failed to create/publish notification");
        // We don't throw here to avoid breaking the main flow if notif fails
        return null;
    }
};
