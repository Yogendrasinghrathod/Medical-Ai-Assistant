import { AIDoctorAgents } from "@/shared/list";
import React from "react";
import DoctorAgentCard from "./DoctorAgentCard";

function DoctorAgentList() {
  return (
    <section>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">
          AI specialist doctors
        </h2>
        <p className="text-sm text-muted-foreground">
          Pick a specialist to start a voice consultation right away.
        </p>
      </div>
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {AIDoctorAgents.map((doctor) => (
          <DoctorAgentCard key={doctor.id} doctorAgent={doctor} />
        ))}
      </div>
    </section>
  );
}

export default DoctorAgentList;
