"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { connectWS, subscribeWS } from "../lib/ws";
import { useUserStore } from "../store/userStore";
import { useNotificationStore } from "../store/notificationStore";
import { useNotificationSound } from "../hooks/useNotificationSound";
import { toast } from "sonner";

export function GlobalNotificationListener() {
    const { user, fetchUser, removeOrgFromUser } = useUserStore();
    const { addNotification, fetchNotifications } = useNotificationStore();
    const { playSound } = useNotificationSound();
    const router = useRouter();
    const fetchUserCalled = useRef(false);
    const initialNotificationsFetched = useRef(false);

    useEffect(() => {
        console.log("[GlobalNotificationListener] Initializing...");
        console.log("[GlobalNotificationListener] Current user:", {
            id: user?.id,
            _id: user?._id,
            name: user?.name
        });

        // Don't subscribe until user is loaded
        if (!user?.id && !user?._id) {
            console.log("[GlobalNotificationListener] ⚠️ User not loaded yet, skipping subscription");
            // Only call fetchUser once to prevent infinite loop
            if (!fetchUserCalled.current) {
                console.log("[GlobalNotificationListener] Triggering fetchUser...");
                fetchUserCalled.current = true;
                fetchUser();
            }
            return;
        }

        console.log("[GlobalNotificationListener] ✅ User loaded, setting up WebSocket listener");
        connectWS();

        // Fetch initial notifications from DB on page load
        if (!initialNotificationsFetched.current) {
            console.log("[GlobalNotificationListener] 📥 Fetching initial notifications from DB...");
            initialNotificationsFetched.current = true;
            fetchNotifications().catch(err => {
                console.error("[GlobalNotificationListener] Failed to fetch initial notifications:", err);
            });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const unsubscribe = subscribeWS((event: any) => {
            console.log("[GlobalNotificationListener] 📡 RAW Event received:", event);

            const userId = user?.id || user?._id;
            const eventUserIdStr = String(event.userId);
            const userIdStr = String(userId);

            console.log("[GlobalNotificationListener] 🔍 ID Matching Debug:", {
                eventUserId: event.userId,
                eventUserIdStr: eventUserIdStr,
                currentUserId: userId,
                userIdStr: userIdStr,
                typesMatch: typeof eventUserIdStr === typeof userIdStr,
                valuesMatch: eventUserIdStr === userIdStr,
                eventType: event.type,
                eventData: event.data
            });

            // Handle notification:created events
            if (
                event.type === "notification:created" &&
                eventUserIdStr === userIdStr
            ) {
                console.log("[GlobalNotificationListener] ✅ NOTIFICATION MATCHED! Adding to store:", {
                    notificationId: event.data?._id,
                    notificationType: event.data?.type,
                    notificationTitle: event.data?.title,
                    fullData: event.data
                });
                addNotification(event.data);

                // 🔥 NEW: Instant toast for team invites
                if (event.data.type === "invite") {
                    playSound("invite");
                    toast.custom(
                        (t) => (
                            <InviteNotificationToast
                                toastId={t}
                                notification={event.data}
                                onAccept={async () => {
                                    try {
                                        const { api } = await import("@/lib/api");
                                        await api.post(`/orgs/${event.data.metadata?.orgId}/invite/accept`);
                                        await fetchUser();
                                        toast.success("Invitation accepted");
                                        toast.dismiss(t);
                                    } catch {
                                        toast.error("Failed to accept invite");
                                    }
                                }}
                                onReject={async () => {
                                    try {
                                        const { api } = await import("@/lib/api");
                                        await api.post(`/orgs/${event.data.metadata?.orgId}/invite/reject`);
                                        toast.info("Invitation rejected");
                                        toast.dismiss(t);
                                    } catch {
                                        toast.error("Failed to reject invite");
                                    }
                                }}
                            />
                        ),
                        {
                            duration: Infinity,
                            position: "top-right",
                        }
                    );
                }
                // 🔥 NEW: Instant toast for high-risk alerts
                else if (event.data.type === "alert") {
                    playSound("alert");
                    toast.error(`Alert: ${event.data.title}`, {
                        description: event.data.message,
                        duration: 7000,
                    });
                }

                console.log("[GlobalNotificationListener] Notification added successfully");
            }
            // 🔥 NEW: Handle invite accepted events
            else if (
                event.type === "invite:accepted" &&
                String(event.userId) === String(userId)
            ) {
                console.log("[GlobalNotificationListener] ✅ Invite accepted:", event);
                playSound("success");
                toast.success(`${event.userName || "User"} joined your team!`, {
                    description: `${event.orgName || "Organization"}`,
                    duration: 5000,
                });
            }
            // 🔥 Handle invite rejected events - DISABLED (handled by GlobalToastManager)
            /* else if (
                event.type === "invite:rejected" &&
                String(event.userId) === String(userId)
            ) {
                console.log("[GlobalNotificationListener] ✅ Invite rejected:", event);
                playSound("notification");
                toast.info(`${event.userName || "User"} declined the invite`, {
                    description: `${event.orgName || "Organization"}`,
                    duration: 5000,
                });
            } */
            // Handle org:removed events
            else if (
                event.type === "org:removed" &&
                String(event.userId) === String(userId)
            ) {
                console.log("[GlobalNotificationListener] ✅ User removed from org:", event);

                // Remove org from user's list
                removeOrgFromUser(event.orgId);

                // Get updated state after removal
                const { user: updatedUser, activeOrgId: newActiveOrgId } = useUserStore.getState();

                // Show toast notification
                playSound("alert");
                toast.error(`You have been removed from ${event.orgName}`, {
                    duration: 5000,
                });

                // Navigate based on remaining orgs
                if (updatedUser?.orgIds && updatedUser.orgIds.length > 0) {
                    // User has other orgs, switch to the new active org
                    if (newActiveOrgId) {
                        console.log("[GlobalNotificationListener] Switching to org:", newActiveOrgId);
                        router.push(`/organization/${newActiveOrgId}/repos`);
                    }
                } else {
                    // User has no orgs left, redirect to organization page
                    console.log("[GlobalNotificationListener] No orgs remaining, redirecting to /organization");
                    router.push("/organization");
                }
            } else {
                console.log("[GlobalNotificationListener] ❌ Event not matched:", {
                    reason: event.type !== "notification:created"
                        ? `Wrong event type (got: ${event.type})`
                        : "User ID mismatch",
                    eventType: event.type,
                    expectedType: "notification:created"
                });
            }
        });

        console.log("[GlobalNotificationListener] Listener subscribed");

        return () => {
            console.log("[GlobalNotificationListener] Cleaning up...");
            unsubscribe();
        };
    }, [user?.id, user?._id, addNotification, fetchUser, fetchNotifications, removeOrgFromUser, router, playSound]);
    return null;
}

// Custom toast component for team invites with Accept/Reject buttons
function InviteNotificationToast({
    toastId,
    notification,
    onAccept,
    onReject,
}: {
    toastId: string | number;
    notification: {
        title: string;
        message: string;
        metadata?: { orgId?: string };
    };
    onAccept: () => void;
    onReject: () => void;
}) {
    return (
        <div className="w-[420px] rounded-xl border border-black-500/30 bg-black-950/90 backdrop-blur-xl shadow-2xl p-4 flex items-start gap-3 relative">
            {/* Close button */}
            <button
                onClick={() => {
                    toast.dismiss(toastId);
                }}
                className="absolute top-3 right-3 h-6 w-6 rounded-md flex items-center justify-center text-black-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Close notification"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>

            {/* Icon */}
            <div className="h-10 w-10 rounded-full bg-black-500/20 flex items-center justify-center shrink-0">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-400"
                >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
            </div>

            {/* Content */}
            <div className="flex-1 pr-6">
                <p className="text-sm font-semibold text-white mb-1">
                    {notification.title}
                </p>
                <p className="text-xs text-black-200 mb-3">
                    {notification.message}
                </p>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onReject}
                        className="h-8 px-4 rounded-lg text-xs font-medium text-black-200 bg-white/5 hover:bg-white/10 transition cursor-pointer"
                    >
                        Reject
                    </button>
                    <button
                        onClick={onAccept}
                        className="h-8 px-4 rounded-lg text-xs font-semibold text-white bg-black-500 hover:bg-black-400 transition cursor-pointer"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
}
