"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SessionDetail } from "../(routes)/dashboard/medical-agent/[sessionId]/page";
import moment from "moment";
import { Stethoscope } from "lucide-react";

type MedicalReport = {
  sessionId?: string;
  agent?: string;
  user?: string;
  timestamp?: string;
  chiefComplaint?: string;
  summary?: string;
  symptoms?: string[];
  duration?: string;
  severity?: string;
  medicationsMentioned?: string[];
  medications?: string[];
  recommendations?: string[];
};

type Props = {
  record: SessionDetail;
};

function asList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

function parseReport(raw: unknown): MedicalReport {
  if (!raw) {
    return {};
  }
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as MedicalReport;
    } catch {
      return {};
    }
  }
  if (typeof raw === "object") {
    return raw as MedicalReport;
  }
  return {};
}

function specialistName(record: SessionDetail, report: MedicalReport) {
  if (report.agent) {
    return report.agent;
  }
  if (typeof record.selectedDoctor === "string") {
    return record.selectedDoctor;
  }
  return record.selectedDoctor?.specialist || "AI Medical Specialist";
}

function ViewReportDialog({ record }: Props) {
  const report = parseReport(record.report);
  const specialist = specialistName(record, report);
  const consultedOn = report.timestamp || record.createdOn;
  const patient = report.user || "Anonymous";
  const complaint = report.chiefComplaint || record.notes || "Not recorded.";
  const summary = report.summary || record.summary || "";
  const symptoms = asList(report.symptoms || record.symptoms);
  const medications = asList(
    report.medicationsMentioned || report.medications || record.medications
  );
  const recommendations = asList(report.recommendations);
  const duration = report.duration || record.duration;
  const severity = report.severity || record.severity;
  const reportId = (report.sessionId || record.sessionId || "—").slice(0, 8).toUpperCase();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View report
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-3xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Consultation report</DialogTitle>
          <DialogDescription>
            Generated health summary for this session.
          </DialogDescription>
        </DialogHeader>

        <article className="bg-[#f7f4ec] px-6 py-8 text-[#1f2a24] sm:px-10">
          <header className="border-b-2 border-primary/30 pb-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Stethoscope className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    AI Medical
                  </p>
                  <h2 className="font-serif text-2xl font-semibold tracking-tight">
                    Consultation Summary
                  </h2>
                </div>
              </div>
              <div className="text-right text-xs text-[#5b655f]">
                <p>Report #{reportId}</p>
                <p>
                  {consultedOn
                    ? moment(consultedOn).format("D MMMM YYYY")
                    : "Date not recorded"}
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#4d5752]">
              Confidential health summary prepared after a voice consultation.
              This is not a clinical chart or a substitute for in-person care.
            </p>
          </header>

          <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 border-b border-[#d9d3c4] pb-5 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-[#7a847e]">
                Specialist
              </dt>
              <dd className="mt-1 font-medium">{specialist}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-[#7a847e]">
                Patient
              </dt>
              <dd className="mt-1 font-medium">{patient}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-[#7a847e]">
                Consulted
              </dt>
              <dd className="mt-1 font-medium">
                {consultedOn
                  ? moment(consultedOn).format("h:mm a")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-[#7a847e]">
                Session
              </dt>
              <dd className="mt-1 font-mono text-xs">{reportId}</dd>
            </div>
          </dl>

          <section className="mt-8">
            <h3 className="font-serif text-lg font-semibold">Reason for visit</h3>
            <p className="mt-2 font-serif text-[15px] leading-7">{complaint}</p>
          </section>

          {summary ? (
            <section className="mt-7">
              <h3 className="font-serif text-lg font-semibold">Clinical narrative</h3>
              <p className="mt-2 font-serif text-[15px] leading-7">{summary}</p>
            </section>
          ) : null}

          <section className="mt-7">
            <h3 className="font-serif text-lg font-semibold">Observations</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-[#d9d3c4] bg-white/60 p-3">
                <p className="text-[11px] uppercase tracking-wider text-[#7a847e]">
                  Duration
                </p>
                <p className="mt-1 text-sm font-medium">{duration || "Not recorded"}</p>
              </div>
              <div className="rounded-lg border border-[#d9d3c4] bg-white/60 p-3">
                <p className="text-[11px] uppercase tracking-wider text-[#7a847e]">
                  Severity
                </p>
                <p className="mt-1 text-sm font-medium capitalize">
                  {severity || "Not recorded"}
                </p>
              </div>
              <div className="rounded-lg border border-[#d9d3c4] bg-white/60 p-3">
                <p className="text-[11px] uppercase tracking-wider text-[#7a847e]">
                  Symptoms noted
                </p>
                <p className="mt-1 text-sm font-medium">
                  {symptoms.length ? symptoms.join(", ") : "None listed"}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-7">
            <h3 className="font-serif text-lg font-semibold">Medications discussed</h3>
            {medications.length ? (
              <p className="mt-2 font-serif text-[15px] leading-7">
                {medications.join("; ")}.
              </p>
            ) : (
              <p className="mt-2 font-serif text-[15px] leading-7 text-[#5b655f]">
                No medications were mentioned during this consultation.
              </p>
            )}
          </section>

          <section className="mt-7">
            <h3 className="font-serif text-lg font-semibold">Suggested next steps</h3>
            {recommendations.length ? (
              <ol className="mt-3 list-decimal space-y-2 pl-5 font-serif text-[15px] leading-7">
                {recommendations.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 font-serif text-[15px] leading-7 text-[#5b655f]">
                No specific next steps were generated. Please consult a licensed
                clinician if symptoms persist or worsen.
              </p>
            )}
          </section>

          <footer className="mt-10 border-t border-[#d9d3c4] pt-4 text-[11px] leading-5 text-[#6b746e]">
            Prepared by AI Medical for informational use only. This document is
            not a diagnosis, prescription, or medical record. Seek urgent care
            for emergency symptoms. Generated for Yogendra Singh Rathod —
            educational demonstration.
          </footer>
        </article>
      </DialogContent>
    </Dialog>
  );
}

export default ViewReportDialog;
