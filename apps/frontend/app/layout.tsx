import type { Metadata } from "next";
import { fontHeading, fontBody } from "./fonts";
import "./globals.css";
import AutoCleanup from "../components/Auth/AutoCleanupScript";
import SmoothScroll from "../components/SmoothScroll";
import { Toaster } from "sonner";
import { GlobalNotificationListener } from "../components/GlobalNotificationListener";
import { NotificationToaster } from "../components/NotificationToaster";
import { GlobalInviteToaster } from "../components/GlobalInviteToaster";

export const metadata: Metadata = {
  title: "TeamPulse | Developer Activity & Insights",
  description: "Real-time developer activity and insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontHeading.variable} ${fontBody.variable} antialiased bg-background text-text-primary transition-colors duration-300`}
      >
        <AutoCleanup />
        <SmoothScroll />

        {/* WS → Store */}
        <GlobalNotificationListener />

        {/* Store → Toast */}
        <NotificationToaster />

        {/* Sonner UI */}
        <Toaster position="bottom-right" richColors expand />

        <GlobalInviteToaster />


        {children}
      </body>
    </html>
  );
}
