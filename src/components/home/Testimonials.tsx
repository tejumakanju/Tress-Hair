import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Testimonial = {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  product: string;
};

type TestimonialsProps = {
  testimonials: Testimonial[];
};

export function Testimonials({ testimonials }: TestimonialsProps) {
  return (
    <section className="py-16 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-[0.4em] uppercase text-champagne-dark mb-3">
            Real Reviews
          </p>
          <h2 className="font-serif text-2xl md:text-3xl tracking-[0.15em] uppercase">
            What Our Queens Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <blockquote
              key={item.id}
              className="bg-white border border-border p-6 md:p-8 flex flex-col"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-4 h-4",
                      i < item.rating
                        ? "fill-champagne text-champagne"
                        : "text-border"
                    )}
                    strokeWidth={0}
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-charcoal flex-1 mb-6">
                &ldquo;{item.text}&rdquo;
              </p>
              <footer>
                <cite className="not-italic text-sm font-medium block">
                  {item.name}
                </cite>
                <span className="text-xs text-muted">{item.location}</span>
                <span className="text-[10px] text-champagne-dark tracking-wide uppercase block mt-1">
                  {item.product}
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
