import { Suspense } from "react";
import { ShopPageClient } from "@/components/shop/ShopPageClient";
import { PageLoadingFallback } from "@/components/ui/states";

export const revalidate = 60;

export default function ShopPage() {
  return (
    <Suspense fallback={<PageLoadingFallback label="Loading shop…" />}>
      <ShopPageClient />
    </Suspense>
  );
}
