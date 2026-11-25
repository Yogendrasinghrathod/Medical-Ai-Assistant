import { db } from "@/src/db";
import { CreditLedgerTable, usersTable } from "@/src/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { CREDITS_PER_CALL } from "@/shared/credits";

export type CreditEventType =
  | "signup"
  | "purchase"
  | "call"
  | "opening_balance";

async function recordLedger(input: {
  email: string;
  type: CreditEventType;
  amount: number;
  balanceAfter: number;
  reference?: string;
  note?: string;
}) {
  await db.insert(CreditLedgerTable).values({
    email: input.email,
    type: input.type,
    amount: input.amount,
    balanceAfter: input.balanceAfter,
    reference: input.reference,
    note: input.note,
  });
}

export async function deductCallCredit(email: string) {
  const updated = await db
    .update(usersTable)
    .set({
      credits: sql`GREATEST(COALESCE(${usersTable.credits}, 0) - ${CREDITS_PER_CALL}, 0)`,
    })
    .where(
      and(
        eq(usersTable.email, email),
        sql`COALESCE(${usersTable.credits}, 0) >= ${CREDITS_PER_CALL}`
      )
    )
    .returning();

  const user = updated[0];
  if (!user) {
    return null;
  }

  await recordLedger({
    email,
    type: "call",
    amount: -CREDITS_PER_CALL,
    balanceAfter: user.credits ?? 0,
    note: "Voice consultation",
  });

  return user;
}

export async function addCredits(
  email: string,
  amount: number,
  meta?: { type?: CreditEventType; reference?: string; note?: string }
) {
  const updated = await db
    .update(usersTable)
    .set({
      credits: sql`COALESCE(${usersTable.credits}, 0) + ${amount}`,
    })
    .where(eq(usersTable.email, email))
    .returning();

  const user = updated[0];
  if (!user) {
    return null;
  }

  await recordLedger({
    email,
    type: meta?.type ?? "purchase",
    amount,
    balanceAfter: user.credits ?? 0,
    reference: meta?.reference,
    note: meta?.note,
  });

  return user;
}

export async function recordSignupCredits(
  email: string,
  amount: number,
  balanceAfter: number
) {
  await recordLedger({
    email,
    type: "signup",
    amount,
    balanceAfter,
    note: "Welcome credits",
  });
}

export async function ensureOpeningBalance(email: string, currentCredits: number) {
  const existing = await db
    .select({ id: CreditLedgerTable.id })
    .from(CreditLedgerTable)
    .where(eq(CreditLedgerTable.email, email))
    .limit(1);

  if (existing.length > 0) {
    return;
  }

  await recordLedger({
    email,
    type: "opening_balance",
    amount: currentCredits,
    balanceAfter: currentCredits,
    note: "Balance snapshot",
  });
}

export async function listCreditHistory(email: string, limit = 50) {
  return db
    .select()
    .from(CreditLedgerTable)
    .where(eq(CreditLedgerTable.email, email))
    .orderBy(desc(CreditLedgerTable.createdOn), desc(CreditLedgerTable.id))
    .limit(limit);
}
