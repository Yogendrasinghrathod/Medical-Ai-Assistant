import { NextRequest, NextResponse } from "next/server";
import { AIDoctorAgents } from "@/shared/list";

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
    const suggestions = suggestDoctors(notes);
    return NextResponse.json(suggestions);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to suggest doctors" },
      { status: 500 }
    );
  }
}
