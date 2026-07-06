import { ai, GEMINI_REPORT_MODEL } from '@/src/GeminiModel';
import { getMedicalContext } from './rag.service';
import { compressForLLM } from '@/utils/tokenCompressor';

/**
 * Report Service - Generates medical reports with RAG
 * 
 * Keeping report generation separate makes the code cleaner and easier to test.
 * It also handles the fallback logic if RAG doesn't work.
 */

// Updated prompt that includes medical context from RAG
// This tells the LLM to use the retrieved medical info for better accuracy
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

// Original prompt without RAG (fallback if vector DB isn't working)
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

/**
 * Generate a medical report with RAG enhancement
 * 
 * Tries to get medical context from the vector database first. If that works,
 * it uses the enhanced prompt with the retrieved info. If RAG fails (vector DB
 * down, no API keys, etc.), it falls back to the original prompt so reports
 * still get generated.
 * 
 * @param sessionId - Session ID
 * @param sessionDetails - AI agent info
 * @param messages - Conversation messages
 * @returns The generated report as JSON
 */
export async function generateMedicalReport(
  sessionId: string,
  sessionDetails: any,
  messages: any[]
): Promise<any> {
  try {
    // Prepare conversation transcript
    const rawInput = "AI Doctor Agent Info:" + JSON.stringify(sessionDetails) + ",Conversation:" + JSON.stringify(messages);
    
    // Compress input to save tokens (40-70% reduction)
    const compressedInput = compressForLLM(rawInput);

    // Try to get medical context using RAG
    let retrievedContext = '';
    let useRAG = false;

    try {
      // Extract full transcript for RAG
      const fullTranscript = JSON.stringify(messages);
      
      // Get medical context from vector database
      retrievedContext = await getMedicalContext(fullTranscript);
      
      // Use RAG if we got context back
      if (retrievedContext && retrievedContext.length > 0) {
        useRAG = true;
        console.log('RAG: Successfully retrieved medical context');
      } else {
        console.log('RAG: No medical context retrieved, using fallback');
      }
    } catch (ragError) {
      console.error('RAG failed, using fallback:', ragError);
      // Continue with fallback - don't throw error
    }

    // Choose prompt based on RAG success
    const prompt = useRAG 
      ? RAG_REPORT_GEN_PROMPT.replace('{retrieved_context}', retrievedContext).replace('{conversation_transcript}', compressedInput)
      : ORIGINAL_REPORT_GEN_PROMPT;

    // Generate report using Gemini
    const result = await ai.models.generateContent({
      model: GEMINI_REPORT_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    });

    const content = result.text;

    if (!content) {
      throw new Error('No content in Gemini response');
    }

    // Parse JSON response
    const Resp = content.trim().replace('```json', '').replace('```', '');
    const JSONResp = JSON.parse(Resp);

    // Add sessionId to response
    JSONResp.sessionId = sessionId;

    console.log(`Report generated ${useRAG ? 'with RAG' : 'without RAG (fallback)'}`);
    return JSONResp;

  } catch (error) {
    console.error('Error generating medical report:', error);
    throw error;
  }
}

// Original report generation without RAG
// This is the fallback if RAG isn't working
export async function generateMedicalReportOriginal(
  sessionId: string,
  sessionDetails: any,
  messages: any[]
): Promise<any> {
  try {
    // Prepare raw input
    const rawInput = "AI Doctor Agent Info:" + JSON.stringify(sessionDetails) + ",Conversation:" + JSON.stringify(messages);

    // Compress input to save tokens (40-70% reduction)
    const compressedInput = compressForLLM(rawInput);

    // Generate report using Gemini with original prompt
    const result = await ai.models.generateContent({
      model: GEMINI_REPORT_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: ORIGINAL_REPORT_GEN_PROMPT
            },
            {
              text: compressedInput
            }
          ]
        }
      ]
    });

    const content = result.text;

    if (!content) {
      throw new Error('No content in Gemini response');
    }

    // Parse JSON response
    const Resp = content.trim().replace('```json', '').replace('```', '');
    const JSONResp = JSON.parse(Resp);

    // Add sessionId to response
    JSONResp.sessionId = sessionId;

    return JSONResp;

  } catch (error) {
    console.error('Error generating medical report (original):', error);
    throw error;
  }
}
