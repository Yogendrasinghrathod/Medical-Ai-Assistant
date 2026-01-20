import { userRatelimit } from "@/app/(ratelimiter)/rateLimiter";
import { db } from "@/src/db";
import { usersTable } from "@/src/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const user = await currentUser();
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ||
        req.headers.get("x-real-ip") ||
        "unknown";

    const key = user?.id ? `user:${user.id}` : `ip:${ip}`;

    const { success, reset, remaining } = await userRatelimit.limit(key);


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
                credits: 10
            }).returning();
            return NextResponse.json(result[0], {
                headers: {
                    "X-RateLimit-Remaining": remaining.toString(),
                }
            });
        }
        return NextResponse.json(users[0], {
            headers: {
                "X-RateLimit-Remaining": remaining.toString(),
            }
        });
    } catch (error) {
        console.error('Error in users route:', error);
        return NextResponse.json(
            { error: 'Failed to process user request' },
            { status: 500 }
        );
    }
}