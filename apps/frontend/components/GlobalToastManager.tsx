"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useNotificationStore } from "../store/notificationStore";

/**
 * Manages one-time toast notifications for specific notification types
 * These toasts will only show once, even after page refresh
 */
export function GlobalToastManager() {
    const notifications = useNotificationStore((s) => s.notifications);
    const [initialized, setInitialized] = useState(false);
    const shownToastsRef = useRef<Set<string>>(new Set());

    // Load shown toasts from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("shownToasts");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                shownToastsRef.current = new Set(parsed);
            } catch (e) {
                console.error("Failed to parse shownToasts from localStorage", e);
            }
        }
        setInitialized(true);
    }, []);

    useEffect(() => {
        // Don't run until localStorage is loaded
        if (!initialized) return;

        // One-time toast types that should only appear once
        const oneTimeToastTypes = ["Invite Accepted", "Invite Rejected", "Member Left"];

        notifications.forEach((n) => {
            // Skip if not a one-time toast type
            if (!oneTimeToastTypes.includes(n.title)) {
                return;
            }

            // Skip if already shown
            if (shownToastsRef.current.has(n._id)) {
                return;
            }

            console.log("[GlobalToastManager] Showing one-time toast:", n.title, n._id);

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
            shownToastsRef.current.add(n._id);
            localStorage.setItem("shownToasts", JSON.stringify(Array.from(shownToastsRef.current)));
        });
    }, [notifications, initialized]);

    return null;
}
