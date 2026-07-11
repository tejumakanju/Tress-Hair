import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Collection = {
  title: string;
  href: string;
  image: string;
};

type CollectionCardsProps = {
  collections: Collection[];
};

export function CollectionCards({ collections }: CollectionCardsProps) {
  return (
    <section className="py-16 md:py-20 px-4 bg-cream">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-serif text-2xl md:text-3xl tracking-[0.15em] uppercase text-center mb-12">
          Shop by Collection
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {collections.map((collection) => (
            <Link
              key={collection.title}
              href={collection.href}
              className="group relative aspect-[3/4] overflow-hidden"
            >
              <Image
                src={collection.image}
                alt={collection.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-noir/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between text-white">
                <span className="font-serif text-xl md:text-2xl tracking-[0.2em] uppercase">
                  {collection.title}
                </span>
                <ArrowRight
                  className="w-5 h-5 transition-transform group-hover:translate-x-1"
                  strokeWidth={1.5}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
