import { Button } from "@/components/ui/Button";

export default function OurStoryPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-[10px] tracking-[0.4em] uppercase text-champagne-dark mb-3">Our Story</p>
      <h1 className="font-serif text-3xl tracking-[0.15em] uppercase mb-6">Tressé Hair</h1>
      <p className="text-sm text-muted leading-relaxed mb-8">
        Born from a love of luxury hair and effortless glam, Tressé Hair sources premium human hair
        for women who expect nothing less than perfection — from HD lace melts to ready-to-wear glueless installs.
      </p>
      <Button href="/shop" variant="outline" size="md">Shop the Collection</Button>
    </div>
  );
}
