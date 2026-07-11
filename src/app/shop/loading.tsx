import { ProductGridSkeleton } from "@/components/ui/states";

export default function ShopLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="text-center mb-10 animate-pulse">
        <div className="h-8 bg-cream w-56 mx-auto mb-3" />
        <div className="h-3 bg-cream w-28 mx-auto" />
      </div>
      <div className="flex gap-8">
        <div className="hidden lg:block w-56 shrink-0 animate-pulse space-y-3">
          <div className="h-4 bg-cream w-20" />
          <div className="h-32 bg-cream" />
          <div className="h-4 bg-cream w-24" />
          <div className="h-24 bg-cream" />
        </div>
        <div className="flex-1">
          <ProductGridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
}
