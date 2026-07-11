import { ProductCardSkeleton } from "@/components/ui/states";

export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
        <div className="aspect-[4/5] bg-cream" />
        <div className="space-y-4 pt-4">
          <div className="h-3 bg-cream w-24" />
          <div className="h-8 bg-cream w-3/4" />
          <div className="h-4 bg-cream w-32" />
          <div className="h-20 bg-cream w-full" />
          <div className="h-12 bg-cream w-full" />
        </div>
      </div>
      <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
