import { NextResponse } from "next/server";
import {
  initializeFlutterwavePayment,
  resolveChargeCurrency,
  siteUrl,
} from "@/lib/flutterwave";
import { FALLBACK_RATES, type CurrencyCode } from "@/lib/currency";

export const runtime = "nodejs";

type InitBody = {
  txRef: string;
  amountUsd: number;
  currency: string;
  /** Amount already converted to `currency` (preferred when currency is FLW-supported) */
  amount?: number;
  email: string;
  name: string;
  phone?: string;
  meta?: Record<string, string>;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as InitBody;

    if (!body.txRef || !body.email || !body.name) {
      return NextResponse.json(
        { error: "txRef, email, and name are required" },
        { status: 400 }
      );
    }

    if (!(body.amountUsd > 0)) {
      return NextResponse.json(
        { error: "A valid amount is required" },
        { status: 400 }
      );
    }

    const requested = (body.currency || "NGN").toUpperCase();
    const currency = resolveChargeCurrency(requested);

    let amount: number;
    if (
      typeof body.amount === "number" &&
      body.amount > 0 &&
      currency === requested
    ) {
      amount = body.amount;
    } else {
      const rate =
        FALLBACK_RATES[currency as CurrencyCode] ?? FALLBACK_RATES.NGN;
      amount = body.amountUsd * rate;
    }

    const chargeAmount =
      currency === "NGN" ? Math.round(amount) : Math.round(amount * 100) / 100;

    if (chargeAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid charge amount" },
        { status: 400 }
      );
    }

    const result = await initializeFlutterwavePayment({
      tx_ref: body.txRef,
      amount: chargeAmount,
      currency,
      redirect_url: `${siteUrl()}/checkout/callback`,
      customer: {
        email: body.email,
        name: body.name,
        phonenumber: body.phone || undefined,
      },
      meta: {
        amount_usd: String(body.amountUsd),
        ...body.meta,
      },
    });

    return NextResponse.json({
      link: result.data!.link,
      txRef: body.txRef,
      amount: chargeAmount,
      currency,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment init failed";
    console.error("[flutterwave/initialize]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
