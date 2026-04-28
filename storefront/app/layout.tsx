import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SupportWidget from "@/components/SupportWidget";
import FloatingCart from "@/components/FloatingCart";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
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
