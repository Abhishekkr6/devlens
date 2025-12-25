import { Sora, Inter } from "next/font/google";

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
