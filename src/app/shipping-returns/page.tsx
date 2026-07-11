import { Button } from "@/components/ui/Button";
import { SHIPPING_METHODS } from "@/lib/shipping";

export default function ShippingReturnsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-serif text-3xl tracking-[0.15em] uppercase text-center mb-4">
        Shipping & Returns
      </h1>
      <p className="text-sm text-muted text-center mb-12 leading-relaxed">
        We ship from Nigeria with trusted local and international partners.
        Rates are calculated at checkout.
      </p>

      <section className="mb-12">
        <h2 className="text-xs tracking-[0.15em] uppercase mb-6">Delivery zones</h2>
        <div className="space-y-6">
          {SHIPPING_METHODS.map((method) => (
            <div key={method.id} className="border-b border-border pb-6">
              <h3 className="text-sm tracking-wide uppercase mb-1">{method.label}</h3>
              <p className="text-sm text-muted leading-relaxed mb-2">
                {method.description}
              </p>
              <p className="text-xs text-muted">
                {method.eta} · via {method.courier}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xs tracking-[0.15em] uppercase mb-4">Tracking</h2>
        <p className="text-sm text-muted leading-relaxed">
          Once your order ships, you’ll receive a courier name and tracking number.
          You can also check status under Account → Orders.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-xs tracking-[0.15em] uppercase mb-4">Returns</h2>
        <p className="text-sm text-muted leading-relaxed">
          30-day returns on unworn wigs with lace intact and unopened bundles.
          Contact us within 30 days of delivery to start a return. Return shipping
          within Nigeria is covered on defective items; international return postage
          is the customer’s responsibility unless we made an error.
        </p>
      </section>

      <div className="text-center">
        <Button href="/contact" variant="outline" size="md">
          Questions? Contact us
        </Button>
      </div>
    </div>
  );
}
