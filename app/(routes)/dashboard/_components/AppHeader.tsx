"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useContext, useState } from "react";
import { Menu, Stethoscope, X } from "lucide-react";
import { UserDetailsContext } from "@/context/UserDetailsContext";

const menuOptions = [
  { id: 1, name: "Home", path: "/dashboard" },
  { id: 2, name: "History", path: "/dashboard/history" },
  { id: 3, name: "Pricing", path: "/pricing" },
  { id: 4, name: "Profile", path: "/profile" },
];

function AppHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const credits = useContext(UserDetailsContext)?.usersDetail?.credits;

  const isActive = (path: string) =>
    path === "/dashboard" ? pathname === path : pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Stethoscope className="size-5" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground md:text-base">
            AI Medical
          </span>
        </Link>

        <nav className="hidden items-center rounded-full border border-border bg-card p-1 shadow-sm md:flex">
          {menuOptions.map((option) => (
            <Link
              key={option.id}
              href={option.path}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                isActive(option.path)
                  ? "bg-primary font-medium text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {typeof credits === "number" && (
            <Link
              href="/profile"
              className="hidden rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground sm:inline-flex"
            >
              {credits} credits
            </Link>
          )}
          <UserButton />
          <button
            type="button"
            className="rounded-lg p-2 text-foreground md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-card px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {menuOptions.map((option) => (
              <Link
                key={option.id}
                href={option.path}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm ${
                  isActive(option.path)
                    ? "bg-brand-soft font-semibold text-primary"
                    : "text-foreground"
                }`}
              >
                {option.name}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

export default AppHeader;
