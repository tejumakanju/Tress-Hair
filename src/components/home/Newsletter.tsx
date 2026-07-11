"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function Newsletter() {
  const [email, setEmail] = useState("");

  return (
    <section className="py-16 md:py-20 px-4 bg-noir text-white">
      <div className="max-w-xl mx-auto text-center">
        <p className="text-[10px] tracking-[0.4em] uppercase text-champagne mb-3">
          Stay in the Loop
        </p>
        <h2 className="font-serif text-2xl md:text-3xl tracking-[0.15em] uppercase mb-4">
          Join the Tressé List
        </h2>
        <p className="text-sm text-white/60 mb-8">
          Be first to know about new drops, exclusive sales, and styling tips
          from our community.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-champagne transition-colors"
          />
          <Button type="submit" variant="secondary" size="md" className="shrink-0">
            Subscribe
          </Button>
        </form>
      </div>
    </section>
  );
}
