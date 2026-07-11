import Image from "next/image";
import { Button } from "@/components/ui/Button";

export function PromoBanner() {
  return (
    <section className="relative h-[50vh] md:h-[60vh] min-h-[400px] overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1920&h=800&fit=crop"
        alt="Make your hair dreams a sweet reality"
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-noir/50" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
        <h2 className="font-serif text-2xl md:text-4xl lg:text-5xl tracking-[0.1em] uppercase leading-tight mb-2">
          Make Your Hair Dreams
        </h2>
        <h2 className="font-serif text-2xl md:text-4xl lg:text-5xl tracking-[0.1em] uppercase text-champagne-light mb-8">
          A Sweet Reality
        </h2>
        <Button href="/shop" variant="outline" size="lg" className="bg-white border-white text-noir hover:bg-noir hover:text-white hover:border-noir">
          Shop Now
        </Button>
      </div>
    </section>
  );
}
