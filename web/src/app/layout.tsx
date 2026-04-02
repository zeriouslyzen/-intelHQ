import type { Metadata } from "next";
import { IBM_Plex_Mono, Orbitron, Source_Serif_4 } from "next/font/google";
import LayoutClient from "@/components/LayoutClient";
import SessionProvider from "@/components/SessionProvider";
import ThemeProvider from "@/components/ThemeProvider";
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

const baseUrl = "https://researchdefence.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "/katanx",
  description:
    "Mobile-first tactical dashboard for global markets, FX, macro news, maps, and discussion.",
  openGraph: {
    title: "/katanx",
    description:
      "Mobile-first tactical dashboard for global markets, FX, macro news, maps, and discussion.",
    url: baseUrl,
    siteName: "/katanx",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "/katanx",
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${orbitron.variable} ${ibmPlexMono.variable} ${sourceSerif4.variable} min-h-screen bg-neutral-50 text-neutral-900 antialiased dark:bg-[#030304] dark:text-zinc-100`}
      >
        <ThemeProvider>
          <SessionProvider>
            <LayoutClient>{children}</LayoutClient>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
