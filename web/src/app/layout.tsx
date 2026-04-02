import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Orbitron, Source_Serif_4 } from "next/font/google";
import LayoutClient from "@/components/LayoutClient";
import SessionProvider from "@/components/SessionProvider";
import ThemeProvider from "@/components/ThemeProvider";
import { isNextAuthEnabled } from "@/lib/authEnabled.server";
import { getSiteOrigin } from "@/lib/siteUrl";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-board",
  weight: ["500", "600", "700"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mkt-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-editorial",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteOrigin = getSiteOrigin();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#030304" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: "World Signals",
  description:
    "Mobile-first tactical dashboard for global markets, FX, macro news, maps, and discussion.",
  openGraph: {
    title: "World Signals",
    description:
      "Mobile-first tactical dashboard for global markets, FX, macro news, maps, and discussion.",
    url: siteOrigin,
    siteName: "World Signals",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "World Signals",
    description:
      "Mobile-first tactical dashboard for global markets, FX, macro news, maps, and discussion.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authEnabled = isNextAuthEnabled();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${orbitron.variable} ${ibmPlexMono.variable} ${sourceSerif4.variable} min-h-screen bg-neutral-50 text-neutral-900 antialiased dark:bg-[#030304] dark:text-zinc-100`}
      >
        <ThemeProvider>
          {authEnabled ? (
            <SessionProvider>
              <LayoutClient authEnabled>{children}</LayoutClient>
            </SessionProvider>
          ) : (
            <LayoutClient authEnabled={false}>{children}</LayoutClient>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
