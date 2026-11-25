import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { AIDoctorAgents } from "@/shared/list";

type doctorAgent = (typeof AIDoctorAgents)[number];

const DOCTOR_SPECIALISTS = AIDoctorAgents.map((doctor) => doctor.specialist) as [
  string,
  ...string[],
];

const SuggestionSchema = z.object({
  specialists: z
    .array(z.enum(DOCTOR_SPECIALISTS))
    .min(1)
    .max(5)
    .describe("Best matching specialists from the allowed list only"),
});

type SuggestionOutput = z.infer<typeof SuggestionSchema>;

function fallbackDoctors(): doctorAgent[] {
  return AIDoctorAgents.slice(0, 4);
}

function mapSpecialistsToDoctors(specialists: string[]): doctorAgent[] {
  const unique = [...new Set(specialists)];
  const matched = unique
    .map((name) => AIDoctorAgents.find((doctor) => doctor.specialist === name))
    .filter((doctor): doctor is doctorAgent => Boolean(doctor));

  if (matched.length === 0) {
    return fallbackDoctors();
  }

  return matched.slice(0, 5);
}

function buildLlm() {
  const apiKey = process.env.AICREDITS_API_KEY;
  if (!apiKey) {
    throw new Error("AICREDITS_API_KEY is not set");
  }

  return new ChatOpenAI({
    model: process.env.AICREDITS_MODEL || "openai/gpt-4o-mini",
    temperature: 0,
    apiKey,
    configuration: {
      baseURL: process.env.AICREDITS_BASE_URL || "https://api.aicredits.in/v1",
    },
  });
}

async function suggestDoctorsWithLlm(notes: string): Promise<doctorAgent[]> {
  if (!notes?.trim()) {
    return fallbackDoctors();
  }

  const parser = new JsonOutputParser<SuggestionOutput>();
  const allowed = DOCTOR_SPECIALISTS.join(", ");

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a medical triage assistant. Choose the most relevant specialists for the patient's notes.

Allowed specialists (use these exact strings only): ${allowed}

Return JSON only, no markdown:
{{"specialists":["General Physician"]}}

Rules:
- Pick 1 to 5 specialists from the allowed list.
- Prefer the closest match to symptoms.
- If unsure, include "General Physician".
- Never invent specialists outside the allowed list.`,
    ],
    ["human", "Patient notes:\n{notes}"],
  ]);

  const llm = buildLlm();
  const chain = prompt.pipe(llm).pipe(parser);
  const raw = await chain.invoke({ notes });
  const parsed = SuggestionSchema.parse(raw);

  return mapSpecialistsToDoctors(parsed.specialists);
}

export async function POST(req: NextRequest) {
  const { notes } = await req.json();
  try {
    const suggestions = await suggestDoctorsWithLlm(notes);
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("suggest-doctors failed, using fallback:", error);
    return NextResponse.json(fallbackDoctors());
  }
}
