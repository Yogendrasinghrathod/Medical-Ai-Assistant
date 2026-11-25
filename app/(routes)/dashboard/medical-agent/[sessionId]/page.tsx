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
import { UserDetailsContext } from "@/context/UserDetailsContext";


export type messages = {
  role: string;
  text: string;
};

export type SessionDetail = {
  id: number;
  notes: string;
  sessionId: string;
  report: JSON;
  selectedDoctor: doctorAgent | string | null;
  selectedDoctorId?: number | null;
  conversation?: messages[];
  createdOn: string;
  summary?: string;
  symptoms?: string[];
  duration?: string;
  severity?: string;
  medications?: string[];
};
function MedicalVoiceAgent() {
  const userDetailsContext = React.useContext(UserDetailsContext);
  const { sessionId } = useParams();
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;
  const [sessionDetails, setSessionDetails] = useState<SessionDetail>();
  const [callStarted, setCallStarted] = useState(false);
  const vapiRef = useRef<Vapi | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>();
  const [liveTranscirpt, setLiveTranscript] = useState<string>();
  const [messages, setMessages] = useState<messages[]>([]);
  const router = useRouter();

  useEffect(() => {
    const GetSessionDetails = async () => {
      if (!sessionId) return;
      try {
        const result = await axios.get(
          "/api/session-chat?sessionId=" + sessionId
        );
        setSessionDetails(result.data);
        if (Array.isArray(result.data?.conversation)) {
          setMessages(
            result.data.conversation.map((turn: { role?: string; text?: string }) => ({
              role: turn.role || "user",
              text: turn.text || "",
            }))
          );
        }
      } catch (error) {
        // Error fetching session details
      }
    };
    GetSessionDetails();
  }, [sessionId]);

  // Initialize Vapi once
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
    if (!apiKey) {
      return;
    }

    vapiRef.current = new Vapi(apiKey);

    // Set up event listeners once
    vapiRef.current.on("call-start", () => {
      setCallStarted(true);
    });

    vapiRef.current.on("call-end", () => {
      setCallStarted(false);
    });

    vapiRef.current.on("message", (message: any) => {
      if (message.type === "transcript") {
        const { role, transcriptType, transcript } = message;
        if (transcriptType == "partial") {
          setLiveTranscript(transcript);
          setCurrentRole(role);
        } else if (transcriptType == "final") {
          setMessages((prev: messages[]) => {
            const next = [...prev, { role: role, text: transcript }];
            const currentSessionId = sessionIdRef.current;
            if (currentSessionId) {
              axios
                .put("/api/session-chat", {
                  sessionId: currentSessionId,
                  messages: next,
                })
                .catch(() => {});
            }
            return next;
          });
          setLiveTranscript("");
          setCurrentRole(null);
        }
      }
    });

    vapiRef.current.on("speech-start", () => {
      setCurrentRole("Assistant");
    });
    vapiRef.current.on("speech-end", () => {
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

  const StartCall = async () => {
    const selectedDoctor = sessionDetails?.selectedDoctor;
    if (!selectedDoctor || typeof selectedDoctor === 'string' || !selectedDoctor.assistantId) {
      alert("Voice Assistant ID is not configured");
      return;
    }
    const sharedAssistantId = process.env.NEXT_PUBLIC_ASSISTANT_ID_CONSULTATION;
    const assistantId = sharedAssistantId || selectedDoctor.assistantId;
    if (!vapiRef.current) {
      return;
    }
    try {
      const rateLimit = await axios.post("/api/ratelimit/start-call");
      const remaining = rateLimit.data?.remaining;
      const creditsLeft = rateLimit.data?.credits;
      if (
        userDetailsContext?.usersDetail &&
        typeof creditsLeft === "number"
      ) {
        userDetailsContext.setUserDetail({
          ...userDetailsContext.usersDetail,
          credits: creditsLeft,
        });
      }

      vapiRef.current.start(assistantId, {
        variableValues: {
          doctorId: String(selectedDoctor.id),
          doctorName: selectedDoctor.specialist,
          specialty: selectedDoctor.specialist,
          systemInstructions: selectedDoctor.agentPrompt,
        },
        metadata: {
          sessionId: String(sessionId),
        },
      });

      if (typeof creditsLeft === "number") {
        toast.success(`Call started. ${creditsLeft} credit${creditsLeft === 1 ? "" : "s"} left.`);
      } else if (typeof remaining === "number") {
        toast.success(`Call started. ${remaining} start call${remaining === 1 ? "" : "s"} remaining in 60 minutes.`);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        const remaining = error.response.data?.remaining;
        const remainingText =
          typeof remaining === "number" ? ` Remaining: ${remaining}.` : "";
        toast.error(`Only 2 start calls are allowed in 60 minutes.${remainingText}`);
        return;
      }
      if (axios.isAxiosError(error) && error.response?.status === 402) {
        toast.error(
          error.response.data?.message ||
            "Not enough credits. Buy more on the Pricing page."
        );
        return;
      }
      toast.error("Failed to start call.");
    }
  };


  const GenerateReport = async () => {
    const result = await axios.post("/api/generate-report", {
      sessionId: sessionId,
      sessionDetails,
      messages: messages
    })

    return result.data;

  }
  const StopCall = async () => {
    if (vapiRef.current) {
      try {
        vapiRef.current.stop();
        setCallStarted(false);
        const result = await GenerateReport();
        // vapiRef.current.off('call-start');
        toast.success("Report is Generated!")
        router.replace('/dashboard');

      } catch (error) {
        // Error stopping call
      }
    }
  };

  return (
    <div className="p-5 border border-border rounded-3xl bg-card shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="p-1 px-2 border rounded-md flex gap-2 items-center">
          <Circle
            className={`h-4 w-4 rounded-full ${callStarted ? "bg-green-500" : "bg-red-500"
              }`}
          />
          {callStarted ? "Connected" : "Not Connected"}
        </h2>
        <h2 className="font-bold text-xl text-gray-400 ">00:00</h2>
      </div>
      {sessionDetails && sessionDetails.selectedDoctor && typeof sessionDetails.selectedDoctor !== 'string' && (
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
