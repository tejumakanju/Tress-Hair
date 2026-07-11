import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoadingState } from "@/components/ui/states";

export const metadata = {
  title: "Sign in | Tressé Hair",
};

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-20">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl tracking-[0.15em] uppercase mb-3">
          Sign in
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          Welcome back. Access your orders and saved pieces.
        </p>
      </div>
      <Suspense fallback={<LoadingState label="Loading…" className="py-10" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
