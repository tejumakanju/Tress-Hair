export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl tracking-[0.15em] uppercase mb-4">Settings</h1>
      <div className="bg-white border border-border p-6 max-w-lg space-y-4 text-sm">
        <div><span className="text-muted block text-xs mb-1">Store Name</span> Tressé Hair</div>
        <div><span className="text-muted block text-xs mb-1">Currency</span> USD catalog · NGN checkout</div>
        <div><span className="text-muted block text-xs mb-1">Shipping</span> Lagos $5 · Nationwide $10 · Intl $45</div>
        <div><span className="text-muted block text-xs mb-1">VAT (NG)</span> 7.5%</div>
      </div>
    </div>
  );
}
