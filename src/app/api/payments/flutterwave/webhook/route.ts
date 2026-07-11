import { NextResponse } from "next/server";
import { verifyFlutterwaveTransaction } from "@/lib/flutterwave";

export const runtime = "nodejs";

/**
 * Flutterwave webhook — configure URL in dashboard:
 * {SITE_URL}/api/payments/flutterwave/webhook
 * Set FLW_SECRET_HASH to the secret hash from Flutterwave settings.
 */
export async function POST(req: Request) {
  try {
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = req.headers.get("verif-hash");

    if (secretHash && signature !== secretHash) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = await req.json();
    const data = event?.data;
    const transactionId = data?.id;

    if (!transactionId) {
      return NextResponse.json({ received: true });
    }

    // Always re-verify with Flutterwave — never trust webhook body alone
    const verified = await verifyFlutterwaveTransaction(transactionId);
    const paid =
      verified.status === "success" && verified.data?.status === "successful";

    console.log("[flutterwave/webhook]", {
      event: event?.event,
      txRef: verified.data?.tx_ref,
      paid,
    });

    // Orders are currently client-persisted; webhook logs for ops.
    // When Supabase orders are wired, mark payment_status = paid here.

    return NextResponse.json({ received: true, paid });
  } catch (err) {
    console.error("[flutterwave/webhook]", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
