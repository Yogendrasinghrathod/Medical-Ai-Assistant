import { NextRequest, NextResponse } from "next/server";
import { AIDoctorAgents } from "@/shared/list";
// import { openai } from "@/src/OpenAIModel";
// import { GoogleGenAI } from "@google/genai";

type doctorAgent = {
  id: number;
  specialist: string;
  description: string;
  image: string;
  agentPrompt: string;
  voiceId: string;
  subscriptionRequired: boolean;
};

// Keywords mapping for each doctor specialty
const specialtyKeywords: Record<string, string[]> = {
  "General Physician": [
    "general",
    "common",
    "fever",
    "cold",
    "flu",
    "headache",
    "body ache",
    "tired",
    "weak",
  ],
  Pediatrician: [
    "child",
    "baby",
    "infant",
    "toddler",
    "kid",
    "children",
    "pediatric",
    "young",
  ],
  Dermatologist: [
    "skin",
    "rash",
    "acne",
    "eczema",
    "dermatitis",
    "itchy",
    "redness",
    "pimple",
    "wart",
    "mole",
  ],
  Psychologist: [
    "mental",
    "anxiety",
    "stress",
    "depression",
    "mood",
    "emotional",
    "feeling",
    "sad",
    "worried",
    "panic",
  ],
  Nutritionist: [
    "diet",
    "weight",
    "nutrition",
    "food",
    "eating",
    "obesity",
    "calorie",
    "meal",
    "healthy eating",
  ],
  Cardiologist: [
    "heart",
    "chest",
    "cardiac",
    "blood pressure",
    "hypertension",
    "palpitation",
    "breath",
    "cardio",
  ],
  "ENT Specialist": [
    "ear",
    "nose",
    "throat",
    "sinus",
    "hearing",
    "tinnitus",
    "nasal",
    "sore throat",
    "earache",
  ],
  Orthopedic: [
    "bone",
    "joint",
    "muscle",
    "pain",
    "fracture",
    "sprain",
    "knee",
    "back pain",
    "shoulder",
    "hip",
  ],
  Gynecologist: [
    "women",
    "menstrual",
    "period",
    "pregnancy",
    "gynecological",
    "reproductive",
    "hormonal",
    "ovarian",
  ],
  Dentist: [
    "tooth",
    "teeth",
    "dental",
    "gum",
    "oral",
    "mouth",
    "cavity",
    "toothache",
    "braces",
    "dental pain",
  ],
};

function suggestDoctors(notes: string): doctorAgent[] {
  if (!notes || notes.trim().length === 0) {
    // Return all doctors if no notes provided
    return AIDoctorAgents;
  }

  const notesLower = notes.toLowerCase();
  const doctorScores: Map<number, number> = new Map();

  // Score each doctor based on keyword matches
  AIDoctorAgents.forEach((doctor) => {
    const keywords = specialtyKeywords[doctor.specialist] || [];
    let score = 0;

    // Check for keyword matches
    keywords.forEach((keyword) => {
      if (notesLower.includes(keyword.toLowerCase())) {
        score += 2; // Higher weight for keyword matches
      }
    });

    // Check if specialist name is mentioned
    if (notesLower.includes(doctor.specialist.toLowerCase())) {
      score += 5; // Very high weight for direct mention
    }

    // Check if description keywords match
    const descriptionWords = doctor.description.toLowerCase().split(" ");
    descriptionWords.forEach((word) => {
      if (word.length > 4 && notesLower.includes(word)) {
        score += 1;
      }
    });

    doctorScores.set(doctor.id, score);
  });

  // Sort doctors by score (highest first) and return top matches
  // Create a copy to avoid mutating the original array
  const sortedDoctors = [...AIDoctorAgents].sort((a, b) => {
    const scoreA = doctorScores.get(a.id) || 0;
    const scoreB = doctorScores.get(b.id) || 0;
    return scoreB - scoreA;
  });

  // Return top 3-5 suggested doctors, or all if scores are similar
  const topScore = doctorScores.get(sortedDoctors[0].id) || 0;

  if (topScore === 0) {
    // No matches, return General Physician and top 2-3 others
    return [AIDoctorAgents[0], ...AIDoctorAgents.slice(1, 4)];
  }

  // Return doctors with score > 0, or top 5
  const suggested = sortedDoctors.filter((doctor) => {
    const score = doctorScores.get(doctor.id) || 0;
    return score > 0;
  });

  return suggested.length > 0 ? suggested.slice(0, 5) : sortedDoctors.slice(0, 3);
}


export async function POST(req: NextRequest) {
  const { notes } = await req.json();
  try {
    // OpenAI/OpenRouter implementation (commented out due to rate limits)
    // const completion = await openai.chat.completions.create({
    //   model: "google/gemini-2.0-flash-exp:free",
    //   messages: [
    //     { role: "system", content: JSON.stringify(AIDoctorAgents) },
    //     {
    //       role: "user",
    //       content: "User Notes/Symptoms: " + notes+",Depends on user notes/symptoms,Please suggest list of doctors,Return Object in json only"
    //     },
    //   ],
    // });
    // const rawResponse=(completion.choices[0].message);
    // //@ts-ignore
    // const Resp=rawResponse.content.trim().replace('```json','').replace('```','')
    // const JSONResp=JSON.parse(Resp)
    // return NextResponse.json(JSONResp);

    // Gemini API implementation (direct, using GEMINI_API_KEY)
    // const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
    // const prompt = `You are a medical assistant. Here are the available doctors: ${JSON.stringify(AIDoctorAgents)}
    
    // User Notes/Symptoms: ${notes}
    
    // Based on the user notes/symptoms, please suggest a list of relevant doctors. Return the response as a JSON array of doctor objects only (no markdown, no code blocks, just the JSON array).`;
    
    // const response = await ai.models.generateContent({
    //   model: "gemini-2.0-flash-exp",
    //   contents: prompt,
    // });
    
    // const text = response.text || "";
    // const cleanedText = text.trim().replace(/```json/g, '').replace(/```/g, '').trim();
    // const JSONResp = JSON.parse(cleanedText);
    // return NextResponse.json(JSONResp);

    // Local keyword-based implementation (currently active)
    const suggestions = suggestDoctors(notes);
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Error suggesting doctors:", error);
    return NextResponse.json(
      { error: "Failed to suggest doctors" },
      { status: 500 }
    );
  }
}
