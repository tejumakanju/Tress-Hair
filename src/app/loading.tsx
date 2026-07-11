import { ProductGridSkeleton } from "@/components/ui/states";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="text-center mb-10 animate-pulse">
        <div className="h-8 bg-cream w-48 mx-auto mb-3" />
        <div className="h-3 bg-cream w-24 mx-auto" />
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  );
}
