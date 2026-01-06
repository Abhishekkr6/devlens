import { create } from "zustand";
import { api } from "../lib/api";

export type NotificationType = "alert" | "invite" | "info" | "success" | "warning" | "system";

export interface Notification {
    _id: string; // Backend uses _id
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    metadata?: {
        orgId?: string;
        role?: string;
    };
    createdAt: string;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,

    fetchNotifications: async () => {
        try {
            set({ loading: true });
            const res = await api.get("/notifications");
            const notifications = res.data?.data || [];

            // Auto-delete "Invite Accepted" and "Invite Rejected" notifications
            // These are one-time informational messages that shouldn't persist
            const notificationsToDelete = notifications.filter((n: Notification) =>
                n.title === "Invite Accepted" || n.title === "Invite Rejected"
            );

            // Delete them in the background (don't await to avoid blocking)
            notificationsToDelete.forEach((n: Notification) => {
                api.delete(`/notifications/${n._id}`).catch(err =>
                    console.error("Failed to auto-delete notification:", err)
                );
            });

            // Filter out the auto-deleted notifications from the UI
            const filteredNotifications = notifications.filter((n: Notification) =>
                n.title !== "Invite Accepted" && n.title !== "Invite Rejected"
            );

            const unreadCount = filteredNotifications.filter((n: Notification) => !n.read).length;
            set({ notifications: filteredNotifications, unreadCount });
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            set({ loading: false });
        }
    },

    markAsRead: async (id: string) => {
        try {
            // Optimistic update
            set((state) => {
                const updated = state.notifications.map((n) =>
                    n._id === id ? { ...n, read: true } : n
                );
                return {
                    notifications: updated,
                    unreadCount: updated.filter((n) => !n.read).length,
                };
            });
            await api.patch(`/notifications/${id}/read`);
        } catch (err) {
            console.error("Failed to mark as read", err);
            get().fetchNotifications(); // Revert on error
        }
    },

    markAllAsRead: async () => {
        try {
            set((state) => {
                const updated = state.notifications.map((n) => ({ ...n, read: true }));
                return {
                    notifications: updated,
                    unreadCount: 0,
                };
            });
            await api.patch("/notifications/all/read");
        } catch (err) {
            console.error("Failed to mark all as read", err);
            get().fetchNotifications();
        }
    },

    deleteNotification: async (id: string) => {
        try {
            set((state) => {
                const updated = state.notifications.filter((n) => n._id !== id);
                return {
                    notifications: updated,
                    unreadCount: updated.filter((n) => !n.read).length,
                };
            });
            await api.delete(`/notifications/${id}`);
        } catch (err) {
            console.error("Failed to delete notification", err);
            get().fetchNotifications();
        }
    },

    addNotification: (notification: Notification) => {
        console.log("[NotificationStore] Adding notification:", notification);

        set((state) => {
            // Prevent duplicates
            if (state.notifications.some((n) => n._id === notification._id)) {
                console.log("[NotificationStore] ⚠️ Duplicate notification, skipping:", notification._id);
                return state;
            }

            const updated = [notification, ...state.notifications];
            const newUnreadCount = updated.filter((n) => !n.read).length;

            console.log("[NotificationStore] ✅ Notification added:", {
                id: notification._id,
                type: notification.type,
                totalNotifications: updated.length,
                unreadCount: newUnreadCount
            });

            return {
                notifications: updated,
                unreadCount: newUnreadCount,
            };
        });
    },
}));
