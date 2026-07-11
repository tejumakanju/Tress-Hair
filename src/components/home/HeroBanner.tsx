import Image from "next/image";
import { Button } from "@/components/ui/Button";

export function HeroBanner() {
  return (
    <section className="relative h-[70vh] md:h-[85vh] min-h-[500px] overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1920&h=1080&fit=crop"
        alt="Featured bestsellers collection"
        fill
        priority
        sizes="100vw"
        className="object-cover object-top"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-noir/60 via-noir/20 to-transparent" />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
        <p className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-champagne-light mb-4 animate-fade-up">
          Featured Collection
        </p>
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl tracking-[0.15em] uppercase mb-4 animate-fade-up">
          Bestsellers
        </h1>
        <p className="text-sm md:text-base text-white/80 max-w-md mb-8 tracking-wide animate-fade-up">
          Shop our most-loved wigs before they&apos;re gone
        </p>
        <Button
          href="/shop?sort=best-selling"
          variant="outline"
          size="lg"
          className="animate-fade-up bg-white border-white text-noir hover:bg-noir hover:text-white hover:border-noir"
        >
          Shop Now
        </Button>
      </div>
    </section>
  );
}
