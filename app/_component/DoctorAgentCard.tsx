'use client'
import { Button } from "@/components/ui/button";
import { IconArrowRight } from "@tabler/icons-react";
import Image from "next/image";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export type doctorAgent = {
  id: number;
  specialist: string;
  description: string;
  image: string;
  agentPrompt: string;
  voiceId?: string
  assistantId: string
};

type props = {
  doctorAgent: doctorAgent;
};

function DoctorAgentCard({ doctorAgent }: props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStartConsultation = async () => {
    setLoading(true);
    try {
      const result = await axios.post('/api/session-chat', {
        notes: `Consultation started directly with ${doctorAgent.specialist}`,
        selectedDoctor: doctorAgent
      });
      if (result.data?.sessionId) {
        router.push('/dashboard/medical-agent/' + result.data.sessionId);
      } else if (result.data?.error) {
        const errorMsg = result.data.details
          ? `${result.data.error}: ${result.data.details}`
          : result.data.error || 'Failed to create session. Please try again.';
        alert(errorMsg);
      }
    } catch (error) {
      let errorMessage = 'Failed to create session. Please try again.';
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        if (errorData?.details) {
          errorMessage = `${errorData.error || 'Error'}: ${errorData.details}`;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/10">
      <div className="relative h-44 overflow-hidden bg-muted">
        <Image
          src={doctorAgent.image}
          alt={doctorAgent.specialist}
          width={400}
          height={300}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-foreground">{doctorAgent.specialist}</h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {doctorAgent.description}
        </p>
        <Button
          className="mt-4 w-full"
          onClick={handleStartConsultation}
          disabled={loading}
        >
          {loading ? "Starting..." : "Start consultation"} <IconArrowRight />
        </Button>
      </div>
    </div>
  );
}

export default DoctorAgentCard;
