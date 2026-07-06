import { db } from "@/src/db";
import { SessionChatTable } from "@/src/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { generateMedicalReport } from "@/services/report.service";

// Generate Report API Endpoint
// Now uses the RAG-enhanced report service. If RAG doesn't work, it automatically
// falls back to the original way so nothing breaks for the user.
export async function POST(req: Request) {
    const { sessionId, sessionDetails, messages } = await req.json();
    try {
        // Generate report using RAG-enhanced service
        // This function automatically handles RAG fallback if vector DB is unavailable
        const JSONResp = await generateMedicalReport(sessionId, sessionDetails, messages);

        // Save to database
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