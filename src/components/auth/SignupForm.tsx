"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  isValidEmail,
  normalizeEmail,
  passwordRulesMet,
} from "@/lib/auth";
import { mapAuthError } from "@/lib/auth-errors";
import { getUserError, UserCopy, UserErrorCode } from "@/lib/user-errors";
import { useToast } from "@/lib/toast-context";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { PasswordRules } from "@/components/auth/PasswordRules";
import { cn } from "@/lib/utils";

const FIRST_NAME_MAX = 40;

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const emailOk = isValidEmail(email);
  const passwordOk = passwordRulesMet(password);
  const canSubmit = emailOk && passwordOk && !submitting;

  const missingHint = useMemo(() => {
    if (canSubmit || submitting) return null;
    const missing: string[] = [];
    if (!emailOk) missing.push("a valid email");
    if (!passwordOk) missing.push("a password that meets the rules");
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
    setPasswordTouched(true);
    if (!canSubmit) return;

    setSubmitting(true);
    setFormError(null);

    try {
      const supabase = createClient();
      const normalized = normalizeEmail(email);
      const { data, error } = await supabase.auth.signUp({
        email: normalized,
        password,
        options: {
          data: {
            first_name: firstName.trim() || undefined,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (error) throw error;

      // If email confirmation is disabled, session may exist immediately
      if (data.session) {
        toast(UserCopy.AUTH_SIGNED_UP_READY, "success");
        router.replace(next);
        router.refresh();
        return;
      }

      toast(UserCopy.AUTH_SIGNED_UP, "success");
      router.replace(
        `/account/login?confirmed=pending&email=${encodeURIComponent(normalized)}`
      );
    } catch (err) {
      const code = mapAuthError(err);
      setFormError(getUserError(code).inline);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <FormField
        id="signup-email"
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
        id="signup-first-name"
        label="First name"
        value={firstName}
        onChange={setFirstName}
        autoComplete="given-name"
        maxLength={FIRST_NAME_MAX}
        showCount
        hint="Optional — we use this on order confirmations."
      />

      <div>
        <FormField
          id="signup-password"
          label="Password"
          required
          type="password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            setPasswordTouched(true);
          }}
          onBlur={() => setPasswordTouched(true)}
          autoComplete="new-password"
          error={
            passwordTouched && password.length > 0 && !passwordOk
              ? getUserError(UserErrorCode.AUTH_WEAK_PASSWORD).inline
              : null
          }
        />
        <PasswordRules password={password} />
      </div>

      {formError ? (
        <p className="text-xs text-crimson leading-relaxed" role="alert">
          {formError}{" "}
          {formError.includes("already exists") ? (
            <Link
              href={`/account/login?next=${encodeURIComponent(next)}`}
              className="underline underline-offset-2"
            >
              Sign in
            </Link>
          ) : null}
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
          {submitting ? "Creating account…" : "Create account"}
        </Button>
        {missingHint ? (
          <p className="text-xs text-muted text-center mt-2">{missingHint}</p>
        ) : null}
      </div>

      <p className="text-xs text-muted text-center">
        Already have an account?{" "}
        <Link
          href={`/account/login?next=${encodeURIComponent(next)}`}
          className="text-noir underline underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
