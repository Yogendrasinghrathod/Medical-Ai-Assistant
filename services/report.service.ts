import { ai, REPORT_MODEL } from '@/src/GeminiModel';
import { getMedicalContext } from './rag.service';
import { compressForLLM } from '@/utils/tokenCompressor';

const RAG_REPORT_GEN_PROMPT = `You are an AI medical assistant.

Use the provided medical reference information and patient conversation.

Do not give final diagnosis.
Generate a structured health summary.

Include:
- Patient symptoms
- Duration
- Key observations
- Relevant medical information
- Possible areas of concern
- Suggested next steps
- Recommendation to consult healthcare professional if needed

Inputs:

Medical Context:
{retrieved_context}

Patient Conversation:
{conversation_transcript}

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
`;

const ORIGINAL_REPORT_GEN_PROMPT = `You are an AI Medical Voice Agent that just finished a voice conversation with a user. Based on the doctor AI Agent  info and Conversation between Ai medical agent and user, generate a structured report with the following fields:

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
`;

const REPORT_SYSTEM_PROMPT = `You are a medical report generator.

Return ONLY valid JSON.
No markdown.
No explanation.
No text before or after JSON.`;

function parseReportJson(content: string) {
  const cleaned = content.trim().replace("```json", "").replace("```", "");
  return JSON.parse(cleaned);
}

export async function generateMedicalReport(
  sessionId: string,
  sessionDetails: any,
  messages: any[]
): Promise<any> {
  try {
    const rawInput =
      "AI Doctor Agent Info:" +
      JSON.stringify(sessionDetails) +
      ",Conversation:" +
      JSON.stringify(messages);
    const compressedInput = compressForLLM(rawInput);

    let retrievedContext = "";
    let useRAG = false;

    try {
      retrievedContext = await getMedicalContext(JSON.stringify(messages));
      if (retrievedContext) {
        useRAG = true;
        console.log("RAG: Successfully retrieved medical context");
      } else {
        console.log("RAG: No medical context retrieved, using fallback");
      }
    } catch (ragError) {
      console.error("RAG failed, using fallback:", ragError);
    }

    const prompt = useRAG
      ? RAG_REPORT_GEN_PROMPT.replace("{retrieved_context}", retrievedContext).replace(
          "{conversation_transcript}",
          compressedInput
        )
      : `${ORIGINAL_REPORT_GEN_PROMPT}\n\n${compressedInput}`;

    const result = await ai.chat.completions.create({
      model: REPORT_MODEL,
      messages: [
        { role: "system", content: REPORT_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });

    const content = result.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content from AICredits");
    }

    const JSONResp = parseReportJson(content);
    JSONResp.sessionId = sessionId;

    console.log(`Report generated ${useRAG ? "with RAG" : "without RAG (fallback)"}`);
    return JSONResp;
  } catch (error) {
    console.error("Error generating medical report:", error);
    throw error;
  }
}
