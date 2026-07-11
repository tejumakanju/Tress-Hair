import { Suspense } from "react";
import { ShopPageClient } from "@/components/shop/ShopPageClient";
import { PageLoadingFallback } from "@/components/ui/states";

type Props = {
  params: Promise<{ slug?: string[] }>;
};

export const revalidate = 60;

export default async function ShopCatchAllPage({ params }: Props) {
  const { slug } = await params;
  return (
    <Suspense fallback={<PageLoadingFallback label="Loading shop…" />}>
      <ShopPageClient pathSegments={slug ?? []} />
    </Suspense>
  );
}
