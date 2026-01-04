"use client";

import { useEffect } from "react";
import { connectWS, subscribeWS } from "../lib/ws";
import { useUserStore } from "../store/userStore";
import { useNotificationStore } from "../store/notificationStore";

export function GlobalNotificationListener() {
    const { user } = useUserStore();
    const { addNotification } = useNotificationStore();

    useEffect(() => {
        connectWS();

        const unsubscribe = subscribeWS((event: any) => {
            const userId = user?.id || user?._id;
            if (
                event.type === "notification:created" &&
                String(event.userId) === String(userId)
            ) {
                addNotification(event.data);
            }
        });

        return () => unsubscribe();
    }, [user?.id, user?._id, addNotification]);

    return null;
}
