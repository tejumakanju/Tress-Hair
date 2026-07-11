import { Button } from "@/components/ui/Button";

export default function AccountPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <h1 className="font-serif text-3xl tracking-[0.15em] uppercase mb-4">Account</h1>
      <p className="text-sm text-muted mb-8">
        Sign in coming soon. You can still checkout as a guest — we&apos;ll email your order confirmation.
      </p>
      <div className="flex flex-col gap-3">
        <Button href="/checkout" variant="primary" size="md">Continue as Guest</Button>
        <Button href="/account/orders" variant="outline" size="md">View Local Orders</Button>
      </div>
    </div>
  );
}
