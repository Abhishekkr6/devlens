import { create } from "zustand";
import { api } from "../lib/api";

export type NotificationType = "alert" | "invite" | "info" | "success";

export interface Notification {
    _id: string; // Backend uses _id
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    read: boolean;
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
            const unreadCount = notifications.filter((n: Notification) => !n.read).length;
            set({ notifications, unreadCount });
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
}));
