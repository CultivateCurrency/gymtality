import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { BackgroundAudio } from "@/components/background-audio";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gymtality — Train Your Body. Master Your Mind.",
  description: "Gymtality is a complete fitness platform with AI-powered workouts, mindset coaching, live streaming, music curation, and community — built for members and coaches.",
  keywords: ["fitness app", "gym platform", "AI coach", "live streaming workouts", "mindset coaching", "workout tracker", "online gym", "gymtality"],
  authors: [{ name: "Gymtality" }],
  metadataBase: new URL("https://gymtality.fit"),
  openGraph: {
    title: "Gymtality — Train Your Body. Master Your Mind.",
    description: "AI-powered workouts, mindset coaching, live streaming, music, and community — all in one platform.",
    url: "https://gymtality.fit",
    siteName: "Gymtality",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Gymtality — Complete Fitness Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gymtality — Train Your Body. Master Your Mind.",
    description: "AI-powered workouts, mindset coaching, live streaming, music, and community.",
    images: ["/og-image.png"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-orange-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">
          Skip to main content
        </a>
        <BackgroundAudio />
        <Providers>{children}</Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
