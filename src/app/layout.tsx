import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SettingsProvider } from "@/components/ThemeProvider";
import Script from "next/script";
import VisitorTracker from "@/components/VisitorTracker";
import InstallPrompt from "@/components/InstallPrompt";

export const metadata: Metadata = {
  title: "اليومي - Dhikr Reader",
  description: "A premium Arabic Dhikr reader app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "اليومي",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
  themeColor: "#1B5E20",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="ltr" translate="no">
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <VisitorTracker />
        <InstallPrompt />
        <SettingsProvider>
          {children}
        </SettingsProvider>
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js');
          }
        `}</Script>
      </body>
    </html>
  );
}
