import { Sora, Inter, Space_Grotesk } from "next/font/google";

export const fontHeading = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const fontLogo = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-logo",
  weight: ["700"],
  display: "swap",
});
