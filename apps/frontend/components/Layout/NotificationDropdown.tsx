"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Bell,
    CheckCircle2,
    AlertTriangle,
    Info,
    UserPlus,
    X,
    Check,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useNotificationStore, NotificationType } from "../../store/notificationStore";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { useUserStore } from "../../store/userStore";
import { connectWS, subscribeWS } from "../../lib/ws";
import { useEffect } from "react";

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, fetchNotifications, addNotification } = useNotificationStore();
    const { fetchUser, user } = useUserStore();

    useEffect(() => {
        connectWS();

        const unsubscribe = subscribeWS((event: any) => {
            if (event.type === "notification:created" && event.userId === user?.id) {
                addNotification(event.data);
            }
        });

        return () => {
            unsubscribe();
        }
    }, [user?.id, addNotification]);

    if (!isOpen) return null;

    const handleAcceptInvite = async (e: React.MouseEvent, notification: any) => {
        e.stopPropagation();
        try {
            if (!notification.metadata?.orgId) return;
            await api.post(`/orgs/${notification.metadata.orgId}/invite/accept`);
            toast.success("Invitation accepted! You have joined the organization.");
            await fetchUser();
            await deleteNotification(notification._id);
        } catch (error) {
            toast.error("Failed to accept invitation.");
        }
    };

    const handleRejectInvite = async (e: React.MouseEvent, notification: any) => {
        e.stopPropagation();
        try {
            if (!notification.metadata?.orgId) return;
            await api.post(`/orgs/${notification.metadata.orgId}/invite/reject`);
            toast.success("Invitation rejected.");
            await deleteNotification(notification._id);
        } catch (error) {
            toast.error("Failed to reject invitation.");
        }
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case "alert":
                return <AlertTriangle className="h-4 w-4 text-rose-500" />;
            case "invite":
                return <UserPlus className="h-4 w-4 text-blue-500" />;
            case "success":
                return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            default:
                return <Info className="h-4 w-4 text-slate-500" />;
        }
    };

    const getBgColor = (type: NotificationType) => {
        switch (type) {
            case "alert":
                return "bg-rose-50 dark:bg-rose-950/20";
            case "invite":
                return "bg-blue-50 dark:bg-blue-950/20";
            case "success":
                return "bg-emerald-50 dark:bg-emerald-950/20";
            default:
                return "bg-slate-50 dark:bg-slate-800/50";
        }
    };

    // Format time roughly (e.g., "5m ago")
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 60000); // minutes
        if (diff < 1) return "Just now";
        if (diff < 60) return `${diff}m ago`;
        const hours = Math.floor(diff / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-xl border border-border bg-[var(--background)] shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-[100] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/50">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="flex h-5 items-center justify-center rounded-full bg-rose-500 px-2 text-[10px] font-bold text-white">
                            {unreadCount}
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={() => markAllAsRead()}
                        className="text-xs font-medium text-brand hover:text-brand/80 transition-colors"
                    >
                        Mark all read
                    </button>
                )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="h-12 w-12 rounded-full bg-surface flex items-center justify-center mb-3">
                            <Bell className="h-6 w-6 text-text-secondary/50" />
                        </div>
                        <p className="text-sm font-medium text-text-primary">All caught up!</p>
                        <p className="text-xs text-text-secondary mt-1">
                            No new notifications at the moment.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                onClick={() => markAsRead(notification._id)}
                                className={cn(
                                    "group relative flex gap-3 p-4 transition-colors hover:bg-surface/50 cursor-pointer",
                                    !notification.read && "bg-brand/5 dark:bg-brand/10 hover:bg-brand/10"
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                        getBgColor(notification.type)
                                    )}
                                >
                                    {getIcon(notification.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p
                                            className={cn(
                                                "text-sm font-medium leading-none",
                                                notification.read ? "text-text-primary" : "text-text-primary font-bold"
                                            )}
                                        >
                                            {notification.title}
                                        </p>
                                        <span className="text-[10px] text-text-secondary bg-surface px-1.5 py-0.5 rounded shrink-0">
                                            {formatTime(notification.createdAt)}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-text-secondary leading-normal line-clamp-2">
                                        {notification.message}
                                    </p>

                                    {notification.type === "invite" && notification.metadata?.orgId ? (
                                        <div className="mt-3 flex items-center gap-2">
                                            <button
                                                onClick={(e) => handleAcceptInvite(e, notification)}
                                                className="px-3 py-1.5 rounded-lg bg-brand text-xs font-semibold text-white hover:bg-brand/90 transition-colors shadow-sm"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={(e) => handleRejectInvite(e, notification)}
                                                className="px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-medium text-text-secondary hover:bg-surface/80 hover:text-rose-500 transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    ) : notification.link ? (
                                        <Link href={notification.link} className="mt-2 text-xs font-medium text-brand group-hover:underline inline-block">
                                            View Details →
                                        </Link>
                                    ) : null}
                                </div>

                                <button
                                    onClick={(e) => deleteNotification(notification._id)}
                                    className="absolute right-2 top-2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-all text-text-secondary"
                                    title="Dismiss"
                                >
                                    <X className="h-3 w-3" />
                                </button>

                                {!notification.read && (
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-brand"></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-2 border-t border-border bg-surface/50 text-center">
                <Link href="/notifications" onClick={onClose} className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors block py-1">
                    View all notifications
                </Link>
            </div>
        </div>
    );
}
