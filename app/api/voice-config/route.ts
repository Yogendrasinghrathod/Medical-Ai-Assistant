import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import {
  getSharedConsultationAssistantId,
  getVapiPublicKey,
} from "@/lib/voice-env";

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vapiPublicKey = getVapiPublicKey();
  const consultationAssistantId = getSharedConsultationAssistantId();

  return NextResponse.json({
    vapiPublicKey,
    consultationAssistantId,
    configured: Boolean(vapiPublicKey),
  });
}
