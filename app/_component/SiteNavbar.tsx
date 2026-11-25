"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Menu, Stethoscope, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
];

export function SiteNavbar() {
  const { isLoaded, isSignedIn } = useUser();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Stethoscope className="size-5" />
          </span>
          <span className="text-sm font-semibold tracking-tight md:text-base">
            AI Medical
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-brand-soft hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!isLoaded ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
          ) : isSignedIn ? (
            <>
              <Link href="/dashboard" className="hidden sm:block">
                <Button size="sm">Dashboard</Button>
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link href="/sign-in" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
          <button
            type="button"
            className="rounded-lg p-2 text-foreground sm:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-card px-4 py-3 sm:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-foreground"
              >
                {link.label}
              </a>
            ))}
            {isSignedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-primary"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-primary"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
