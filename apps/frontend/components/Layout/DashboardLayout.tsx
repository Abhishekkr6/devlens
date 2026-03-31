"use client";

import Topbar from "./Topbar";
import { useEffect } from "react";
import { useLiveStore } from "../../store/liveStore";
import { ChatbotWidget } from "../ai/ChatbotWidget";

import { DashboardBackground } from "./DashboardBackground";

let hasBootstrapped = false;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (hasBootstrapped) return;
    hasBootstrapped = true;

    useLiveStore.getState().init();
    // Intentionally not auto-fetching user here to prevent update loops
  }, []);

  return (
    <div className="relative min-h-screen text-text-primary">
      {/* Animated Matrix/Scanner Background for Dashboard */}
      <DashboardBackground />
      
      <Topbar />
      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* AI Guide Assistant */}
      <ChatbotWidget />
    </div>
  );
}
