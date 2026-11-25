import { ChatOpenAI } from "@langchain/openai";

export function getConsultationLlm() {
  const apiKey =
    process.env.CONSULTATION_API_KEY ||
    process.env.OPENROUTER_API_KEY ||
    process.env.AICREDITS_API_KEY;

  if (!apiKey) {
    throw new Error("No API key set for consultation LLM");
  }

  return new ChatOpenAI({
    model:
      process.env.CONSULTATION_MODEL ||
      process.env.AICREDITS_MODEL ||
      "openai/gpt-4o-mini",
    temperature: 0.3,
    apiKey,
    configuration: {
      baseURL:
        process.env.CONSULTATION_BASE_URL ||
        process.env.AICREDITS_BASE_URL ||
        "https://api.aicredits.in/v1",
    },
  });
}
