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
import { useNotificationStore, NotificationType } from "../../store/notificationStore";
import { api } from "../../lib/api";
import { useUserStore } from "../../store/userStore";

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
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
        await api.post(`/orgs/${n.metadata.orgId}/invite/accept`);
        await fetchUser();
        await deleteNotification(n._id);
    };

    const handleRejectInvite = async (e: React.MouseEvent, n: any) => {
        e.stopPropagation();
        await api.post(`/orgs/${n.metadata.orgId}/invite/reject`);
        await deleteNotification(n._id);
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case "alert": return <AlertTriangle className="h-4 w-4 text-rose-500" />;
            case "invite": return <UserPlus className="h-4 w-4 text-blue-500" />;
            case "success": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            default: return <Info className="h-4 w-4 text-slate-500" />;
        }
    };

    return (
        <div className="absolute right-0 mt-2 w-96 rounded-xl border bg-background shadow-xl z-50">
            <div className="flex justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="text-xs bg-brand text-white px-2 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-brand">
                        Mark all read
                    </button>
                )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
                {notifications.map((n) => (
                    <div
                        key={n._id}
                        onClick={() => markAsRead(n._id)}
                        className={cn(
                            "flex gap-3 p-4 hover:bg-surface cursor-pointer",
                            !n.read && "bg-brand/5"
                        )}
                    >
                        <div className="h-8 w-8 flex items-center justify-center rounded-full">
                            {getIcon(n.type)}
                        </div>

                        <div className="flex-1">
                            <p className="text-sm font-medium">{n.title}</p>
                            <p className="text-xs text-text-secondary">{n.message}</p>

                            {n.type === "invite" && (
                                <div className="mt-2 flex gap-2">
                                    <button onClick={(e) => handleAcceptInvite(e, n)} className="text-xs text-brand">
                                        Accept
                                    </button>
                                    <button onClick={(e) => handleRejectInvite(e, n)} className="text-xs text-rose-500">
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>

                        <button onClick={() => deleteNotification(n._id)}>
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}
            </div>

            <Link href="/notifications" onClick={onClose} className="block text-center text-xs py-2">
                View all notifications
            </Link>
        </div>
    );
}
