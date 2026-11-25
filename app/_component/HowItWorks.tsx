"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import {
  FileText,
  Mic,
  Stethoscope,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

const steps = [
  {
    n: "01",
    title: "Sign in",
    detail: "Create an account or log in. Your consultations and reports stay under your profile.",
    icon: UserPlus,
  },
  {
    n: "02",
    title: "Describe symptoms or pick a doctor",
    detail: "Type what you feel and we suggest a specialist, or start directly with a doctor card on the dashboard.",
    icon: Stethoscope,
  },
  {
    n: "03",
    title: "Talk on a live voice call",
    detail: "Start the call, allow the microphone, and speak with the AI agent. It asks follow-ups and stays in that specialty.",
    icon: Mic,
  },
  {
    n: "04",
    title: "Read your report",
    detail: "When you disconnect, a structured summary is saved. Open History anytime to view symptoms, notes, and next steps.",
    icon: FileText,
  },
];

export function HowItWorks() {
  const { isLoaded, isSignedIn } = useUser();
  const href = isLoaded && isSignedIn ? "/dashboard" : "/sign-up";

  return (
    <section id="how-it-works" className="scroll-mt-24 w-full px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Demo · How to use</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            From symptoms to a report in four steps
          </h2>
          <p className="mt-3 text-muted-foreground">
            This is the same flow you will use in the product. No extra setup—just sign in and start a consultation.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-start">
          <ol className="space-y-4">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.n}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-primary">
                      STEP {step.n}
                    </p>
                    <h3 className="mt-0.5 font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-lg shadow-primary/10 md:p-6">
            <p className="text-sm font-medium text-muted-foreground">Live demo preview</p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-background">
              <div className="flex items-center justify-between border-b border-border bg-brand-soft/60 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-primary" />
                  <span className="text-sm font-medium">General Physician AI</span>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  Connected
                </span>
              </div>
              <div className="space-y-3 p-4 text-sm">
                <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-muted px-3 py-2 text-foreground">
                  <p className="text-[11px] font-medium text-primary">You</p>
                  I have had a sore throat and mild fever for two days.
                </div>
                <div className="ml-auto max-w-[90%] rounded-2xl rounded-tr-md bg-primary px-3 py-2 text-primary-foreground">
                  <p className="text-[11px] font-medium text-primary-foreground/80">
                    AI doctor
                  </p>
                  Thanks for sharing. Any difficulty swallowing, rash, or shortness of breath?
                </div>
                <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-muted px-3 py-2 text-foreground">
                  <p className="text-[11px] font-medium text-primary">You</p>
                  Swallowing is a bit painful. No rash or breathing issues.
                </div>
                <div className="ml-auto max-w-[90%] rounded-2xl rounded-tr-md bg-primary px-3 py-2 text-primary-foreground">
                  <p className="text-[11px] font-medium text-primary-foreground/80">
                    AI doctor
                  </p>
                  Rest, fluids, and a clinician visit if it worsens. I will save this in your report.
                </div>
              </div>
              <div className="border-t border-border bg-muted/50 px-4 py-3">
                <p className="text-xs font-medium text-foreground">Report ready</p>
                <p className="text-xs text-muted-foreground">
                  Chief complaint: sore throat and fever · Severity: mild · Next: rest, hydrate, seek care if worse
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Sample conversation only. The real agent does not diagnose or prescribe. Always follow up with a licensed clinician when needed.
            </p>
            <Link href={href} className="mt-5 block">
              <Button className="w-full">Try this flow on the dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
