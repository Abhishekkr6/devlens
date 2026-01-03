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
    const { user, fetchUser } = useUserStore();
    const { addNotification } = useNotificationStore();
    const router = useRouter();

    // Ensure User Data is present for ID checks
    useEffect(() => {
        if (!user) {
            console.log("[GlobalNotif] User missing, fetching...");
            fetchUser({ silent: true });
        }
    }, [user, fetchUser]);

    useEffect(() => {
        // Ensure connection
        connectWS();

        const unsubscribe = subscribeWS((event: any) => {
            // Access fresh state directly to avoid closure staleness
            const currentUser = useUserStore.getState().user;
            const currentUserId = currentUser?.id || currentUser?._id;

            // Debug Log
            console.log(`[GlobalNotif] Event: ${event.type} | Target: ${event.userId} | Me: ${currentUserId}`);

            // Loose comparison to handle string vs value types
            if (event.type === "notification:created" && String(event.userId) === String(currentUserId)) {
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
                // Explicit check for "invite" type
                if (notif.type === "invite") {
                    console.log("[GlobalNotif] Triggering Invite Toast", notif);
                    toast.custom((t) => (
                        <InviteToast t={t} notification={notif} />
                    ), { duration: Infinity, position: "bottom-right" }); // Infinity duration
                    return;
                }

                // 3. Dark Glass Toast for Invite Responses (Accept/Reject)
                if ((notif.type === "success" && notif.title?.includes("Accepted")) ||
                    (notif.type === "alert" && notif.title?.includes("Rejected"))) {

                    toast.custom((t) => (
                        <StatusToast t={t} notification={notif} type={notif.type === "success" ? "success" : "error"} />
                    ), { duration: 5000, position: "bottom-right" });
                    return;
                }

                // 4. Standard Toast for others
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
    }, [router, addNotification]); // Removed user dependency -> Stable Listener

    return null;
}

function InviteToast({ t, notification }: { t: string | number, notification: any }) {
    const { deleteNotification, fetchNotifications } = useNotificationStore();
    const { fetchUser, setActiveOrganization } = useUserStore();
    const router = useRouter();
    const metadata = notification.metadata || {}; // Defensive fallback

    const handleAccept = async () => {
        try {
            if (metadata.orgId) {
                await api.post(`/orgs/${metadata.orgId}/invite/accept`);
            }
            toast.success(`Joined organization successfully`);
            toast.dismiss(t);
            // Cleanup notification
            await deleteNotification(notification._id);
            // Refresh User Data (Orgs List) & Notifications
            await fetchUser({ silent: true });
            await fetchNotifications();

            // Navigate to new Org
            if (metadata.orgId) {
                setActiveOrganization(metadata.orgId);
                router.push(`/organization/${metadata.orgId}`);
            }
        } catch (error) {
            toast.error("Failed to accept invitation");
        }
    };

    const handleReject = async () => {
        try {
            if (metadata.orgId) {
                await api.post(`/orgs/${metadata.orgId}/invite/reject`);
            }
            toast.info("Invitation rejected");
            toast.dismiss(t);
            await deleteNotification(notification._id);
        } catch (error) {
            toast.error("Failed to reject invitation");
        }
    };

    return (
        <div className="w-full max-w-sm rounded-xl border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-2xl p-4 pointer-events-auto flex flex-col gap-3 z-[99999]">
            <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">{notification.title}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notification.message}</p>
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

function StatusToast({ t, notification, type }: { t: string | number, notification: any, type: "success" | "error" }) {
    return (
        <div className="w-full max-w-sm rounded-xl border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-2xl p-4 pointer-events-auto flex items-start gap-3 z-[99999]">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${type === 'success' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                {type === 'success' ? (
                    <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="h-4 w-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )}
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-semibold text-white">{notification.title}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notification.message}</p>
            </div>
            <button
                onClick={() => toast.dismiss(t)}
                className="text-slate-400 hover:text-white transition-colors"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}
