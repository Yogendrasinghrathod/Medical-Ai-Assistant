import { db } from "@/src/db";
import { openai } from "@/src/OpenAIModel";
import { SessionChatTable } from "@/src/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";


const REPORT_GEN_PROMPT = `You are an AI Medical Voice Agent that just finished a voice conversation with a user. Based on the doctor AI Agent  info and Conversation between Ai medical agent and user, generate a structured report with the following fields:

sessionId: a unique session identifier

agent: the medical specialist name (e.g., "General Physician AI")

user: name of the patient or "Anonymous" if not provided

timestamp: current date and time in ISO format

chiefComplaint: one-sentence summary of the main health concern

summary: a 2–3 sentence summary of the conversation, symptoms, and recommendations

symptoms: list of symptoms mentioned by the user

duration: how long the user has experienced the symptoms

severity: mild, moderate, or severe

medicationsMentioned: list of any medicines mentioned

recommendations: list of AI suggestions (e.g., rest, see a doctor)

Return the result in this JSON format:

{
"sessionId": "string",
"agent": "string",
"user": "string",
"timestamp": "ISO Date string",
"chiefComplaint": "string",
"summary": "string",
"symptoms": ["symptom1", "symptom2"],
"duration": "string",
"severity": "string",
"medicationsMentioned": ["med1", "med2"],
"recommendations": ["rec1", "rec2"]
} 
Only include valid fields. Respond with nothing else.
`
export async function POST(req: Request) {
    const { sessionId, sessionDetails, messages } = await req.json();
    try {
        const UserInput="AI Doctor Agent Info:"+JSON.stringify(sessionDetails)+",Converstaion:"+JSON.stringify(messages);
        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.5-flash-preview-05-20",
            messages: [
                { role: 'system', content: REPORT_GEN_PROMPT },
                { role: 'user', content: UserInput }
            ],
        });
      const rawResponse=(completion.choices[0].message);
    //@ts-expect-error - content may not be defined in type but exists at runtime
    const Resp=rawResponse.content.trim().replace('```json','').replace('```','')
    const JSONResp=JSON.parse(Resp);

    //save to db
    await db.update(SessionChatTable).set({
        report:JSONResp,
        conversation:messages
    }).where(eq(SessionChatTable.sessionId,sessionId));
    return NextResponse.json(JSONResp);
    } catch (error) {
        console.error("Error generating report:", error);
        return NextResponse.json(error);
    }
}