import React from "react";
import dynamic from "next/dynamic";

const HistoryList = dynamic(() => import("./_components/HistoryList"), {
  loading: () => <div className="h-64 bg-slate-200 animate-pulse rounded-xl"></div>,
});
const DoctorAgentList = dynamic(() => import("@/app/_component/DoctorAgentList"), {
  loading: () => <div className="h-64 bg-slate-200 animate-pulse rounded-xl"></div>,
});
const AddNewSessionDialog = dynamic(() => import("./_components/AddNewSessionDialog"));

function Dashboard() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-2xl ">My Dashboard</h2>
        <AddNewSessionDialog />
      </div>
      <HistoryList />
      <DoctorAgentList />
    </div>
  );
}

export default Dashboard;
