"use client";

import { UserDetailsContext } from "@/context/UserDetailsContext";
import { Coins } from "lucide-react";
import Link from "next/link";
import { useContext } from "react";

export default function CreditsSummary() {
  const credits = useContext(UserDetailsContext)?.usersDetail?.credits ?? 0;

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm">
        <Coins className="size-4 text-primary" />
        {credits} credits available
      </div>
      <Link
        href="/pricing"
        className="text-sm font-medium text-primary-foreground underline-offset-4 hover:underline"
      >
        Buy more
      </Link>
    </div>
  );
}
