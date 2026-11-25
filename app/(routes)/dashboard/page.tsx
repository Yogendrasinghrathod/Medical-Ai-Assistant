import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const HistoryList = dynamic(() => import("./_components/HistoryList"), {
  loading: () => (
    <div className="h-64 animate-pulse rounded-2xl bg-card shadow-sm" />
  ),
});
const DoctorAgentList = dynamic(() => import("@/app/_component/DoctorAgentList"), {
  loading: () => (
    <div className="h-64 animate-pulse rounded-2xl bg-card shadow-sm" />
  ),
});
const AddNewSessionDialog = dynamic(
  () => import("./_components/AddNewSessionDialog")
);

function Dashboard() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-deep via-primary to-brand-mid p-6 text-primary-foreground shadow-lg shadow-primary/25 md:p-8">
        <p className="text-sm font-medium text-primary-foreground/80">
          Patient dashboard
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          Ready for your next consultation?
        </h1>
        <p className="mt-2 max-w-xl text-sm text-primary-foreground/85 md:text-base">
          Describe symptoms, get a matching specialist, and start a voice session
          in a few taps.
        </p>
        <div className="mt-5">
          <AddNewSessionDialog
            triggerClassName="bg-card text-primary hover:bg-brand-soft"
            triggerLabel="Start a consultation"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-6">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Recent consultations
            </h2>
            <p className="text-sm text-muted-foreground">
              Latest 5 sessions. Use the pages below for older reports.
            </p>
          </div>
          <Link
            href="/dashboard/history"
            className="text-sm font-medium text-primary hover:opacity-80"
          >
            View all
          </Link>
        </div>
        <HistoryList />
      </section>

      <DoctorAgentList />
    </div>
  );
}

export default Dashboard;
