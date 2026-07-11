import { HeroBanner } from "@/components/home/HeroBanner";
import { MarqueeTicker } from "@/components/home/MarqueeTicker";
import { BrandIntro } from "@/components/home/BrandIntro";
import { ProductGrid } from "@/components/home/ProductGrid";
import { CollectionCards } from "@/components/home/CollectionCards";
import { PromoBanner } from "@/components/home/PromoBanner";
import { Testimonials } from "@/components/home/Testimonials";
import { TrustBadges } from "@/components/home/TrustBadges";
import { SocialFeed } from "@/components/home/SocialFeed";
import { Newsletter } from "@/components/home/Newsletter";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { collections, testimonials } from "@/lib/data/products";
import {
  getCachedCatalog,
  getFeaturedFromCatalog,
  getNewArrivalsFromCatalog,
} from "@/lib/data/catalog";

export const revalidate = 60;

export default async function Home() {
  const catalog = await getCachedCatalog();
  const featuredProducts = getFeaturedFromCatalog(catalog);
  const newArrivals = getNewArrivalsFromCatalog(catalog);

  return (
    <>
      <HeroBanner />
      <MarqueeTicker />
      <BrandIntro />
      <ProductGrid
        title="Bestsellers"
        subtitle="From closures to frontals, bundles to wigs — we've got you covered."
        products={featuredProducts}
        viewAllHref="/shop?sort=best-selling"
      />
      <CollectionCards collections={collections} />
      <ProductGrid
        title="New Arrivals"
        subtitle="Fresh drops landing weekly. Be the first to slay."
        products={newArrivals}
        viewAllHref="/shop?sort=newest"
      />
      <PromoBanner />
      <ProductGrid
        title="Trending Styles"
        subtitle="What everyone's talking about right now."
        products={[...featuredProducts].reverse()}
        viewAllHref="/shop?sort=trending"
      />
      <RecentlyViewed />
      <Testimonials testimonials={testimonials} />
      <TrustBadges />
      <SocialFeed />
      <Newsletter />
    </>
  );
}
