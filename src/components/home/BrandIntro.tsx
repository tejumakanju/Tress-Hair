import { Button } from "@/components/ui/Button";

export function BrandIntro() {
  return (
    <section className="py-20 md:py-28 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-[10px] tracking-[0.4em] uppercase text-champagne-dark mb-4">
          Lush Locks
        </p>
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-wide uppercase mb-6 leading-tight">
          Treat Yourself to True Luxury
        </h2>
        <p className="text-muted text-sm md:text-base leading-relaxed mb-8 max-w-xl mx-auto">
          Indulge in premium human hair extensions sourced from the finest
          vendors worldwide. From sleek bone-straight bundles to voluminous
          body wave wigs — every piece is crafted for durability, natural
          movement, and head-turning glamour.
        </p>
        <Button href="/our-story" variant="outline" size="md">
          Learn More
        </Button>
      </div>
    </section>
  );
}
