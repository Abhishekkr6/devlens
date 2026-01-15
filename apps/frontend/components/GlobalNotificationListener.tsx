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
    const { addNotification } = useNotificationStore();
    const { playSound } = useNotificationSound();
    const router = useRouter();
    const fetchUserCalled = useRef(false);

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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const unsubscribe = subscribeWS((event: any) => {
            console.log("[GlobalNotificationListener] Event received:", event);

            const userId = user?.id || user?._id;
            console.log("[GlobalNotificationListener] Checking event:", {
                eventType: event.type,
                eventUserId: event.userId,
                currentUserId: userId,
                match: String(event.userId) === String(userId)
            });

            // Handle notification:created events
            if (
                event.type === "notification:created" &&
                String(event.userId) === String(userId)
            ) {
                console.log("[GlobalNotificationListener] ✅ Adding notification to store:", event.data);
                addNotification(event.data);

                // 🔥 NEW: Instant toast for team invites
                if (event.data.type === "invite") {
                    playSound("invite");
                    toast.info(`Team Invite: ${event.data.title}`, {
                        description: event.data.message,
                        duration: 7000,
                        action: {
                            label: "View",
                            onClick: () => router.push("/notifications")
                        }
                    });
                }
                // 🔥 NEW: Instant toast for high-risk alerts
                else if (event.data.type === "alert") {
                    playSound("alert");
                    toast.error(`Alert: ${event.data.title}`, {
                        description: event.data.message,
                        duration: 7000,
                        action: {
                            label: "View",
                            onClick: () => {
                                const orgId = event.data.metadata?.orgId;
                                if (orgId) {
                                    router.push(`/organization/${orgId}/alerts`);
                                }
                            }
                        }
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
            // 🔥 NEW: Handle invite rejected events
            else if (
                event.type === "invite:rejected" &&
                String(event.userId) === String(userId)
            ) {
                console.log("[GlobalNotificationListener] ✅ Invite rejected:", event);
                playSound("notification");
                toast.info(`${event.userName || "User"} declined the invite`, {
                    description: `${event.orgName || "Organization"}`,
                    duration: 5000,
                });
            }
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
                console.log("[GlobalNotificationListener] ❌ Event ignored:", {
                    reason: !["notification:created", "org:removed", "invite:accepted", "invite:rejected"].includes(event.type)
                        ? "Wrong event type"
                        : "User ID mismatch"
                });
            }
        });

        console.log("[GlobalNotificationListener] Listener subscribed");

        return () => {
            console.log("[GlobalNotificationListener] Cleaning up...");
            unsubscribe();
        };
    }, [user?.id, user?._id, addNotification, fetchUser, removeOrgFromUser, router, playSound]);
    return null;
}
