import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { PaymentOrdersTable } from "@/src/schema";
import { CREDIT_PACKS, type CreditPackId } from "@/shared/credits";
import {
  getRazorpayClient,
  getRazorpayCredentials,
  razorpayCurrency,
  razorpayErrorDescription,
  razorpayHttpStatus,
  withRazorpayRetry,
} from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const { keyId } = getRazorpayCredentials();
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const packId = body.pack as CreditPackId;
    const pack = CREDIT_PACKS[packId];

    if (!pack) {
      return NextResponse.json({ error: "Unknown credit pack" }, { status: 400 });
    }

    const currency = razorpayCurrency();
    if (!currency) {
      return NextResponse.json(
        { error: "currency must be a valid ISO 4217 code" },
        { status: 400 }
      );
    }

    const amount = pack.priceUsd * 100;
    if (!Number.isInteger(amount) || amount < 100) {
      return NextResponse.json(
        { error: "amount must be an integer of at least 100 subunits" },
        { status: 400 }
      );
    }

    const internalOrderId = uuidv4().replace(/-/g, "").slice(0, 40);
    const receipt = internalOrderId.slice(0, 40);

    await db.insert(PaymentOrdersTable).values({
      internalOrderId,
      email,
      packId: pack.id,
      amount,
      currency,
      credits: pack.credits,
      status: "created",
    });

    let order: { id?: string; amount?: number | string; currency?: string };
    try {
      const client = getRazorpayClient();
      order = (await withRazorpayRetry(() =>
        client.orders.create({
          amount,
          currency,
          receipt,
          notes: { order_id: internalOrderId },
        })
      )) as { id?: string; amount?: number | string; currency?: string };
    } catch (error) {
      const status = razorpayHttpStatus(error);
      const description = razorpayErrorDescription(error);
      console.error("Razorpay order create failed", {
        code: status,
        description,
      });

      if (status === 400) {
        return NextResponse.json({ error: description }, { status: 400 });
      }
      if (status === 401) {
        console.error("Payment provider misconfigured; Razorpay returned 401");
        return NextResponse.json(
          { error: "payment provider misconfigured" },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: "Payment provider unavailable" },
        { status: 503 }
      );
    }

    if (!order?.id) {
      console.error("Razorpay order create response missing id");
      return NextResponse.json(
        { error: "Payment provider returned an invalid order" },
        { status: 502 }
      );
    }

    await db
      .update(PaymentOrdersTable)
      .set({ razorpayOrderId: order.id, status: "pending" })
      .where(eq(PaymentOrdersTable.internalOrderId, internalOrderId));

    return NextResponse.json({
      order_id: order.id,
      amount: Number(order.amount ?? amount),
      currency: order.currency || currency,
      key_id: keyId,
      notes: { order_id: internalOrderId },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PAYMENT_PROVIDER_MISCONFIGURED") {
      return NextResponse.json(
        { error: "payment provider misconfigured" },
        { status: 500 }
      );
    }
    console.error("create-order failed", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
