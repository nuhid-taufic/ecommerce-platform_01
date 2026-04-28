import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SupportWidget from "@/components/SupportWidget";
import FloatingCart from "@/components/FloatingCart";
import TrafficTracker from "./components/TrafficTracker";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | STUDIO.",
    default: "STUDIO. | Premium Essentials & Aesthetics",
  },
  description:
    "Curating the finest essentials for design-conscious individuals worldwide. Shop premium minimalist products, from cosmetics to tech accessories.",
  openGraph: {
    title: "STUDIO. | Premium Essentials",
    description:
      "Curating the finest essentials for design-conscious individuals worldwide.",
    url: "https://studio-ecommerce.com",
    siteName: "STUDIO.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80", // Replace with actual OG image later
        width: 1200,
        height: 630,
        alt: "STUDIO. Premium Store",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "STUDIO. | Premium Essentials",
    description:
      "Curating the finest essentials for design-conscious individuals worldwide.",
    images: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success) {
      settings = data.settings;
    }
  } catch (e) {
    console.error("Failed to fetch settings", e);
  }

  if (settings?.isMaintenanceMode) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <div className="min-h-screen flex flex-col items-center justify-center bg-primary text-white p-6 text-center">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
              We'll be back soon
            </h1>
            <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto">
              {settings?.storeName || "Our store"} is currently undergoing scheduled maintenance. 
              We're improving your experience and will be back online shortly.
            </p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{settings?.browserTitle || "STUDIO. | Premium Essentials & Aesthetics"}</title>
        {settings?.faviconUrl && <link rel="icon" href={settings.faviconUrl} />}
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            ${settings?.colors?.primary ? `--primary-color: ${settings.colors.primary};` : ''}
            ${settings?.colors?.secondary ? `--secondary-color: ${settings.colors.secondary};` : ''}
            ${settings?.colors?.optional ? `--accent-color: ${settings.colors.optional};` : ''}
          }
        `}} />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <TrafficTracker />
        
        {settings?.showAnnouncement && (
          <div className="bg-primary text-white text-xs font-bold uppercase tracking-widest py-2 px-4 text-center">
            {settings.announcementLink ? (
              <a href={settings.announcementLink} className="hover:opacity-80 transition-opacity">
                {settings.announcementText}
              </a>
            ) : (
              settings.announcementText
            )}
          </div>
        )}

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#0f172a",
              color: "#fff",
              borderRadius: "12px",
              fontWeight: "bold",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />

        {}
        <Navbar />

        {}
        <main>{children}</main>
        <Footer />
        <SupportWidget />
        <FloatingCart />
      </body>
    </html>
  );
}
