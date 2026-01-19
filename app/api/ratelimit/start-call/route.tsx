import { startCallLimiter } from "@/app/(ratelimiter)/rateLimiter";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const { success, reset } = await startCallLimiter.limit(`start_call_${ip}`);

  if (!success) {
    return NextResponse.json(
      {
        message: "Too many call starts. Try again later.",
        retryAfterSeconds: Math.ceil((reset - Date.now()) / 1000),
      },
      { status: 429 }
    );
  }

  return NextResponse.json({ ok: true });
}
