import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const newsreader = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2",
      style: "normal",
      weight: "200 800",
    },
    {
      path: "../../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-italic.woff2",
      style: "italic",
      weight: "200 800",
    },
  ],
  variable: "--font-newsreader",
  display: "swap",
});
const spaceGrotesk = localFont({
  src: "../../node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2",
  variable: "--font-space-grotesk",
  weight: "300 700",
  display: "swap",
});
const jetbrainsMono = localFont({
  src: "../../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
  variable: "--font-jetbrains-mono",
  weight: "100 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Protocol // NIT Warangal IEEE",
  description:
    "An interactive mystery investigation by NIT Warangal IEEE Student Branch.",
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
  themeColor: "#141514",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#141514] text-[#f4f1ea] font-sans antialiased selection:bg-[#c93b2b] selection:text-[#f4f1ea]">
        {children}
      </body>
    </html>
  );
}
