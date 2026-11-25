import OpenAI from "openai";

const AICREDITS_BASE_URL =
  process.env.AICREDITS_BASE_URL || "https://api.aicredits.in/v1";

export const REPORT_MODEL =
  process.env.AICREDITS_REPORT_MODEL || "qwen/qwen3-235b-a22b";

export const ai = new OpenAI({
  baseURL: AICREDITS_BASE_URL,
  apiKey: process.env.AICREDITS_API_KEY,
});
