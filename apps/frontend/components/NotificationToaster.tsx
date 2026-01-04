"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useNotificationStore } from "@/store/notificationStore";

export function NotificationToaster() {
    const notifications = useNotificationStore((s) => s.notifications);
    const shown = useRef(new Set<string>());

    useEffect(() => {
        notifications.forEach((n) => {
            if (n.read) return;
            if (shown.current.has(n._id)) return;

            shown.current.add(n._id);

            toast(n.title, {
                description: n.message,
                position: "bottom-right",
                duration: 5000,
            });
        });
    }, [notifications]);

    return null;
}
