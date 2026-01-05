"use client";

import { useEffect } from "react";
import { connectWS, subscribeWS } from "../lib/ws";
import { useUserStore } from "../store/userStore";
import { useNotificationStore } from "../store/notificationStore";

export function GlobalNotificationListener() {
    const { user } = useUserStore();
    const { addNotification } = useNotificationStore();

    useEffect(() => {
        console.log("[GlobalNotificationListener] Initializing...");
        console.log("[GlobalNotificationListener] Current user:", {
            id: user?.id,
            _id: user?._id,
            name: user?.name
        });

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

            if (
                event.type === "notification:created" &&
                String(event.userId) === String(userId)
            ) {
                console.log("[GlobalNotificationListener] ✅ Adding notification to store:", event.data);
                addNotification(event.data);
                console.log("[GlobalNotificationListener] Notification added successfully");
            } else {
                console.log("[GlobalNotificationListener] ❌ Event ignored:", {
                    reason: event.type !== "notification:created"
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
    }, [user?.id, user?._id, addNotification]);

    return null;
}
