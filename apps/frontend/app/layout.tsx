import type { Metadata } from "next";
import { fontHeading, fontBody } from "./fonts";
import "./globals.css";
import AutoCleanup from "../components/Auth/AutoCleanupScript";



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
    <html lang="en">
      <body
        className={`${fontHeading.variable} ${fontBody.variable} antialiased bg-slate-100 text-slate-900`}
      >
        <AutoCleanup />
        {children}
      </body>
    </html>
  );
}
