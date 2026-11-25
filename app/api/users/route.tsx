import { applyRateLimit, userRatelimit } from "@/app/(ratelimiter)/rateLimiter";
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

export async function POST(req: Request) {
    const user = await currentUser();
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ||
        req.headers.get("x-real-ip") ||
        "unknown";

    const key = user?.id ? `user:${user.id}` : `ip:${ip}`;

    const { success, reset, remaining } = await applyRateLimit(userRatelimit, key);


    if (!success) {
        return NextResponse.json(
            {
                error: "Too many requests",
                resetInSeconds: Math.ceil((reset - Date.now()) / 1000),
            },
            { status: 429 }
        );
    }


    if (!user || !user.primaryEmailAddress?.emailAddress) {
        return NextResponse.json(
            { error: 'User not authenticated' },
            { status: 401 }
        );
    }

    //check if user already exists
    try {
        const users = await db.select().from(usersTable)
            .where(eq(usersTable.email, user.primaryEmailAddress.emailAddress));


        if (users?.length == 0) {
            //new user 
            const result = await db.insert(usersTable).values({
                name: user?.fullName || "",
                email: user?.primaryEmailAddress?.emailAddress || "",
                credits: STARTING_CREDITS
            }).returning();
            const created = result[0];
            if (created?.email) {
                try {
                    await recordSignupCredits(
                        created.email,
                        STARTING_CREDITS,
                        created.credits ?? STARTING_CREDITS
                    );
                } catch {
                    // Ledger table may not exist yet; balance is still on users.credits
                }
            }
            return NextResponse.json(created, {
                headers: {
                    "X-RateLimit-Remaining": remaining.toString(),
                }
            });
        }
        const existing = users[0];
        try {
            await ensureOpeningBalance(existing.email, existing.credits ?? 0);
        } catch {
            // Ledger table may not exist yet; balance is still on users.credits
        }
        return NextResponse.json(existing, {
            headers: {
                "X-RateLimit-Remaining": remaining.toString(),
            }
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to process user request' },
            { status: 500 }
        );
    }
}