// import { GoogleGenAI } from "@google/genai";

// const apiKey = process.env.GEMINI_API_KEY;

// if (!apiKey) {
//     throw new Error("GEMINI_API_KEY is not defined in environment variables");
// }

// export const ai = new GoogleGenAI({ apiKey });

// // gemini-pro is deprecated; use a current flash model for generateContent
// export const GEMINI_REPORT_MODEL = "gemini-2.0-flash";


import OpenAI from "openai";

export const ai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
});


export const REPORT_MODEL =
  "qwen/qwen3-235b-a22b";