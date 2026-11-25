import type { ConsultationMessage } from "./consultation.chain";

function asText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value
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

function normalizeMessage(entry: unknown): ConsultationMessage | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const message = entry as ConsultationMessage & { content?: unknown };
  const role = typeof message.role === "string" ? message.role : "";
  const text = (message.text ?? asText(message.content)).trim();

  if (!role || !text) {
    return null;
  }

  return { role, text };
}

export function parseConversation(raw: unknown): ConsultationMessage[] {
  if (Array.isArray(raw)) {
    return raw.map(normalizeMessage).filter((item): item is ConsultationMessage => Boolean(item));
  }

  if (typeof raw !== "string" || !raw.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map(normalizeMessage)
      .filter((item): item is ConsultationMessage => Boolean(item));
  } catch {
    return [];
  }
}

export function serializeConversation(messages: ConsultationMessage[]): string {
  return JSON.stringify(
    messages.map((message) => ({
      role: message.role,
      text: (message.text ?? message.content ?? "").trim(),
    }))
  );
}
