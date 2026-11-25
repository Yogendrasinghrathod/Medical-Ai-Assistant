import { db } from "@/src/db";
import { SessionChatTable } from "@/src/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { generateMedicalReport } from "@/services/report.service";

export async function POST(req: Request) {
    const { sessionId, sessionDetails, messages } = await req.json();
    try {
        const JSONResp = await generateMedicalReport(sessionId, sessionDetails, messages);

        await db.update(SessionChatTable).set({
            report: JSONResp,
            conversation: messages
        }).where(eq(SessionChatTable.sessionId, sessionId));

        return NextResponse.json(JSONResp);
    } catch (error) {
        console.error("Error generating report:", error);
        return NextResponse.json({ error: "Error generating report" }, { status: 500 });
    }
}
