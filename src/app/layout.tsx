import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ToastViewport } from "@/components/ui/ToastViewport";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { RecentlyViewedProvider } from "@/lib/recently-viewed-context";
import { ToastProvider } from "@/lib/toast-context";
import { CurrencyProvider } from "@/lib/currency-context";
import { CatalogProvider } from "@/lib/catalog-context";
import { AuthProvider } from "@/lib/auth-context";
import { getCachedCatalog } from "@/lib/data/catalog";
import { getAuthProfile, getAuthUser } from "@/lib/auth";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tressé Hair | Luxury Wigs, Bundles & Frontals",
  description:
    "Premium human hair wigs, bundles, and frontals. Glueless installs, HD lace, and worldwide shipping. Treat yourself to true luxury.",
  keywords: [
    "luxury wigs",
    "human hair bundles",
    "HD lace frontals",
    "glueless wigs",
    "Tressé Hair",
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tressé Hair",
  },
  formatDetection: {
    telephone: true,
    email: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [products, initialUser, initialProfile] = await Promise.all([
    getCachedCatalog(),
    getAuthUser(),
    getAuthProfile(),
  ]);

  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <ToastProvider>
          <AuthProvider
            initialUser={initialUser}
            initialProfile={initialProfile}
          >
            <CurrencyProvider>
              <CatalogProvider products={products}>
                <CartProvider>
                  <WishlistProvider>
                    <RecentlyViewedProvider>
                      <AnnouncementBar />
                      <Header />
                      <main className="flex-1">{children}</main>
                      <Footer />
                      <CartDrawer />
                      <ToastViewport />
                    </RecentlyViewedProvider>
                  </WishlistProvider>
                </CartProvider>
              </CatalogProvider>
            </CurrencyProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
