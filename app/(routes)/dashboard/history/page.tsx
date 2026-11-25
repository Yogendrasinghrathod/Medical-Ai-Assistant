import React from "react";
import HistoryList from "../_components/HistoryList";

function History() {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-6">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-foreground">Consultation history</h1>
        <p className="text-sm text-muted-foreground">
          Browse your reports five at a time, newest first.
        </p>
      </div>
      <HistoryList />
    </div>
  );
}

export default History;
