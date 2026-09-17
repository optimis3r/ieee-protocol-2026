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
  title: "IEEE Protocol: The Network",
  description: "Interactive ARG Progressive Web App for IEEE Network Operatives.",
  applicationName: "IEEE Protocol",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "IEEE Protocol",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e2030",
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
      <body className="min-h-full flex flex-col bg-cat-mantle text-cat-text selection:bg-cat-sapphire selection:text-cat-crust font-sans">
        {children}
      </body>
    </html>
  );
}
