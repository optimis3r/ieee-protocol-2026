import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Protocol // NIT Warangal IEEE Student Branch",
  description: "An interactive mystery ARG where every player has a role. Enter. Investigate. Decide.",
  applicationName: "The Protocol",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "The Protocol",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0f0d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-proto-obsidian text-proto-text selection:bg-proto-signal selection:text-proto-obsidian font-sans">
        {children}
      </body>
    </html>
  );
}
