import type { Metadata } from "next";
import { fontHeading, fontBody } from "./fonts";
import "./globals.css";
import AutoCleanup from "../components/Auth/AutoCleanupScript";
import SmoothScroll from "../components/SmoothScroll";
import ThemeToggle from "../components/ThemeToggle";



export const metadata: Metadata = {
  title: "TeamPulse",
  description: "Real-time developer activity and insights",
};

const ThemeScript = () => (
  <script
    dangerouslySetInnerHTML={{
      __html: `
        (function() {
          try {
            // Force Dark Mode for ALL visitors
            localStorage.setItem('theme', 'dark');
            document.documentElement.setAttribute('data-theme', 'dark');
          } catch (e) {}
        })();
      `,
    }}
  />
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${fontHeading.variable} ${fontBody.variable} antialiased bg-background text-text-primary transition-colors duration-300`}
      >
        <div className="fixed bottom-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <AutoCleanup />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
