"use client";

import Link from "next/link";
import {
    Bell,
    CheckCircle2,
    AlertTriangle,
    Info,
    UserPlus,
    X,
} from "lucide-react";
import { cn } from "../../lib/utils";
import {
    useNotificationStore,
    NotificationType,
} from "../../store/notificationStore";
import { api } from "../../lib/api";
import { useUserStore } from "../../store/userStore";

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationDropdown({
    isOpen,
    onClose,
}: NotificationDropdownProps) {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    } = useNotificationStore();
    const { fetchUser } = useUserStore();

    if (!isOpen) return null;

    const handleAcceptInvite = async (e: React.MouseEvent, n: any) => {
        e.stopPropagation();
        try {
            await api.post(`/orgs/${n.metadata.orgId}/invite/accept`);
            await fetchUser();
            // Mark as read instead of deleting
            markAsRead(n._id);
        } catch (error) {
            console.error("Failed to accept invite:", error);
        }
    };

    const handleRejectInvite = async (e: React.MouseEvent, n: any) => {
        e.stopPropagation();
        try {
            await api.post(`/orgs/${n.metadata.orgId}/invite/reject`);
            // Mark as read instead of deleting
            markAsRead(n._id);
        } catch (error) {
            console.error("Failed to reject invite:", error);
        }
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case "alert":
                return <AlertTriangle className="h-4 w-4 text-rose-400" />;
            case "invite":
                return <UserPlus className="h-4 w-4 text-indigo-400" />;
            case "success":
                return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
            default:
                return <Info className="h-4 w-4 text-slate-400" />;
        }
    };

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className={cn(
                "absolute left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 mt-3 w-[calc(100vw-2rem)] sm:w-[22rem] max-w-[22rem] z-[150]",
                "rounded-2xl overflow-hidden",
                "border border-white/10",
                "bg-slate-950/80 backdrop-blur-xl",
                "shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/40">
                <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-slate-400" />
                    <h3 className="text-sm font-semibold text-white">
                        Notifications
                    </h3>
                    {unreadCount > 0 && (
                        <span className="ml-1 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                            {unreadCount}
                        </span>
                    )}
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                        Mark all read
                    </button>
                )}
            </div>

            {/* Content */}
            <div
                className="max-h-[420px] overflow-y-auto divide-y divide-white/5 hide-scrollbar"
                style={{
                    overscrollBehavior: 'contain',
                    WebkitOverflowScrolling: 'touch'
                }}
                onWheel={(e) => e.stopPropagation()}
            >
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                            <Bell className="h-6 w-6 text-slate-500" />
                        </div>
                        <p className="text-sm font-medium text-white">
                            All caught up
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            No new notifications
                        </p>
                    </div>
                ) : (
                    notifications.map((n) => (
                        <div
                            key={n._id}
                            onClick={() => markAsRead(n._id)}
                            className={cn(
                                "group relative flex gap-3 p-4 cursor-pointer transition-all",
                                "hover:bg-white/5",
                                !n.read && "bg-indigo-500/5"
                            )}
                        >
                            {/* Icon */}
                            <div className="mt-0.5 h-8 w-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                {getIcon(n.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p
                                    className={cn(
                                        "text-sm leading-tight",
                                        n.read
                                            ? "text-slate-200"
                                            : "text-white font-semibold"
                                    )}
                                >
                                    {n.title}
                                </p>
                                <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                                    {n.message}
                                </p>

                                {n.type === "invite" && (
                                    <div className="mt-3 flex items-center gap-2">
                                        <button
                                            onClick={(e) => handleAcceptInvite(e, n)}
                                            className="h-7 px-3 rounded-lg text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-400 transition-colors cursor-pointer"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={(e) => handleRejectInvite(e, n)}
                                            className="h-7 px-3 rounded-lg text-xs font-medium text-slate-300 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 transition-colors cursor-pointer"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Dismiss */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(n._id);
                                }}
                                className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>

                            {/* Unread dot */}
                            {!n.read && (
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-indigo-400" />
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <Link
                href="/notifications"
                onClick={onClose}
                className="block text-center py-2.5 text-[11px] font-medium text-slate-400 hover:text-white transition-colors bg-slate-900/40 border-t border-white/10"
            >
                View all notifications →
            </Link>
        </div>
    );
}
