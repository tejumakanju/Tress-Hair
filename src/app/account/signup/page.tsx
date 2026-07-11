import { Suspense } from "react";
import { SignupForm } from "@/components/auth/SignupForm";
import { LoadingState } from "@/components/ui/states";

export const metadata = {
  title: "Create account | Tressé Hair",
};

export default function SignupPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-20">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl tracking-[0.15em] uppercase mb-3">
          Create account
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          Save your wishlist, track orders, and checkout faster. Guest checkout
          stays available anytime.
        </p>
      </div>
      <Suspense fallback={<LoadingState label="Loading…" className="py-10" />}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
