"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { UserCopy } from "@/lib/user-errors";

export default function AccountPage() {
  const { user, profile, ready, signOut } = useAuth();
  const { toast } = useToast();

  if (!ready) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-sm text-muted">Loading account…</p>
      </div>
    );
  }

  if (user) {
    const name =
      [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
      null;

    return (
      <div className="max-w-md mx-auto px-4 py-16 md:py-20">
        <h1 className="font-serif text-3xl tracking-[0.15em] uppercase text-center mb-3">
          Account
        </h1>
        <p className="text-sm text-muted text-center mb-10">
          {name ? `Signed in as ${name}` : `Signed in as ${user.email}`}
        </p>

        <div className="space-y-3 mb-10">
          <div className="border border-border bg-white px-4 py-3">
            <p className="text-[10px] tracking-[0.15em] uppercase text-muted mb-1">
              Email
            </p>
            <p className="text-sm">{user.email}</p>
          </div>
          {profile?.phone ? (
            <div className="border border-border bg-white px-4 py-3">
              <p className="text-[10px] tracking-[0.15em] uppercase text-muted mb-1">
                Phone
              </p>
              <p className="text-sm">{profile.phone}</p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <Button href="/account/orders" variant="primary" size="md">
            View orders
          </Button>
          <Button href="/wishlist" variant="outline" size="md">
            Wishlist
          </Button>
          <Button href="/shop" variant="outline" size="md">
            Continue shopping
          </Button>
          <button
            type="button"
            onClick={async () => {
              await signOut();
              toast(UserCopy.AUTH_SIGNED_OUT, "info");
            }}
            className="text-xs tracking-[0.15em] uppercase text-muted hover:text-noir py-2"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <h1 className="font-serif text-3xl tracking-[0.15em] uppercase mb-4">
        Account
      </h1>
      <p className="text-sm text-muted mb-8 leading-relaxed">
        Create an account to save your wishlist and checkout faster — or
        continue as a guest anytime.
      </p>
      <div className="flex flex-col gap-3">
        <Button href="/account/signup" variant="primary" size="md">
          Create account
        </Button>
        <Button href="/account/login" variant="outline" size="md">
          Sign in
        </Button>
        <Button href="/checkout" variant="outline" size="md">
          Continue as guest
        </Button>
        <Link
          href="/account/orders"
          className="text-xs text-muted underline underline-offset-2 pt-2"
        >
          View local orders
        </Link>
      </div>
    </div>
  );
}
