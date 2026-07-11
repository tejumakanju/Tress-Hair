import { Button } from "@/components/ui/Button";

function SimplePage({
  title,
  body,
  ctaHref = "/shop",
  ctaLabel = "Shop Now",
}: {
  title: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="font-serif text-3xl tracking-[0.15em] uppercase mb-4">{title}</h1>
      <p className="text-sm text-muted leading-relaxed mb-8">{body}</p>
      <Button href={ctaHref} variant="outline" size="md">
        {ctaLabel}
      </Button>
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <SimplePage
      title="Collections"
      body="Explore curated edits — bestsellers, new arrivals, glueless, and seasonal drops."
      ctaHref="/shop"
    />
  );
}
