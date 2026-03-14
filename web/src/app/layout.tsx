import type { Metadata } from "next";
import LayoutClient from "@/components/LayoutClient";
import "./globals.css";

const baseUrl = "https://researchdefence.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "World Signals",
  description:
    "Mobile-first tactical dashboard for global markets, FX, macro news, maps, and discussion.",
  openGraph: {
    title: "World Signals",
    description:
      "Mobile-first tactical dashboard for global markets, FX, macro news, maps, and discussion.",
    url: baseUrl,
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
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
