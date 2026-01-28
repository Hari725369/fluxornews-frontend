import type { Metadata } from "next";
import { Noto_Serif, Figtree } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ConfigProvider } from "@/contexts/ConfigContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "react-hot-toast";
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

// Static metadata removed in favor of dynamic generateMetadata below


export async function generateMetadata(): Promise<Metadata> {
  // Fetch dynamic config
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  try {
    const res = await fetch(`${API_URL}/config`, { next: { revalidate: 3600 } }); // Revalidate every hour
    const data = await res.json();
    const config = data?.data?.siteIdentity;

    const siteName = config?.siteName || "Fluxor News";
    const description = config?.siteDescription || "Stay informed with the latest global news covering breaking news, politics, sports, technology, business, entertainment, and local news.";
    const keywords = config?.siteKeywords || "news, breaking news, politics, sports, technology, business, entertainment, local news";

    return {
      title: {
        default: siteName,
        template: `%s | ${siteName}`,
      },
      description: description,
      keywords: keywords,
      authors: [{ name: `${siteName} Team` }],
      icons: {
        icon: '/icon.png',
      },
      metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://fluxor.news'),
      openGraph: {
        title: {
          default: siteName,
          template: `%s | ${siteName}`,
        },
        description: description,
        siteName: siteName,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: {
          default: siteName,
          template: `%s | ${siteName}`,
        },
        description: description,
      },
    };
  } catch (error) {
    console.error('Failed to fetch site config for metadata:', error);
    return {
      title: 'Fluxor News',
      description: 'Global News Platform',
    };
  }
}

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

        <ConfigProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <GoogleAuthProviderWrapper>
              {children}
            </GoogleAuthProviderWrapper>
            <Toaster
              position="bottom-center"
              reverseOrder={false}
              gutter={8}
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#333',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '12px 24px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
                success: {
                  style: {
                    background: '#10B981', // Tailwind green-500
                    color: '#fff',
                  },
                  iconTheme: {
                    primary: '#fff',
                    secondary: '#10B981',
                  },
                },
                error: {
                  style: {
                    background: '#EF4444', // Tailwind red-500
                    color: '#fff',
                  },
                },
              }}
            />
            <ScrollToTopButton />
          </ThemeProvider>
        </ConfigProvider>

      </body>
    </html>
  );
}
