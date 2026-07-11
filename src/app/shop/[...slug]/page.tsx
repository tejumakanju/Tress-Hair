import { Suspense } from "react";
import { ShopPageClient } from "@/components/shop/ShopPageClient";

type Props = {
  params: Promise<{ slug?: string[] }>;
};

export default async function ShopCatchAllPage({ params }: Props) {
  const { slug } = await params;
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted">Loading...</div>}>
      <ShopPageClient pathSegments={slug ?? []} />
    </Suspense>
  );
}
