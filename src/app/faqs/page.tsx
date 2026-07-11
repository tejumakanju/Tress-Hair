import { Button } from "@/components/ui/Button";

const faqs = [
  {
    q: "How long does shipping take?",
    a: "Lagos metro: 1–2 business days (Kwik / local rider). Nationwide Nigeria: 2–5 business days (GIG Logistics). International express: 5–10 business days (DHL).",
  },
  {
    q: "How much is shipping?",
    a: "Lagos metro and nationwide Nigeria rates are shown at checkout. International express uses DHL and is priced separately.",
  },
  {
    q: "Which couriers do you use?",
    a: "In Lagos we use Kwik Delivery or a local rider. Outside Lagos we ship with GIG Logistics. International orders go via DHL Express.",
  },
  {
    q: "How do I track my order?",
    a: "After dispatch you’ll get a tracking number and courier link. You can also view tracking under Account → Orders.",
  },
  {
    q: "What is your return policy?",
    a: "30-day returns on unworn wigs with lace intact and unopened bundles.",
  },
  {
    q: "What is HD lace?",
    a: "HD lace is an ultra-thin, transparent lace that melts into any skin tone for an undetectable hairline.",
  },
];

export default function FaqsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-serif text-3xl tracking-[0.15em] uppercase text-center mb-10">FAQs</h1>
      <div className="space-y-6">
        {faqs.map((item) => (
          <div key={item.q} className="border-b border-border pb-6">
            <h2 className="text-sm tracking-wide uppercase mb-2">{item.q}</h2>
            <p className="text-sm text-muted leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
      <div className="text-center mt-10">
        <Button href="/contact" variant="outline" size="md">Still need help?</Button>
      </div>
    </div>
  );
}
