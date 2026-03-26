import { Response } from "express";
import logger from "../utils/logger";

import { NotificationModel } from "../models/notification.model";

/**
 * GET NOTIFICATIONS
 * - Fetch notifications for the logged-in user
 */
export const getNotifications = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const notifications = await NotificationModel.find({ recipientId: userId })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 to avoid overload

        return res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        logger.error({ error: error }, "GET NOTIFICATIONS ERROR:");
        return res.status(500).json({ error: "Failed to fetch notifications" });
    }
};

/**
 * MARK AS READ
 * - Mark specific notification or all notifications as read
 */
export const markAsRead = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { id } = req.params;

        if (id === "all") {
            await NotificationModel.updateMany(
                { recipientId: userId, read: false },
                { read: true }
            );
        } else {
            await NotificationModel.findOneAndUpdate(
                { _id: id, recipientId: userId },
                { read: true }
            );
        }

        return res.status(200).json({ success: true, message: "Marked as read" });
    } catch (error) {
        logger.error({ error: error }, "MARK READ ERROR:");
        return res.status(500).json({ error: "Failed to update notification" });
    }
};

/**
 * DELETE NOTIFICATION
 */
export const deleteNotification = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const { id } = req.params;

        await NotificationModel.findOneAndDelete({ _id: id, recipientId: userId });

        return res.status(200).json({ success: true, message: "Deleted" });
    } catch (error) {
        return res.status(500).json({ error: "Failed to delete notification" });
    }
};
