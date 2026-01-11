"use client";

import { doctorAgent } from "@/app/_component/DoctorAgentCard";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Circle, PhoneCall, PhoneOff } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import Vapi from "@vapi-ai/web";
import { toast } from "sonner";


export type SessionDetail = {
  id: number;
  notes: string;
  sessionId: string;
  report: JSON;
  selectedDoctor: doctorAgent | string | null;
  createdOn: string;
};

export type messages = {
  role: string;
  text: string;
};
function MedicalVoiceAgent() {
  const { sessionId } = useParams();
  const [sessionDetails, setSessionDetails] = useState<SessionDetail>();
  const [callStarted, setCallStarted] = useState(false);
  const vapiRef = useRef<Vapi | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>();
  const [liveTranscirpt, setLiveTranscript] = useState<string>();
  const [messages, setMessages] = useState<messages[]>([]);
  const router=useRouter();

  useEffect(() => {
    const GetSessionDetails = async () => {
      if (!sessionId) return;
      try {
        const result = await axios.get(
          "/api/session-chat?sessionId=" + sessionId
        );
        console.log(result.data);
        setSessionDetails(result.data);
      } catch (error) {
        console.error("Error fetching session details:", error);
      }
    };
    GetSessionDetails();
  }, [sessionId]);

  // Initialize Vapi once
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
    if (!apiKey) {
      console.error("VAPI API key is not set");
      return;
    }

    vapiRef.current = new Vapi(apiKey);

    // Set up event listeners once
    vapiRef.current.on("call-start", () => {
      console.log("Call started");
      setCallStarted(true);
    });

    vapiRef.current.on("call-end", () => {
      console.log("Call ended");
      setCallStarted(false);
    });

    vapiRef.current.on("message", (message: any) => {
      if (message.type === "transcript") {
        const { role, transcriptType, transcript } = message;
        console.log(`${message.role}: ${message.transcript}`);
        if (transcriptType == "partial") {
          setLiveTranscript(transcript);
          setCurrentRole(role);
        } else if (transcriptType == "final") {
          //final transcript
          setMessages((prev: any) => [
            ...prev,
            { role: role, text: transcript },
          ]);
          setLiveTranscript("");
          setCurrentRole(null);
        }
      }
    });

    vapiRef.current.on("speech-start", () => {
      console.log("Assistant started speaking");
      setCurrentRole("Assistant");
    });
    vapiRef.current.on("speech-end", () => {
      console.log("Assistant stopped speaking");
      setCurrentRole("User");
    });

    // Cleanup on unmount
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
        vapiRef.current = null;
      }
    };
  }, []);

  const StartCall = () => {
    const assistantId = sessionDetails?.selectedDoctor.assistantId;
    if (!vapiRef.current) {
      console.error("Vapi is not initialized");
      return;
    }
    if (!assistantId) {
      console.error("VAPI Voice Assistant ID is not set");
      alert("Voice Assistant ID is not configured");
      return;
    }
    try {
      vapiRef.current.start(assistantId);
    } catch (error) {
      console.error("Error starting call:", error);
      alert("Failed to start call. Please check your configuration.");
    }
  };

  
    const GenerateReport = async () => {
      const result=await axios.post("/api/generate-report",{
        sessionId:sessionId,
        sessionDetails,
        messages:messages
      })
      console.log(result.data);
  
      return result.data;
    
    }
  const StopCall = async() => {
    if (vapiRef.current) {
      try {
        vapiRef.current.stop();
        setCallStarted(false);
        const result=await GenerateReport();
        // vapiRef.current.off('call-start');
        toast.success("Report is Generated!")
        router.replace('/dashboard');
        
      } catch (error) {
        console.error("Error stopping call:", error);
      }
    }
  };

  return (
    <div className="p-5 border rounded-3xl bg-secondary">
      <div className="flex justify-between items-center">
        <h2 className="p-1 px-2 border rounded-md flex gap-2 items-center">
          <Circle
            className={`h-4 w-4 rounded-full ${
              callStarted ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {callStarted ? "Connected" : "Not Connected"}
        </h2>
        <h2 className="font-bold text-xl text-gray-400 ">00:00</h2>
      </div>
      {sessionDetails && sessionDetails.selectedDoctor && (
        <div className=" flex items-center flex-col mt-10">
          <Image
            src={sessionDetails.selectedDoctor.image}
            alt={sessionDetails.selectedDoctor.specialist}
            width={120}
            height={120}
            className="h-[100px] w-[100px] object-cover rounded-full"
          />
          <h3 className="mt-2 text-lg ">
            {sessionDetails.selectedDoctor.specialist}
          </h3>
          <p className="text-sm text-gray-400">AI Medical Voice Agent </p>

          <div
            className="mt-6 overflow-y-auto flex flex-col items-center 
     p-4 md:p-6 lg:p-8 xl:p-10"
          >
            {messages?.slice(-4).map((msg, index) => (
              <h2 key={index} className="text-gray-400 p-2">
                {msg.role}:{msg.text}
              </h2>
            ))}

            {liveTranscirpt && liveTranscirpt?.length > 0 && (
              <h2 className="text-lg">
                {currentRole} : {liveTranscirpt}
              </h2>
            )}
          </div>

          {!callStarted ? (
            <Button className="mt-20" onClick={StartCall}>
              <PhoneCall className="mr-2" />
              Start Call
            </Button>
          ) : (
            <Button
              variant={"destructive"}
              className="mt-20"
              onClick={StopCall}
            >
              <PhoneOff className="mr-2" />
              Disconnect
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default MedicalVoiceAgent;
