import type { Metadata } from "next";
import { fontHeading, fontBody } from "./fonts";
import "./globals.css";
import AutoCleanup from "../components/Auth/AutoCleanupScript";
import SmoothScroll from "../components/SmoothScroll";




export const metadata: Metadata = {
  title: "TeamPulse",
  description: "Real-time developer activity and insights",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>

      </head>
      <body
        className={`${fontHeading.variable} ${fontBody.variable} antialiased bg-background text-text-primary transition-colors duration-300`}
      >

        <AutoCleanup />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
