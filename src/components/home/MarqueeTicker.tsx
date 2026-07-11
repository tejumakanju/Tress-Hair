export function MarqueeTicker() {
  const text =
    "SECURE CHECKOUT WITH FLUTTERWAVE  ·  LAGOS & NATIONWIDE DELIVERY  ·  ";

  return (
    <div className="bg-noir text-white py-3 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap text-[10px] md:text-xs tracking-[0.3em] uppercase font-sans">
        <span className="inline-block px-4">{text.repeat(4)}</span>
        <span className="inline-block px-4">{text.repeat(4)}</span>
      </div>
    </div>
  );
}
