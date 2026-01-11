import { db } from "@/src/db";
import { usersTable } from "@/src/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
    const user = await currentUser();
    
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
            return NextResponse.json(result[0]);
        }
        return NextResponse.json(users[0]);
    } catch (error) {
        console.error('Error in users route:', error);
        return NextResponse.json(
            { error: 'Failed to process user request' },
            { status: 500 }
        );
    }
}