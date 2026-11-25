"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import AddNewSessionDialog from "./AddNewSessionDialog";
import axios from "axios";
import { HistoryTable } from "./HistoryTable";
import { SessionDetail } from "../medical-agent/[sessionId]/page";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 5;

function HistoryList() {
  const [historyList, setHistoryList] = useState<SessionDetail[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    const GetHistoryList = async () => {
      setLoading(true);
      try {
        const result = await axios.get("/api/session-chat", {
          params: { sessionId: "all", page, limit: PAGE_SIZE },
        });
        const payload = result.data;
        const items = Array.isArray(payload) ? payload : payload?.items || [];
        setHistoryList(items);
        setTotal(Array.isArray(payload) ? payload.length : payload?.total ?? 0);
      } finally {
        setLoading(false);
      }
    };
    GetHistoryList();
  }, [page]);

  if (!loading && total === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/60 px-6 py-12 text-center">
        <Image
          src={"/medical-assistance.png"}
          alt="medical-assistance"
          width={120}
          height={120}
        />
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          No consultations yet
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Start with a specialist to see your reports and history here.
        </p>
        <div className="mt-4">
          <AddNewSessionDialog />
        </div>
      </div>
    );
  }

  const startIndex = (page - 1) * PAGE_SIZE;

  return (
    <div>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      ) : (
        <HistoryTable historyList={historyList} startIndex={startIndex} />
      )}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {total === 0 ? 0 : startIndex + 1}–
          {Math.min(startIndex + historyList.length, total)} of {total}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <span className="min-w-24 text-center text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HistoryList;
