import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";

type ProductGridProps = {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
};

export function ProductGrid({
  title,
  subtitle,
  products,
  viewAllHref,
}: ProductGridProps) {
  return (
    <section className="py-16 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-2xl md:text-3xl tracking-[0.15em] uppercase mb-3">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted max-w-lg mx-auto">{subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {viewAllHref && (
          <div className="text-center mt-12">
            <Button href={viewAllHref} variant="outline" size="md">
              View All
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
