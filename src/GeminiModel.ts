import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables");
}

export const ai = new GoogleGenAI({ apiKey });

// gemini-pro is deprecated; use a current flash model for generateContent
export const GEMINI_REPORT_MODEL = "gemini-2.5-flash";
