import { getAssistantIdForDoctor } from "@/lib/voice-env";
import { AIDoctorAgents } from "@/shared/list";

export type DoctorAgentRecord = (typeof AIDoctorAgents)[number];

export type DoctorConsultationConfig = {
  doctorId: number;
  doctorName: string;
  specialty: string;
  experience: string;
  systemInstructions: string;
  communicationStyle: string;
  supportedLanguages: string[];
  consultationGuidelines: string;
};

function toConsultationConfig(doctor: DoctorAgentRecord): DoctorConsultationConfig {
  return {
    doctorId: doctor.id,
    doctorName: doctor.doctorName,
    specialty: doctor.specialist,
    experience: doctor.experience,
    systemInstructions: doctor.agentPrompt,
    communicationStyle: doctor.communicationStyle,
    supportedLanguages: [...doctor.supportedLanguages],
    consultationGuidelines: doctor.consultationGuidelines,
  };
}

export function getDoctorConfig(doctorId: number): DoctorConsultationConfig | null {
  const doctor = resolveDoctorAgent(doctorId);
  return doctor ? toConsultationConfig(doctor) : null;
}

export function getDoctorConfigBySpecialist(
  specialist: string
): DoctorConsultationConfig | null {
  const doctor = resolveDoctorAgent(null, specialist);
  return doctor ? toConsultationConfig(doctor) : null;
}

export function resolveDoctorAgent(
  doctorId?: number | string | null,
  specialist?: string | null
): DoctorAgentRecord | null {
  if (doctorId !== undefined && doctorId !== null && doctorId !== "") {
    const numericId = Number(doctorId);
    if (!Number.isNaN(numericId)) {
      const byId = AIDoctorAgents.find((entry) => entry.id === numericId);
      if (byId) {
        return withRuntimeAssistantId(byId);
      }
    }
  }

  if (specialist) {
    const byName = AIDoctorAgents.find((entry) => entry.specialist === specialist);
    return byName ? withRuntimeAssistantId(byName) : null;
  }

  return null;
}

function withRuntimeAssistantId(doctor: DoctorAgentRecord): DoctorAgentRecord {
  return {
    ...doctor,
    assistantId: getAssistantIdForDoctor(doctor.id, doctor.assistantId),
  };
}
