"use client";

import Topbar from "./Topbar";
import { useEffect } from "react";
import { useLiveStore } from "../../store/liveStore";
import { ChatbotWidget } from "../ai/ChatbotWidget";

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
    <div className="relative min-h-screen bg-background text-text-primary">
      {/* Absolute Ambient Background Lights for Premium Dashboard Vibe */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
      
      <Topbar />
      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* AI Guide Assistant */}
      <ChatbotWidget />
    </div>
  );
}
