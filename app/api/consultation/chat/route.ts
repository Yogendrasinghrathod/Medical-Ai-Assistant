import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { SessionChatTable } from "@/src/schema";
import {
  getDoctorConfig,
  getDoctorConfigBySpecialist,
} from "@/services/doctor-config.service";
import {
  runConsultationTurn,
  type ConsultationMessage,
} from "@/services/consultation/consultation.chain";
import {
  parseConversation,
  serializeConversation,
} from "@/services/consultation/consultation.history";

type ChatMessage = {
  role?: string;
  content?: unknown;
  text?: string;
};

function messageText(message: ChatMessage): string {
  if (typeof message.text === "string" && message.text.trim()) {
    return message.text;
  }
  if (typeof message.content === "string") {
    return message.content;
  }
  if (Array.isArray(message.content)) {
    return message.content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }
        if (part && typeof part === "object" && "text" in part) {
          return String((part as { text?: string }).text ?? "");
        }
        return "";
      })
      .join("");
  }
  return "";
}

function lastUserInput(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === "user") {
      return messageText(messages[i]);
    }
  }
  return "";
}

function openaiCompletion(reply: string) {
  return {
    id: `chatcmpl-consult-${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: process.env.CONSULTATION_MODEL || "consultation",
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: reply },
        finish_reason: "stop",
      },
    ],
  };
}

function sseChunk(reply: string) {
  const id = `chatcmpl-consult-${Date.now()}`;
  const created = Math.floor(Date.now() / 1000);
  const model = process.env.CONSULTATION_MODEL || "consultation";
  const delta = {
    id,
    object: "chat.completion.chunk",
    created,
    model,
    choices: [{ index: 0, delta: { content: reply }, finish_reason: null }],
  };
  const done = {
    id,
    object: "chat.completion.chunk",
    created,
    model,
    choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
  };
  return `data: ${JSON.stringify(delta)}\n\ndata: ${JSON.stringify(done)}\n\ndata: [DONE]\n\n`;
}

function hasWebhookSecret(req: NextRequest): boolean {
  const secret = process.env.CONSULTATION_WEBHOOK_SECRET;
  if (!secret) {
    return false;
  }
  const header = req.headers.get("authorization") || "";
  const token = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : header.trim();
  return token === secret;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await currentUser();
    const webhookOk = hasWebhookSecret(req);

    if (!user && !webhookOk) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId =
      body.sessionId ||
      body.metadata?.sessionId ||
      body.call?.metadata?.sessionId;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const sessions = await db
      .select()
      .from(SessionChatTable)
      .where(eq(SessionChatTable.sessionId, sessionId));

    if (sessions.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const session = sessions[0];
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (!webhookOk && session.createdBy !== userEmail) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (
      body.selectedDoctorId != null &&
      session.selectedDoctorId != null &&
      Number(body.selectedDoctorId) !== session.selectedDoctorId
    ) {
      return NextResponse.json(
        { error: "This consultation is locked to a different doctor" },
        { status: 409 }
      );
    }

    const doctor =
      (session.selectedDoctorId != null
        ? getDoctorConfig(session.selectedDoctorId)
        : null) ||
      (session.selectedDoctor
        ? getDoctorConfigBySpecialist(session.selectedDoctor)
        : null);

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor configuration not found for this session" },
        { status: 400 }
      );
    }

    const openaiMessages: ChatMessage[] = Array.isArray(body.messages)
      ? body.messages
      : [];
    const storedHistory = parseConversation(session.conversation);
    const userInput =
      (typeof body.userInput === "string" && body.userInput.trim()) ||
      lastUserInput(openaiMessages);

    if (!userInput) {
      return NextResponse.json(
        { error: "userInput is required" },
        { status: 400 }
      );
    }

    const reply = await runConsultationTurn({
      doctor,
      patientContext: session.notes || "",
      chatHistory: storedHistory,
      userInput,
    });

    const nextHistory: ConsultationMessage[] = [
      ...storedHistory,
      { role: "user", text: userInput },
      { role: "assistant", text: reply },
    ];

    await db
      .update(SessionChatTable)
      .set({ conversation: serializeConversation(nextHistory) })
      .where(eq(SessionChatTable.sessionId, sessionId));

    if (body.stream === true) {
      return new NextResponse(sseChunk(reply), {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    }

    if (openaiMessages.length > 0 && body.userInput == null) {
      return NextResponse.json(openaiCompletion(reply));
    }

    return NextResponse.json({
      reply,
      sessionId,
      selectedDoctorId: doctor.doctorId,
      specialty: doctor.specialty,
      conversation: nextHistory,
    });
  } catch (error) {
    console.error("consultation chat failed:", error);
    return NextResponse.json(
      { error: "Failed to generate consultation reply" },
      { status: 500 }
    );
  }
}
