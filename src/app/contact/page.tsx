"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/toast-context";

export default function ContactPage() {
  const { toast } = useToast();
  const [sent, setSent] = useState(false);

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <h1 className="font-serif text-3xl tracking-[0.15em] uppercase text-center mb-4">Get in Touch</h1>
      <p className="text-sm text-muted text-center mb-8">
        Questions about orders, installs, or wholesale? We&apos;re here.
      </p>
      {sent ? (
        <p className="text-center text-sm text-champagne-dark">Thanks — we&apos;ll be in touch shortly.</p>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
            toast("Message sent");
          }}
        >
          <input required type="text" placeholder="Name" className="w-full px-3 py-2.5 text-sm border border-border focus:outline-none focus:border-champagne" />
          <input required type="email" placeholder="Email" className="w-full px-3 py-2.5 text-sm border border-border focus:outline-none focus:border-champagne" />
          <textarea required placeholder="Message" className="w-full px-3 py-2.5 text-sm border border-border focus:outline-none focus:border-champagne h-32 resize-none" />
          <Button type="submit" variant="primary" size="lg" className="w-full">Send Message</Button>
        </form>
      )}
    </div>
  );
}
