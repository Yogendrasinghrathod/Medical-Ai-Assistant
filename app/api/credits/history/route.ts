import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { listCreditHistory } from "@/services/credits.service";

export async function GET() {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await listCreditHistory(email);
  return NextResponse.json({
    entries: rows.map((row) => ({
      id: row.id,
      type: row.type,
      amount: row.amount,
      balanceAfter: row.balanceAfter,
      note: row.note,
      createdOn: row.createdOn,
    })),
  });
}
