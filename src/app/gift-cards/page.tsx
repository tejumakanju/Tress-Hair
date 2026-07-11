import { Button } from "@/components/ui/Button";

export default function GiftCardsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="font-serif text-3xl tracking-[0.15em] uppercase mb-4">Gift Cards</h1>
      <p className="text-sm text-muted mb-8">
        Give the gift of glam. Digital gift cards coming soon — in the meantime, shop bestsellers for someone special.
      </p>
      <Button href="/shop?sort=best-selling" variant="primary" size="md">Shop Bestsellers</Button>
    </div>
  );
}
