import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { PaymentOrdersTable } from "@/src/schema";
import {
  getRazorpayClient,
  getRazorpayCredentials,
  razorpayErrorDescription,
  razorpayHttpStatus,
  withRazorpayRetry,
} from "@/lib/razorpay";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ order_id: string }> }
) {
  try {
    getRazorpayCredentials();
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { order_id } = await params;
    if (!order_id) {
      return NextResponse.json({ error: "order_id is required" }, { status: 400 });
    }

    const rows = await db
      .select()
      .from(PaymentOrdersTable)
      .where(eq(PaymentOrdersTable.razorpayOrderId, order_id));

    const order = rows[0];
    if (!order || order.email !== email) {
      return NextResponse.json({ error: "Order not found" }, { status: 400 });
    }

    const client = getRazorpayClient();
    const payments = await withRazorpayRetry(() =>
      client.orders.fetchPayments(order_id)
    );

    return NextResponse.json({
      order_id,
      status: order.status,
      payments,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PAYMENT_PROVIDER_MISCONFIGURED") {
      return NextResponse.json(
        { error: "payment provider misconfigured" },
        { status: 500 }
      );
    }
    const status = razorpayHttpStatus(error);
    const description = razorpayErrorDescription(error);
    console.error("order-status failed", { code: status, description });
    if (status === 401) {
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
}
