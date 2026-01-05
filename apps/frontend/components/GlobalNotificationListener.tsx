"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { connectWS, subscribeWS } from "../lib/ws";
import { useUserStore } from "../store/userStore";
import { useNotificationStore } from "../store/notificationStore";
import { toast } from "sonner";

export function GlobalNotificationListener() {
    const { user, fetchUser, removeOrgFromUser, activeOrgId } = useUserStore();
    const { addNotification } = useNotificationStore();
    const router = useRouter();

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
            console.log("[GlobalNotificationListener] Triggering fetchUser...");
            fetchUser();
            return;
        }

        console.log("[GlobalNotificationListener] ✅ User loaded, setting up WebSocket listener");
        connectWS();

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
                console.log("[GlobalNotificationListener] Notification added successfully");
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
                    reason: !["notification:created", "org:removed"].includes(event.type)
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
    }, [user?.id, user?._id, addNotification, fetchUser, removeOrgFromUser, activeOrgId, router]);

    return null;
}
