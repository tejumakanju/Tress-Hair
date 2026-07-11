"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { SuccessState } from "@/components/ui/states";
import { useToast } from "@/lib/toast-context";
import {
  getUserError,
  UserCopy,
  UserErrorCode,
} from "@/lib/user-errors";
import {
  isValidEmail,
  normalizeEmail,
  requiredMessage,
} from "@/lib/form-utils";
import { cn } from "@/lib/utils";

const NAME_MAX = 80;
const MESSAGE_MAX = 1000;

export default function ContactPage() {
  const { toast } = useToast();
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{
    name?: string | null;
    email?: string | null;
    message?: string | null;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  const nameOk = name.trim().length > 0;
  const emailOk = isValidEmail(email);
  const messageOk = message.trim().length > 0;
  const canSubmit = nameOk && emailOk && messageOk && !submitting;

  const missingHint = useMemo(() => {
    if (canSubmit || submitting) return null;
    const missing: string[] = [];
    if (!nameOk) missing.push("your name");
    if (!emailOk) missing.push("a valid email");
    if (!messageOk) missing.push("a message");
    if (missing.length === 0) return null;
    return `Add ${missing.join(", ").replace(/, ([^,]*)$/, " and $1")} to continue.`;
  }, [canSubmit, submitting, nameOk, emailOk, messageOk]);

  const validateName = () => {
    setErrors((e) => ({
      ...e,
      name: name.trim() ? null : requiredMessage(),
    }));
  };

  const validateEmailField = () => {
    if (!email.trim()) {
      setErrors((e) => ({ ...e, email: requiredMessage() }));
      return;
    }
    if (!isValidEmail(email)) {
      setErrors((e) => ({
        ...e,
        email: getUserError(UserErrorCode.VALIDATION_EMAIL).inline,
      }));
      return;
    }
    setErrors((e) => ({ ...e, email: null }));
  };

  const validateMessage = () => {
    setErrors((e) => ({
      ...e,
      message: message.trim() ? null : requiredMessage(),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateName();
    validateEmailField();
    validateMessage();
    if (!canSubmit) return;

    setSubmitting(true);
    // Client-side for now — wire to API/email later
    void normalizeEmail(email);
    setSent(true);
    toast(UserCopy.CONTACT_SENT);
    setSubmitting(false);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <h1 className="font-serif text-3xl tracking-[0.15em] uppercase text-center mb-4">
        Get in Touch
      </h1>
      <p className="text-sm text-muted text-center mb-8">
        Questions about orders, installs, or wholesale? We&apos;re here.
      </p>
      {sent ? (
        <SuccessState
          title="Message sent"
          description="Thanks — we’ll be in touch shortly."
          actions={[{ label: "Back to shop", href: "/shop" }]}
          className="py-8"
        />
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <FormField
            id="contact-name"
            label="Name"
            required
            value={name}
            onChange={(v) => {
              setName(v);
              if (errors.name) setErrors((e) => ({ ...e, name: null }));
            }}
            onBlur={validateName}
            autoComplete="name"
            maxLength={NAME_MAX}
            showCount
            error={errors.name}
          />
          <FormField
            id="contact-email"
            label="Email"
            required
            type="email"
            value={email}
            onChange={(v) => {
              setEmail(v);
              if (errors.email) setErrors((e) => ({ ...e, email: null }));
            }}
            onBlur={validateEmailField}
            autoComplete="email"
            error={errors.email}
          />
          <FormField
            as="textarea"
            id="contact-message"
            label="Message"
            required
            value={message}
            onChange={(v) => {
              setMessage(v);
              if (errors.message) setErrors((e) => ({ ...e, message: null }));
            }}
            onBlur={validateMessage}
            maxLength={MESSAGE_MAX}
            showCount
            rows={5}
            error={errors.message}
          />
          <div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className={cn(
                "w-full",
                !canSubmit && "opacity-50 cursor-not-allowed"
              )}
              disabled={!canSubmit}
            >
              {submitting ? "Sending…" : "Send Message"}
            </Button>
            {missingHint ? (
              <p className="text-xs text-muted text-center mt-2">{missingHint}</p>
            ) : null}
          </div>
        </form>
      )}
    </div>
  );
}
