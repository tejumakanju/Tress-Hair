import Image from "next/image";
import Link from "next/link";
import { Share2 } from "lucide-react";

const socialPosts = [
  "https://images.unsplash.com/photo-1595476108010-b334629e7782?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1616683693504-3ea7e5ad6dcc?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1522336572462-8b3bdd7510a3?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop",
];

export function SocialFeed() {
  return (
    <section className="py-16 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-champagne-dark mb-3">
            <Share2 className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[10px] tracking-[0.3em] uppercase">@tressehair</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl tracking-[0.15em] uppercase">
            Follow Our Journey
          </h2>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-1 md:gap-2">
          {socialPosts.map((src, i) => (
            <Link
              key={i}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square overflow-hidden group"
            >
              <Image
                src={src}
                alt={`Instagram post ${i + 1}`}
                fill
                sizes="(max-width: 768px) 33vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-noir/0 group-hover:bg-noir/30 transition-colors flex items-center justify-center">
                <Share2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
