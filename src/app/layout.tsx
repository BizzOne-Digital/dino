import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { Toaster } from "sonner";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Dino's Cookies & Bagels | Organic Home-Baked Goods",
  description:
    "Organic sourdough bagels, chocolate chip cookies, and handcrafted bakes. Pickup and local delivery in the GTA.",
  openGraph: {
    title: "Dino's Cookies & Bagels",
    description: "Wildly Fresh. Naturally Baked.",
    url: siteUrl,
    siteName: "Dino's Cookies & Bagels",
    locale: "en_CA",
    type: "website",
    images: [{ url: "/images/logo.jpg", width: 1200, height: 630, alt: "Dino's Cookies & Bagels" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dino's Cookies & Bagels",
    description: "Wildly Fresh. Naturally Baked.",
    images: ["/images/logo.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover" as const,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`}>
      <body className="min-h-screen">
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster position="top-center" richColors closeButton />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
