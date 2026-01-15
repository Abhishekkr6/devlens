"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useNotificationStore } from "@/store/notificationStore";
import { useNotificationSound } from "@/hooks/useNotificationSound";

export function NotificationToaster() {
    const notifications = useNotificationStore((s) => s.notifications);
    const [initialized, setInitialized] = useState(false);
    const shownRef = useRef(new Set<string>());
    const { playSound } = useNotificationSound();

    // Load shown toasts from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("shownGeneralToasts");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                shownRef.current = new Set(parsed);
            } catch (e) {
                console.error("Failed to parse shownGeneralToasts", e);
            }
        }
        setInitialized(true);
    }, []);

    useEffect(() => {
        if (!initialized) return;

        // Skip one-time toast types (handled by GlobalToastManager)
        const skipTypes = ["Invite Accepted", "Invite Rejected", "Member Left"];

        notifications.forEach((n) => {
            if (n.read) return;
            if (shownRef.current.has(n._id)) return;

            // Skip if it's a one-time toast type
            if (skipTypes.includes(n.title)) return;

            shownRef.current.add(n._id);
            localStorage.setItem("shownGeneralToasts", JSON.stringify(Array.from(shownRef.current)));

            // 🔥 NEW: Play sound based on notification type
            if (n.type === "invite") {
                playSound("invite");
            } else if (n.type === "alert") {
                playSound("alert");
            } else if (n.type === "success") {
                playSound("success");
            } else {
                playSound("notification");
            }

            toast(n.title, {
                description: n.message,
                position: "bottom-right",
                duration: 5000,
            });
        });
    }, [notifications, initialized, playSound]);

    return null;
}
