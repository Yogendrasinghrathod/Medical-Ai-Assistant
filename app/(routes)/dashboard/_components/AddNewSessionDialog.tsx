'use client'
import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, PhoneCall } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";

type doctorAgent = {
  id: number;
  specialist: string;
  description: string;
  image: string;
  agentPrompt: string;
  voiceId?: string;
  subscriptionRequired?: boolean;
};

type AddNewSessionDialogProps = {
  triggerLabel?: string;
  triggerClassName?: string;
};

function AddNewSessionDialog({
  triggerLabel = "Start a consultation",
  triggerClassName,
}: AddNewSessionDialogProps) {
  const [note, setNote] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [suggestedDoctors, setSuggestedDoctors] = useState<doctorAgent[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<doctorAgent>();
  const [showDoctors, setShowDoctors] = useState(false);
  const router = useRouter()
  const OnClickNext = async () => {
    setLoading(true);
    try {
      const result = await axios.post('/api/suggest-doctors', {
        notes: note
      })
      setSuggestedDoctors(result.data);
      setShowDoctors(true);
    } catch (error) {
      // Error fetching suggested doctors
    } finally {
      setLoading(false);
    }

  }
  const onStartConsultation = async () => {
    setLoading(true);
    try {
      const result = await axios.post('/api/session-chat', {
        notes: note,
        selectedDoctor: selectedDoctor
      });
      if (result.data?.sessionId) {
        router.push('/dashboard/medical-agent/' + result.data.sessionId)
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
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={triggerClassName}>
          <PhoneCall className="size-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-bold">Add Basic Details</DialogTitle>
          <DialogDescription>
            {showDoctors
              ? "Select a suggested specialist to start the consultation."
              : "Add symptoms or any other details for this consultation."}
          </DialogDescription>
        </DialogHeader>
        {!showDoctors ? (
          <div>
            <h2 className="text-base font-medium text-foreground">Add Symptoms or Any Other Details</h2>
            <Textarea
              placeholder="Add Details here..."
              className="h-[250px] mt-8"
              onChange={(e) => setNote(e.target.value)}
              value={note}
            />
          </div>
        ) : (
          <div>
            <h2 className="font-semibold mb-4 text-foreground">Suggested Doctors</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {suggestedDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  onClick={() => setSelectedDoctor(doctor)}
                  className={`flex flex-col items-center border rounded-2xl shadow p-4 cursor-pointer transition-all ${selectedDoctor?.id === doctor.id
                      ? 'border-primary bg-brand-soft'
                      : 'hover:border-primary/40'
                    }`}
                >
                  <Image
                    src={doctor.image}
                    alt={doctor.specialist}
                    width={70}
                    height={70}
                    className="w-[50px] h-[50px] rounded-full object-cover"
                  />
                  <h3 className="font-bold text-sm text-center mt-2">{doctor.specialist}</h3>
                  <p className="text-xs text-center line-clamp-2 text-gray-600">{doctor.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"outline"} onClick={() => {
              setShowDoctors(false);
              setSuggestedDoctors([]);
              setSelectedDoctor(undefined);
            }}>Cancel</Button>
          </DialogClose>

          {!showDoctors ? (
            <Button disabled={!note || loading} onClick={OnClickNext}>
              {loading ? 'Loading...' : 'Next'} <ArrowRight />
            </Button>
          ) : (
            <Button
              disabled={!selectedDoctor || loading}
              onClick={onStartConsultation}
            >
              {loading ? 'Starting...' : 'Start Consultation'} <ArrowRight />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewSessionDialog;
