"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import AddNewSessionDialog from "./AddNewSessionDialog";
import axios from "axios";
import { HistoryTable } from "./HistoryTable";
import { SessionDetail } from "../medical-agent/[sessionId]/page";


function HistoryList() {
  const [historyList, setHistoryList] = useState<SessionDetail[]>([]);

  
  const GetHistoryList=async()=>{
    const result=await axios.get('/api/session-chat?sessionId=all');
    console.log(result.data);
    setHistoryList(result.data);
  }
  useEffect(()=>{
    GetHistoryList();
  },[])
  return (
    <div className="mt-10">
      {historyList.length == 0 ? (
        <div className="flex items-center flex-col justify-center  p-7 border-dashed rounded-2xl border-2">
          <Image
            src={"/medical-assistance.png"}
            alt="medical-assistance"
            width={150}
            height={150}
          />
          <h2 className="font-bold text-xl mt-5 ">No Recent Consultations</h2>
          <p>It looks like you haven&apos;t consulted any doctor yet</p>
          <AddNewSessionDialog/>
        </div>
      ) : (
        <div><HistoryTable historyList={historyList}/></div>
      )}
    </div>
  );
}

export default HistoryList;
