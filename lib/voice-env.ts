const ASSISTANT_ENV_BY_DOCTOR_ID: Record<number, string> = {
  1: "NEXT_PUBLIC_ASSISTANT_ID_GENERAL_PHYSICIAN",
  2: "NEXT_PUBLIC_ASSISTANT_ID_PEDIATRICIAN",
  3: "NEXT_PUBLIC_ASSISTANT_ID_DERMATOLOGIST",
  4: "NEXT_PUBLIC_ASSISTANT_ID_PSYCHOLOGIST",
  5: "NEXT_PUBLIC_ASSISTANT_ID_NUTRITIONIST",
  6: "NEXT_PUBLIC_ASSISTANT_ID_CARDIOLOGIST",
  7: "NEXT_PUBLIC_ASSISTANT_ID_ENT_SPECIALIST",
  8: "NEXT_PUBLIC_ASSISTANT_ID_ORTHOPEDIC",
  9: "NEXT_PUBLIC_ASSISTANT_ID_GYNECOLOGIST",
  10: "NEXT_PUBLIC_ASSISTANT_ID_DENTIST",
};

function readEnv(name: string) {
  return String(process.env[name] ?? "").trim();
}

export function getVapiPublicKey() {
  return readEnv("NEXT_PUBLIC_VAPI_API_KEY") || readEnv("VAPI_PUBLIC_KEY");
}

export function getSharedConsultationAssistantId() {
  return (
    readEnv("NEXT_PUBLIC_ASSISTANT_ID_CONSULTATION") ||
    readEnv("ASSISTANT_ID_CONSULTATION")
  );
}

export function getAssistantIdForDoctor(doctorId: number, fallback = "") {
  const envName = ASSISTANT_ENV_BY_DOCTOR_ID[doctorId];
  if (!envName) return fallback;
  return readEnv(envName) || readEnv(envName.replace("NEXT_PUBLIC_", "")) || fallback;
}
