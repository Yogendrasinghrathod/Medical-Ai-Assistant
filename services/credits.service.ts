import { db } from "@/src/db";
import { usersTable } from "@/src/schema";
import { and, eq, sql } from "drizzle-orm";
import { CREDITS_PER_CALL } from "@/shared/credits";

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

  return updated[0] ?? null;
}

export async function addCredits(email: string, amount: number) {
  const updated = await db
    .update(usersTable)
    .set({
      credits: sql`COALESCE(${usersTable.credits}, 0) + ${amount}`,
    })
    .where(eq(usersTable.email, email))
    .returning();

  return updated[0] ?? null;
}
