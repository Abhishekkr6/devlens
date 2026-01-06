"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useNotificationStore } from "@/store/notificationStore";
import { api } from "@/lib/api";
import { useUserStore } from "@/store/userStore";

export function GlobalInviteToaster() {
    const notifications = useNotificationStore((s) => s.notifications);
    const deleteNotification = useNotificationStore((s) => s.deleteNotification);
    const { fetchUser } = useUserStore();

    // Prevent duplicate toasts using localStorage
    const shown = useRef(new Set<string>());

    useEffect(() => {
        // Load previously shown toasts from localStorage
        const shownToasts = JSON.parse(localStorage.getItem("shownInviteToasts") || "[]");
        shown.current = new Set(shownToasts);
    }, []);

    useEffect(() => {
        console.log("[GlobalInviteToaster] Notifications changed:", {
            total: notifications.length,
            invites: notifications.filter(n => n.type === "invite").length,
            unread: notifications.filter(n => !n.read).length,
            shown: Array.from(shown.current)
        });

        notifications.forEach((n) => {
            if (n.type !== "invite") {
                console.log(`[GlobalInviteToaster] Skipping non-invite: ${n.type}`);
                return;
            }
            if (n.read) {
                console.log(`[GlobalInviteToaster] Skipping read notification: ${n._id}`);
                return;
            }
            if (shown.current.has(n._id)) {
                console.log(`[GlobalInviteToaster] Already shown: ${n._id}`);
                return;
            }

            console.log("[GlobalInviteToaster] 🎉 Showing invite toast:", n);
            shown.current.add(n._id);

            // Save to localStorage
            const shownToasts = Array.from(shown.current);
            localStorage.setItem("shownInviteToasts", JSON.stringify(shownToasts));

            toast.custom(
                (t) => (
                    <InviteToast
                        toastId={t}
                        notification={n}
                        onDone={() => {
                            console.log(`[GlobalInviteToaster] Toast done, removing from shown: ${n._id}`);
                            deleteNotification(n._id);
                        }}
                        fetchUser={fetchUser}
                    />
                ),
                {
                    duration: Infinity,
                    position: "bottom-right",
                }
            );
        });
    }, [notifications, deleteNotification, fetchUser]);

    return null;
}

function InviteToast({
    toastId,
    notification,
    onDone,
    fetchUser,
}: {
    toastId: string | number;
    notification: any;
    onDone: () => void;
    fetchUser: () => Promise<void>;
}) {
    const handleAccept = async () => {
        try {
            await api.post(`/orgs/${notification.metadata.orgId}/invite/accept`);
            await fetchUser();
            toast.success("Invitation accepted");
            toast.dismiss(toastId);
            onDone();
        } catch {
            toast.error("Failed to accept invite");
        }
    };

    const handleReject = async () => {
        try {
            await api.post(`/orgs/${notification.metadata.orgId}/invite/reject`);
            toast.info("Invitation rejected");
            toast.dismiss(toastId);
            onDone();
        } catch {
            toast.error("Failed to reject invite");
        }
    };

    return (
        <div className="w-[360px] rounded-2xl border border-white/10 bg-slate-950/90 backdrop-blur-xl shadow-2xl p-4 flex flex-col gap-3">
            <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <span className="text-indigo-400 text-sm font-bold">+</span>
                </div>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-white">
                        {notification.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        {notification.message}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 justify-end">
                <button
                    onClick={handleReject}
                    className="h-7 px-3 rounded-lg text-xs font-medium text-slate-300 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 transition cursor-pointer"
                >
                    Reject
                </button>
                <button
                    onClick={handleAccept}
                    className="h-7 px-3 rounded-lg text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-400 transition cursor-pointer"
                >
                    Accept
                </button>
            </div>
        </div>
    );
}
