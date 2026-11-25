import type { DoctorConsultationConfig } from "@/services/doctor-config.service";
import { consultationChatPrompt } from "./consultation.prompt";
import { getConsultationLlm } from "./consultation.llm";

export type ConsultationMessage = {
  role: string;
  text?: string;
  content?: string;
};

export type ConsultationTurnInput = {
  doctor: DoctorConsultationConfig;
  patientContext?: string;
  chatHistory?: ConsultationMessage[];
  userInput: string;
};

function formatChatHistory(messages: ConsultationMessage[] | undefined): string {
  if (!messages?.length) {
    return "(No prior messages.)";
  }

  return messages
    .map((message) => {
      const text = message.text ?? message.content ?? "";
      return `${message.role}: ${text}`;
    })
    .join("\n");
}

function buildPromptVariables(input: ConsultationTurnInput) {
  const { doctor } = input;
  return {
    doctorName: doctor.doctorName,
    specialty: doctor.specialty,
    experience: doctor.experience,
    systemInstructions: doctor.systemInstructions,
    communicationStyle: doctor.communicationStyle,
    supportedLanguages: doctor.supportedLanguages.join(", "),
    consultationGuidelines: doctor.consultationGuidelines,
    patientContext: input.patientContext?.trim() || "(No extra patient context.)",
    chatHistory: formatChatHistory(input.chatHistory),
    userInput: input.userInput,
  };
}

/**
 * Reusable consultation chain: dynamic doctor config + history → shared LLM.
 * Does not import or initialize the doctor recommendation engine.
 */
export function getConsultationChain() {
  return consultationChatPrompt.pipe(getConsultationLlm());
}

export async function runConsultationTurn(
  input: ConsultationTurnInput
): Promise<string> {
  const chain = getConsultationChain();
  const result = await chain.invoke(buildPromptVariables(input));
  const content = result.content;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }
        if ("text" in part && typeof part.text === "string") {
          return part.text;
        }
        return "";
      })
      .join("")
      .trim();
  }

  return "";
}
