"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { connectWS, subscribeWS } from "../lib/ws";
import { useUserStore } from "../store/userStore";
import { Button } from "./Ui/Button";

export function GlobalNotificationListener() {
    const { user } = useUserStore();
    const router = useRouter();

    useEffect(() => {
        // Ensure connection
        connectWS();

        const unsubscribe = subscribeWS((event: any) => {
            // 1. Check if event is a notification for THIS user
            if (event.type === "notification:created" && event.userId === user?.id) {
                const notif = event.data;

                // 2. Show Toast with Action
                toast(notif.title, {
                    description: notif.message,
                    action: notif.link ? {
                        label: "View",
                        onClick: () => router.push(notif.link),
                    } : undefined,
                    duration: 5000,
                    position: "bottom-right", // User request: bottom right
                });
            }
        });

        return () => {
            unsubscribe();
        };
    }, [user?.id, router]);

    return null; // This component renders nothing, just handles side effects
}
