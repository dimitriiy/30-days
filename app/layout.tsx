import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlassNotificationProvider } from "@/components/glass-notification";
import { httpGet } from "@/lib/api";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dimedrol App",
  description: "",
};
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:8080";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GlassNotificationProvider position="top-right">
          {children}
        </GlassNotificationProvider>
      </body>
    </html>
  );
}
