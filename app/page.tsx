"use client";

import { motion } from "motion/react";
import { FeatureBentoGrid } from "./_component/FeatureBentoGrid";
import { HowItWorks } from "./_component/HowItWorks";
import { SiteNavbar } from "./_component/SiteNavbar";
import { SiteFooter } from "./_component/SiteFooter";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <SiteNavbar />
      <div className="px-4 py-14 md:py-20">
        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-3xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          {"Talk to an AI medical specialist in minutes"
            .split(" ")
            .map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.08,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="relative z-10 mx-auto max-w-xl py-5 text-center text-lg text-muted-foreground"
        >
          Describe symptoms, match with a specialist, speak on a voice call, and
          get a structured report you can open later from History.
        </motion.p>
        <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-3">
          <GetStartedButton />
          <motion.a
            href="#how-it-works"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1 }}
            className="inline-flex h-10 items-center rounded-md border border-border bg-card px-5 text-sm font-medium text-foreground shadow-sm hover:bg-muted"
          >
            See how it works
          </motion.a>
        </div>
      </div>
      <HowItWorks />
      <div id="features" className="scroll-mt-24 w-full px-4 pb-16">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Features</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Built for real consultations
          </h2>
        </div>
        <FeatureBentoGrid />
      </div>
      <SiteFooter />
    </div>
  );
}

const GetStartedButton = () => {
  const { isLoaded, isSignedIn } = useUser();
  const href = isLoaded && isSignedIn ? "/dashboard" : "/sign-in";
  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 1 }}
        className="relative z-10"
      >
        <button className="h-10 w-52 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/90">
          Get started
        </button>
      </motion.div>
    </Link>
  );
};
