import type { Metadata } from "next";
import { fontHeading, fontBody, fontLogo } from "./fonts";
import "./globals.css";
import AutoCleanup from "../components/Auth/AutoCleanupScript";
import SmoothScroll from "../components/SmoothScroll";
import { Toaster } from "sonner";
import { GlobalNotificationListener } from "../components/GlobalNotificationListener";
import { NotificationToaster } from "../components/NotificationToaster";
import { GlobalToastManager } from "../components/GlobalToastManager";

export const metadata: Metadata = {
  title: "DevLens | Developer Activity & Insights",
  description: "Real-time developer activity and insights",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontHeading.variable} ${fontBody.variable} ${fontLogo.variable} antialiased bg-background text-text-primary transition-colors duration-300`}
      >
        <AutoCleanup />
        <SmoothScroll />

        {/* WS → Store */}
        <GlobalNotificationListener />

        {/* Store → Toast */}
        <NotificationToaster />

        {/* One-time toast manager */}
        <GlobalToastManager />

        {/* Sonner UI */}
        <Toaster
          position="bottom-right"
          richColors
          expand
          closeButton
          toastOptions={{
            className: 'font-body',
            style: {
              zIndex: 9999, // 🔥 Ensure toasts appear above all content
              fontFamily: 'var(--font-body)' // 🔥 Apply website font family
            }
          }}
        />

        {/* GlobalInviteToaster removed - now using top-right notification in GlobalNotificationListener */}



        {children}
      </body>
    </html>
  );
}
