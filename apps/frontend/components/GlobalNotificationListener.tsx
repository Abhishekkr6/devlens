"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { connectWS, subscribeWS } from "../lib/ws";
import { useUserStore } from "../store/userStore";
import { Button } from "./Ui/Button";
import { useNotificationStore } from "../store/notificationStore"; // Added import
import { api } from "../lib/api"; // Added import

export function GlobalNotificationListener() {
    const { user } = useUserStore();
    const { addNotification } = useNotificationStore();
    const router = useRouter();

    useEffect(() => {
        // Ensure connection
        connectWS();

        const unsubscribe = subscribeWS((event: any) => {
            // 1. Check if event is a notification for THIS user
            if (event.type === "notification:created" && event.userId === user?.id) {
                const notif = event.data;

                // Update store immediately
                // (This is redundant if NotificationDropdown already does it? 
                // No, NotificationDropdown only adds if it's mounted.
                // But if Global adds it, and Dropdown adds it, we might have duplicates?
                // useNotificationStore.addNotification handles duplicates.)
                try {
                    addNotification(notif);
                } catch (e) {
                    // ignore
                }

                // 2. Custom Toast for Invites
                if (notif.type === "invite" && notif.metadata?.orgId) {
                    toast.custom((t) => (
                        <InviteToast t={t} notification={notif} />
                    ), { duration: 10000, position: "bottom-right" });
                    return;
                }

                // 3. Standard Toast for others
                toast(notif.title, {
                    description: notif.message,
                    action: notif.link ? {
                        label: "View",
                        onClick: () => router.push(notif.link!),
                    } : undefined,
                    duration: 5000,
                    position: "bottom-right",
                });
            }
        });

        return () => {
            unsubscribe();
        };
    }, [user?.id, router, addNotification]);

    return null;
}

function InviteToast({ t, notification }: { t: string | number, notification: any }) {
    const { deleteNotification, fetchNotifications } = useNotificationStore();
    const router = useRouter();

    const handleAccept = async () => {
        try {
            await api.post(`/orgs/${notification.metadata.orgId}/invite/accept`);
            toast.success(`Joined organization successfully`);
            toast.dismiss(t);
            // Cleanup notification
            await deleteNotification(notification._id);
        } catch (error) {
            toast.error("Failed to accept invitation");
        }
    };

    const handleReject = async () => {
        try {
            await api.post(`/orgs/${notification.metadata.orgId}/invite/reject`);
            toast.info("Invitation rejected");
            toast.dismiss(t);
            await deleteNotification(notification._id);
        } catch (error) {
            toast.error("Failed to reject invitation");
        }
    };

    return (
        <div className="w-full max-w-sm rounded-xl border border-border bg-background shadow-lg p-4 pointer-events-auto flex flex-col gap-3">
            <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-text-primary">{notification.title}</h4>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">{notification.message}</p>
                </div>
            </div>

            <div className="flex items-center gap-2 pl-11">
                <Button
                    size="sm"
                    onClick={handleAccept}
                    className="h-7 px-3 text-xs bg-brand hover:bg-brand/90 text-white border-none"
                >
                    Accept
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReject}
                    className="h-7 px-3 text-xs border-border hover:bg-surface hover:text-rose-500"
                >
                    Reject
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        toast.dismiss(t);
                        router.push('/notifications');
                    }}
                    className="h-7 px-2 text-xs text-text-secondary hover:text-text-primary ml-auto"
                >
                    View
                </Button>
            </div>
        </div>
    );
}
