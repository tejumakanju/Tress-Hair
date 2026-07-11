import { Shield, Truck, RotateCcw, CreditCard } from "lucide-react";

const badges = [
  {
    icon: Shield,
    title: "Secure Payment",
    description: "256-bit SSL encryption",
  },
  {
    icon: Truck,
    title: "Nigeria Shipping",
    description: "Lagos 1–2 days · Nationwide 2–5",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "30-day return policy",
  },
  {
    icon: CreditCard,
    title: "Secure Checkout",
    description: "Pay with Flutterwave",
  },
];

export function TrustBadges() {
  return (
    <section className="py-12 px-4 border-y border-border bg-white">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {badges.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex flex-col items-center text-center">
            <Icon className="w-6 h-6 text-champagne-dark mb-3" strokeWidth={1.5} />
            <h3 className="text-xs tracking-[0.15em] uppercase mb-1">{title}</h3>
            <p className="text-[11px] text-muted">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
