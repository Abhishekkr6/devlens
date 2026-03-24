"use client";

import { useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card } from "@/components/Ui/Card";
import { Bell, CheckCircle2, AlertTriangle, Info, UserPlus, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useUserStore } from "@/store/userStore";
import { motion } from "motion/react";

// Define locally for now until we have a shared type file or backend
import { useNotificationStore, NotificationType } from "../../store/notificationStore";



export default function NotificationsPage() {
    const { notifications, markAllAsRead, markAsRead, deleteNotification } = useNotificationStore();
    const { fetchUser } = useUserStore();
    const [filter, setFilter] = useState<NotificationType | "all">("all");

    const handleAccept = async (e: React.MouseEvent, notification: any) => {
        e.stopPropagation();
        try {
            if (!notification.metadata?.orgId) return;
            await api.post(`/orgs/${notification.metadata.orgId}/invite/accept`);
            toast.success("Joined organization successfully");
            await fetchUser();
            await deleteNotification(notification._id);
            window.location.reload(); // Force full refresh as requested
        } catch (error) {
            toast.error("Failed to accept invitation");
        }
    };

    const handleReject = async (e: React.MouseEvent, notification: any) => {
        e.stopPropagation();
        try {
            if (!notification.metadata?.orgId) return;
            await api.post(`/orgs/${notification.metadata.orgId}/invite/reject`);
            toast.info("Invitation rejected");
            await deleteNotification(notification._id);
        } catch (error) {
            toast.error("Failed to reject invitation");
        }
    };

    // Filter logic
    const filteredNotifications = notifications.filter(n => {
        if (filter === "all") return true;
        return n.type === filter;
    });

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

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case "alert":
                return <AlertTriangle className="h-5 w-5 text-rose-500" />;
            case "invite":
                return <UserPlus className="h-5 w-5 text-blue-500" />;
            case "success":
                return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
            default:
                return <Info className="h-5 w-5 text-slate-500" />;
        }
    };

    const getBgColor = (type: NotificationType) => {
        switch (type) {
            case "alert":
                return "bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30";
            case "invite":
                return "bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30";
            case "success":
                return "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30";
            default:
                return "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700";
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-4xl mx-auto">
                <motion.header 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">Notifications</h1>
                        <p className="mt-2 text-sm sm:text-base text-text-secondary font-light">
                            Stay updated with alerts, invites, and system messages.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => markAllAsRead()}
                            className="px-4 py-2 text-sm font-medium text-text-secondary bg-surface border border-border rounded-xl hover:bg-surface/80 hover:text-brand transition-colors cursor-pointer"
                        >
                            Mark all read
                        </button>
                    </div>
                </motion.header>

                {/* Filters */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
                >
                    <button
                        onClick={() => setFilter("all")}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-colors border cursor-pointer",
                            filter === "all"
                                ? "bg-brand text-white border-brand"
                                : "bg-surface text-text-secondary border-border hover:border-brand hover:text-brand"
                        )}
                    >
                        All
                    </button>
                    {["alert", "invite", "success", "info", "warning", "system"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-colors border capitalize cursor-pointer",
                                filter === f
                                    ? "bg-brand text-white border-brand"
                                    : "bg-surface text-text-secondary border-border hover:border-brand hover:text-brand"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </motion.div>

                {/* Content */}
                {filteredNotifications.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col items-center justify-center py-24 text-center"
                    >
                        <div className="h-20 w-20 rounded-full bg-surface border border-border flex items-center justify-center mb-6 shadow-sm">
                            <Bell className="h-10 w-10 text-text-secondary/30" />
                        </div>
                        <h3 className="text-xl font-semibold text-text-primary mb-2">No notifications yet</h3>
                        <p className="text-text-secondary max-w-sm">
                            When you have alerts, team invites, or system updates, they will appear here.
                        </p>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        {filteredNotifications.map((notification, i) => (
                            <motion.div
                                key={notification._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
                            >
                            <Card
                                onClick={() => markAsRead(notification._id)}
                                className={cn(
                                    "p-5 transition-all duration-300 relative group cursor-pointer overflow-hidden rounded-3xl bg-surface/50 backdrop-blur-xl shadow-lg border",
                                    !notification.read ? "border-brand/40 shadow-[0_0_15px_rgba(74,93,255,0.15)]" : "border-white/10 hover:border-brand/30 hover:shadow-[0_0_20px_rgba(74,93,255,0.1)]"
                                )}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                <div className="relative z-10 flex gap-4">
                                    <div className={cn(
                                        "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border",
                                        getBgColor(notification.type)
                                    )}>
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className={cn("text-base", notification.read ? "font-medium text-text-primary" : "font-bold text-text-primary")}>
                                                    {notification.title}
                                                </h3>
                                                <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                                                    {notification.message}
                                                </p>
                                            </div>
                                            <span className="text-xs text-text-secondary whitespace-nowrap bg-surface px-2 py-1 rounded-lg border border-border/50">
                                                {formatTime(notification.createdAt)}
                                            </span>
                                        </div>

                                        {/* Action Buttons for Invites */}
                                        {notification.type === "invite" && notification.metadata?.orgId && (
                                            <div className="mt-3 flex items-center gap-3">
                                                <button
                                                    onClick={(e) => handleAccept(e, notification)}
                                                    className="px-4 py-2 rounded-lg bg-brand text-sm font-semibold text-white border border-border hover:bg-brand/90 transition-colors cursor-pointer"
                                                >
                                                    Accept Invite
                                                </button>
                                                <button
                                                    onClick={(e) => handleReject(e, notification)}
                                                    className="px-4 py-2 rounded-lg border border-border bg-surface text-sm font-medium text-text-secondary hover:bg-surface/80 hover:text-rose-500 transition-colors cursor-pointer"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}

                                        {notification.type !== "invite" && notification.link && (
                                            <div className="mt-3">
                                                <a href={notification.link} className="text-sm font-medium text-brand hover:underline inline-flex items-center gap-1 cursor-pointer">
                                                    Check details <span aria-hidden="true">&rarr;</span>
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )
                }
            </div >
        </DashboardLayout >
    );
}
