"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useNotificationStore } from "../store/notificationStore";

/**
 * Manages one-time toast notifications for specific notification types
 * These toasts will only show once, even after page refresh
 */
export function GlobalToastManager() {
    const notifications = useNotificationStore((s) => s.notifications);
    const shown = useRef(new Set<string>());

    useEffect(() => {
        // Load previously shown toasts from localStorage on mount
        const shownToasts = JSON.parse(localStorage.getItem("shownToasts") || "[]");
        shown.current = new Set(shownToasts);
    }, []);

    useEffect(() => {
        // One-time toast types that should only appear once
        const oneTimeToastTypes = ["Invite Accepted", "Invite Rejected", "Member Left"];

        notifications.forEach((n) => {
            // Skip if not a one-time toast type
            if (!oneTimeToastTypes.includes(n.title)) {
                return;
            }

            // Skip if already shown
            if (shown.current.has(n._id)) {
                return;
            }

            // Show toast based on notification type
            if (n.title === "Invite Accepted") {
                toast.success(n.title, {
                    description: n.message,
                    duration: 5000,
                });
            } else if (n.title === "Invite Rejected") {
                toast.error(n.title, {
                    description: n.message,
                    duration: 5000,
                });
            } else if (n.title === "Member Left") {
                toast.info(n.title, {
                    description: n.message,
                    duration: 5000,
                });
            }

            // Mark as shown
            shown.current.add(n._id);
            const shownToasts = Array.from(shown.current);
            localStorage.setItem("shownToasts", JSON.stringify(shownToasts));
        });
    }, [notifications]);

    return null;
}
