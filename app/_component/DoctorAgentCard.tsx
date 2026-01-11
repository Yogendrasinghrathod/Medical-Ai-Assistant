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
  voiceId?:string
  assistantId:string
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
      console.log(result.data);
      if (result.data?.sessionId) {
        console.log(result.data.sessionId);
        router.push('/dashboard/medical-agent/' + result.data.sessionId);
      } else if (result.data?.error) {
        console.error('Error:', result.data.error, result.data.details);
        const errorMsg = result.data.details 
          ? `${result.data.error}: ${result.data.details}`
          : result.data.error || 'Failed to create session. Please try again.';
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Error creating session:', error);
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
    <div className=""> 
      <Image src={doctorAgent.image} alt={doctorAgent.specialist} width={200} height={300} className="w-full h-[250px] object-cover rounded-xl"/>
        <h2 className="font-bold ">{doctorAgent.specialist}</h2>
        <p className="line-clamp-2  text-sm text-gray-500">{doctorAgent.description}</p>
        <Button 
          className="w-full mt-2" 
          onClick={handleStartConsultation}
          disabled={loading}
        >
          {loading ? 'Starting...' : 'Start Consultation'} <IconArrowRight/>
        </Button>
    </div>
  );
}

export default DoctorAgentCard;
