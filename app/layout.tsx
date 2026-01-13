import type { Metadata } from "next";
import { Noto_Serif, Figtree } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ConfigProvider } from "@/contexts/ConfigContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { GoogleAuthProviderWrapper } from "@/components/providers/GoogleAuthProviderWrapper";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

import ScrollToTopButton from "@/components/ui/ScrollToTopButton";

// Noto Serif for News Titles
const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-serif",
  display: "swap",
});

// Figtree for UI and Body text
const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Fluxor | Breaking News, Politics, Sports, Technology",
  description: "Stay informed with the latest global news covering breaking news, politics, sports, technology, business, entertainment, and local news.",
  keywords: "news, breaking news, politics, sports, technology, business, entertainment, local news",
  authors: [{ name: "Fluxor Team" }],
  icons: {
    icon: '/icon.png',
  },
  // Base metadata URL for correct OG images
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://fluxor.news'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Placeholder IDs - User validation required
  const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-DB7YPRBVP4';
  const adSenseId = process.env.NEXT_PUBLIC_ADSENSE_ID || 'ca-pub-PLACEHOLDER';

  return (
    <html lang="en" className={`${notoSerif.variable} ${figtree.variable} font-sans`} suppressHydrationWarning>
      <body className="antialiased bg-white dark:bg-editorial-dark-bg text-editorial-light-text-primary dark:text-editorial-dark-text-primary" suppressHydrationWarning>

        {/* Google Analytics */}
        <GoogleAnalytics gaId={gaId} />

        {/* Google AdSense */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseId}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConfigProvider>
            <GoogleAuthProviderWrapper>
              {children}
            </GoogleAuthProviderWrapper>
            <ScrollToTopButton />
          </ConfigProvider>
        </ThemeProvider>

      </body>
    </html>
  );
}
