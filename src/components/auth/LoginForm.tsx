"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isValidEmail, normalizeEmail } from "@/lib/auth";
import { mapAuthError } from "@/lib/auth-errors";
import { getUserError, UserCopy, UserErrorCode } from "@/lib/user-errors";
import { useToast } from "@/lib/toast-context";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";
  const pendingConfirm = searchParams.get("confirmed") === "pending";
  const prefillEmail = searchParams.get("email") || "";
  const callbackError = searchParams.get("error") === "auth_callback";
  const { toast } = useToast();

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(
    callbackError
      ? getUserError(UserErrorCode.AUTH_SESSION).inline
      : null
  );
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);

  const emailOk = isValidEmail(email);
  const passwordOk = password.length > 0;
  const canSubmit = emailOk && passwordOk && !submitting;

  const missingHint = useMemo(() => {
    if (canSubmit || submitting) return null;
    const missing: string[] = [];
    if (!emailOk) missing.push("a valid email");
    if (!passwordOk) missing.push("your password");
    if (missing.length === 0) return null;
    return `Add ${missing.join(" and ")} to continue.`;
  }, [canSubmit, submitting, emailOk, passwordOk]);

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError(getUserError(UserErrorCode.VALIDATION_REQUIRED).inline);
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError(getUserError(UserErrorCode.VALIDATION_EMAIL).inline);
      return;
    }
    setEmailError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    validateEmail();
    if (!password) {
      setPasswordError(getUserError(UserErrorCode.VALIDATION_REQUIRED).inline);
      return;
    }
    setPasswordError(null);
    if (!canSubmit) return;

    setSubmitting(true);
    setFormError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizeEmail(email),
        password,
      });
      if (error) throw error;
      toast(UserCopy.AUTH_SIGNED_IN, "success");
      router.replace(next);
      router.refresh();
    } catch (err) {
      setFormError(getUserError(mapAuthError(err)).inline);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    validateEmail();
    if (!isValidEmail(email)) return;
    setResetting(true);
    setFormError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(
        normalizeEmail(email),
        {
          redirectTo: `${window.location.origin}/auth/callback?next=/account`,
        }
      );
      if (error) throw error;
      toast(UserCopy.AUTH_RESET_SENT, "info");
    } catch (err) {
      setFormError(getUserError(mapAuthError(err)).inline);
    } finally {
      setResetting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {pendingConfirm ? (
        <p className="text-xs text-champagne-dark bg-cream border border-border px-3 py-2.5 leading-relaxed">
          {getUserError(UserErrorCode.AUTH_EMAIL_UNCONFIRMED).description}
        </p>
      ) : null}

      <FormField
        id="login-email"
        label="Email"
        required
        type="email"
        value={email}
        onChange={(v) => {
          setEmail(v);
          if (emailError) setEmailError(null);
        }}
        onBlur={validateEmail}
        autoComplete="email"
        error={emailError}
      />

      <FormField
        id="login-password"
        label="Password"
        required
        type="password"
        value={password}
        onChange={(v) => {
          setPassword(v);
          if (passwordError) setPasswordError(null);
        }}
        autoComplete="current-password"
        error={passwordError}
      />

      <div className="flex justify-end -mt-2">
        <button
          type="button"
          onClick={handleReset}
          disabled={resetting}
          className="text-xs text-muted hover:text-noir underline underline-offset-2 disabled:opacity-50"
        >
          {resetting ? "Sending…" : "Forgot password?"}
        </button>
      </div>

      {formError ? (
        <p className="text-xs text-crimson leading-relaxed" role="alert">
          {formError}
        </p>
      ) : null}

      <div>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className={cn("w-full", !canSubmit && "opacity-50 cursor-not-allowed")}
          disabled={!canSubmit}
        >
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
        {missingHint ? (
          <p className="text-xs text-muted text-center mt-2">{missingHint}</p>
        ) : null}
      </div>

      <p className="text-xs text-muted text-center">
        New here?{" "}
        <Link
          href={`/account/signup?next=${encodeURIComponent(next)}`}
          className="text-noir underline underline-offset-2"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
