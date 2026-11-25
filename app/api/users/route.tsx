import { db } from "@/src/db";
import { usersTable } from "@/src/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { STARTING_CREDITS } from "@/shared/credits";
import {
    ensureOpeningBalance,
    recordSignupCredits,
} from "@/services/credits.service";

function publicUser(row: { name: string; email: string; credits: number | null }) {
    return {
        name: row.name,
        email: row.email,
        credits: Number(row.credits ?? 0),
    };
}

async function upsertCurrentUser() {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!user || !email) {
        return NextResponse.json(
            { error: "User not authenticated" },
            { status: 401 }
        );
    }

    const users = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email));

    if (users.length === 0) {
        const result = await db
            .insert(usersTable)
            .values({
                name: user.fullName || "",
                email,
                credits: STARTING_CREDITS,
            })
            .returning();
        const created = result[0];
        if (created?.email) {
            try {
                await recordSignupCredits(
                    created.email,
                    STARTING_CREDITS,
                    created.credits ?? STARTING_CREDITS
                );
            } catch {
                // Balance is stored on users.credits even if the ledger insert fails.
            }
        }
        return NextResponse.json(publicUser(created));
    }

    const existing = users[0];
    try {
        await ensureOpeningBalance(existing.email, existing.credits ?? 0);
    } catch {
        // Balance is stored on users.credits even if the ledger insert fails.
    }
    return NextResponse.json(publicUser(existing));
}

export async function GET() {
    try {
        return await upsertCurrentUser();
    } catch {
        return NextResponse.json(
            { error: "Failed to process user request" },
            { status: 500 }
        );
    }
}

export async function POST() {
    try {
        return await upsertCurrentUser();
    } catch {
        return NextResponse.json(
            { error: "Failed to process user request" },
            { status: 500 }
        );
    }
}
