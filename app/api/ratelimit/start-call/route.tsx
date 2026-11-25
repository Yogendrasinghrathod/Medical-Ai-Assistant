import { applyRateLimit, startCallLimiter } from "@/app/(ratelimiter)/rateLimiter";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { deductCallCredit } from "@/services/credits.service";

const START_CALL_LIMIT = 2;
const START_CALL_WINDOW_MINUTES = 60;

export async function POST(req: Request) {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const { success, reset, remaining } = await applyRateLimit(
    startCallLimiter,
    `start_call_${ip}`
  );

  const payload = {
    message: `Only ${START_CALL_LIMIT} start calls are allowed in ${START_CALL_WINDOW_MINUTES} minutes.`,
    remaining,
    limit: START_CALL_LIMIT,
    windowMinutes: START_CALL_WINDOW_MINUTES,
    retryAfterSeconds: Math.max(0, Math.ceil((reset - Date.now()) / 1000)),
  };

  if (!success) {
    return NextResponse.json(payload, { status: 429 });
  }

  const billed = await deductCallCredit(email);
  if (!billed) {
    return NextResponse.json(
      {
        error: "Not enough credits",
        message: "Each voice call uses 1 credit. Buy more on the Pricing page.",
        credits: 0,
      },
      { status: 402 }
    );
  }

  return NextResponse.json({
    ok: true,
    ...payload,
    credits: billed.credits,
  });
}
