import { NextResponse } from "next/server";
import { verifyFlutterwaveTransaction } from "@/lib/flutterwave";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get("transaction_id");
    const txRef = searchParams.get("tx_ref");
    const expectedAmount = searchParams.get("amount");
    const expectedCurrency = searchParams.get("currency");

    if (!transactionId) {
      return NextResponse.json(
        { error: "transaction_id is required", paid: false },
        { status: 400 }
      );
    }

    const result = await verifyFlutterwaveTransaction(transactionId);
    const data = result.data;

    if (!data) {
      return NextResponse.json(
        { error: result.message || "No transaction data", paid: false },
        { status: 400 }
      );
    }

    const statusOk =
      result.status === "success" && data.status === "successful";
    const refOk = !txRef || data.tx_ref === txRef;
    const amountOk =
      !expectedAmount ||
      Math.abs(Number(data.amount) - Number(expectedAmount)) < 0.01 ||
      Math.abs(Number(data.charged_amount) - Number(expectedAmount)) < 1;
    const currencyOk =
      !expectedCurrency ||
      data.currency?.toUpperCase() === expectedCurrency.toUpperCase();

    const paid = Boolean(statusOk && refOk && amountOk && currencyOk);

    return NextResponse.json({
      paid,
      status: data.status,
      txRef: data.tx_ref,
      flwRef: data.flw_ref,
      transactionId: data.id,
      amount: data.amount,
      chargedAmount: data.charged_amount,
      currency: data.currency,
      paymentType: data.payment_type,
      checks: { statusOk, refOk, amountOk, currencyOk },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed";
    console.error("[flutterwave/verify]", message);
    return NextResponse.json({ error: message, paid: false }, { status: 500 });
  }
}
