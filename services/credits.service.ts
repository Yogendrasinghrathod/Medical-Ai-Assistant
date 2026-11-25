import { db } from "@/src/db";
import { CreditLedgerTable, usersTable } from "@/src/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { CREDITS_PER_CALL } from "@/shared/credits";

export type CreditEventType =
  | "signup"
  | "purchase"
  | "call"
  | "opening_balance";

function asCredits(value: number | null | undefined) {
  return Number.isFinite(value) ? Number(value) : 0;
}

export async function getCredits(email: string) {
  const rows = await db
    .select({ credits: usersTable.credits })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);
  return asCredits(rows[0]?.credits);
}

async function recordLedger(input: {
  email: string;
  type: CreditEventType;
  amount: number;
  balanceAfter: number;
  reference?: string;
  note?: string;
}) {
  try {
    await db.insert(CreditLedgerTable).values({
      email: input.email,
      type: input.type,
      amount: input.amount,
      balanceAfter: input.balanceAfter,
      reference: input.reference,
      note: input.note,
    });
  } catch {
    // Keep the users.credits balance even if the history row fails.
  }
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

  const credits = asCredits(user.credits);
  await recordLedger({
    email,
    type: "call",
    amount: -CREDITS_PER_CALL,
    balanceAfter: credits,
    note: "Voice consultation",
  });

  return { ...user, credits };
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

  const credits = asCredits(user.credits);
  await recordLedger({
    email,
    type: meta?.type ?? "purchase",
    amount,
    balanceAfter: credits,
    reference: meta?.reference,
    note: meta?.note,
  });

  return { ...user, credits };
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
