"use client";

import { Button } from "@/components/ui/button";
import { UserDetailsContext } from "@/context/UserDetailsContext";
import { loadRazorpayCheckout } from "@/lib/load-razorpay-checkout";
import {
  CREDIT_PACKS,
  CREDITS_PER_CALL,
  STARTING_CREDITS,
} from "@/shared/credits";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { Coins, PhoneCall } from "lucide-react";
import Link from "next/link";
import { useContext, useState } from "react";
import { toast } from "sonner";

const packs = [CREDIT_PACKS.starter, CREDIT_PACKS.value];

function PricingPage() {
  const { user } = useUser();
  const userDetailsContext = useContext(UserDetailsContext);
  const credits = userDetailsContext?.usersDetail?.credits ?? 0;
  const [buying, setBuying] = useState<string | null>(null);

  const buyPack = async (packId: "starter" | "value") => {
    setBuying(packId);
    try {
      await loadRazorpayCheckout();
      const orderRes = await axios.post("/api/create-order", { pack: packId });
      const { order_id, amount, currency, key_id, notes } = orderRes.data;

      const rzp = new window.Razorpay({
        key: key_id,
        order_id,
        amount,
        currency,
        name: "AI Medical",
        description: `${CREDIT_PACKS[packId].credits} consultation credits`,
        prefill: {
          name: user?.fullName || userDetailsContext?.usersDetail?.name || "",
          email:
            user?.primaryEmailAddress?.emailAddress ||
            userDetailsContext?.usersDetail?.email ||
            "",
          contact: user?.primaryPhoneNumber?.phoneNumber || "",
        },
        notes: notes || {},
        theme: { color: "#2a7f74" },
        handler: async (response) => {
          try {
            const verified = await axios.post("/api/verify-payment", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            const nextCredits = verified.data?.credits;
            if (userDetailsContext?.usersDetail && typeof nextCredits === "number") {
              userDetailsContext.setUserDetail({
                ...userDetailsContext.usersDetail,
                credits: nextCredits,
              });
            }
            toast.success("Payment confirmed. Credits added.");
          } catch {
            toast.error("Payment could not be verified. If you were charged, refresh and check your balance.");
          } finally {
            setBuying(null);
          }
        },
        modal: {
          ondismiss: () => {
            toast.message("Payment cancelled.");
            setBuying(null);
          },
        },
      });

      rzp.on("payment.failed", (failed) => {
        toast.error(failed.error?.description || "Payment failed. You can retry.");
        setBuying(null);
      });

      rzp.open();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Sign in to buy credits.");
      } else if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Could not start checkout. Try again.");
      }
      setBuying(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-primary">Credits</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Pricing</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          New accounts start with {STARTING_CREDITS} credits. Each voice call uses{" "}
          {CREDITS_PER_CALL} credit. Pay with Razorpay to add more.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4">
        <div>
          <p className="text-sm text-muted-foreground">Your balance</p>
          <p className="text-2xl font-semibold text-primary">{credits} credits</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {credits} call{credits === 1 ? "" : "s"} remaining
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <PhoneCall className="size-5 text-primary" />
          <h2 className="mt-4 text-lg font-semibold">Included</h2>
          <p className="mt-1 text-3xl font-semibold">${0}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {STARTING_CREDITS} credits on signup · {CREDITS_PER_CALL} credit per call
          </p>
        </div>

        {packs.map((pack) => (
          <div
            key={pack.id}
            className={`rounded-3xl border bg-card p-6 shadow-sm ${
              pack.id === "value"
                ? "border-primary shadow-primary/10"
                : "border-border"
            }`}
          >
            {pack.id === "value" ? (
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Best value
              </p>
            ) : (
              <Coins className="size-5 text-primary" />
            )}
            <h2 className="mt-3 text-lg font-semibold">{pack.name}</h2>
            <p className="mt-1 text-3xl font-semibold">${pack.priceUsd}</p>
            <p className="mt-2 text-sm text-muted-foreground">{pack.blurb}</p>
            <Button
              className="mt-5 w-full"
              disabled={buying !== null}
              onClick={() => buyPack(pack.id)}
            >
              {buying === pack.id ? "Opening checkout..." : `Pay $${pack.priceUsd}`}
            </Button>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Checkout amount is set on the server from the selected pack (INR subunits). Enable
        this currency on your Razorpay account.{" "}
        <Link href="/dashboard" className="text-primary hover:underline">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}

export default PricingPage;
