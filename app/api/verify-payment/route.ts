import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { PaymentOrdersTable } from "@/src/schema";
import { addCredits, getCredits } from "@/services/credits.service";
import { getRazorpayCredentials } from "@/lib/razorpay";

function signaturesMatch(expectedHex: string, receivedHex: string) {
  const expected = Buffer.from(expectedHex, "hex");
  const received = Buffer.from(receivedHex, "hex");
  if (expected.length !== received.length) {
    return false;
  }
  return crypto.timingSafeEqual(expected, received);
}

export async function POST(req: NextRequest) {
  try {
    const { keySecret } = getRazorpayCredentials();
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const razorpay_payment_id = body.razorpay_payment_id;
    const razorpay_order_id = body.razorpay_order_id;
    const razorpay_signature = body.razorpay_signature;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "razorpay_payment_id, razorpay_order_id, and razorpay_signature are required" },
        { status: 400 }
      );
    }

    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (!signaturesMatch(expected, String(razorpay_signature))) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const rows = await db
      .select()
      .from(PaymentOrdersTable)
      .where(eq(PaymentOrdersTable.razorpayOrderId, String(razorpay_order_id)));

    const order = rows[0];
    if (!order || order.email !== email) {
      return NextResponse.json({ error: "Order not found" }, { status: 400 });
    }

    if (order.status === "paid") {
      return NextResponse.json({
        ok: true,
        status: "paid",
        credits: await getCredits(email),
        alreadyProcessed: true,
      });
    }

    const updatedUser = await addCredits(email, order.credits, {
      type: "purchase",
      reference: String(razorpay_payment_id),
      note: `${order.packId} pack`,
    });
    await db
      .update(PaymentOrdersTable)
      .set({
        status: "paid",
        razorpayPaymentId: String(razorpay_payment_id),
      })
      .where(eq(PaymentOrdersTable.razorpayOrderId, String(razorpay_order_id)));

    return NextResponse.json({
      ok: true,
      status: "paid",
      credits: updatedUser?.credits ?? (await getCredits(email)),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PAYMENT_PROVIDER_MISCONFIGURED") {
      return NextResponse.json(
        { error: "payment provider misconfigured" },
        { status: 500 }
      );
    }
    console.error("verify-payment failed", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
