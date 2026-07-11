import { Suspense } from "react";
import { ShopPageClient } from "@/components/shop/ShopPageClient";

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted">Loading...</div>}>
      <ShopPageClient />
    </Suspense>
  );
}
