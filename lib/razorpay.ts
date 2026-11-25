import Razorpay from "razorpay";

export function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  const missing: string[] = [];

  if (!keyId) {
    missing.push("RAZORPAY_KEY_ID");
  }
  if (!keySecret) {
    missing.push("RAZORPAY_KEY_SECRET");
  }

  if (missing.length) {
    console.error("Payment provider misconfigured; missing", missing.join(", "));
    throw new Error("PAYMENT_PROVIDER_MISCONFIGURED");
  }

  return { keyId: keyId as string, keySecret: keySecret as string };
}

export function getRazorpayClient() {
  const { keyId, keySecret } = getRazorpayCredentials();
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export function razorpayCurrency() {
  const code = (process.env.RAZORPAY_CURRENCY || "INR").trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) {
    return null;
  }
  return code;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function razorpayHttpStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }
  const err = error as {
    statusCode?: number;
    status?: number;
    error?: { description?: string; code?: string };
  };
  return err.statusCode ?? err.status;
}

export function razorpayErrorDescription(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Payment provider error";
  }
  const err = error as { error?: { description?: string }; message?: string };
  return err.error?.description || err.message || "Payment provider error";
}

export async function withRazorpayRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= 2; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const status = razorpayHttpStatus(error);
      if (status === 400 || status === 401 || (status !== undefined && status < 500)) {
        throw error;
      }
      if (attempt === 2) {
        throw error;
      }
      await sleep(300 * 2 ** attempt);
    }
  }
  throw lastError;
}
