'use client'
import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DialogClose } from "@radix-ui/react-dialog";
import { ArrowRight } from "lucide-react";
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

function AddNewSessionDialog() {
    const[note,setNote]=useState<string>();
    const[loading,setLoading]=useState(false);
    const[suggestedDoctors,setSuggestedDoctors]=useState<doctorAgent[]>([]);
    const[selectedDoctor,setSelectedDoctor]=useState<doctorAgent>();
    const[showDoctors,setShowDoctors]=useState(false);
    const router=useRouter()
    const OnClickNext=async()=>{
      setLoading(true);
      try {
        const result=await axios.post('/api/suggest-doctors',{
          notes:note
        })
        console.log(result.data);
        setSuggestedDoctors(result.data);
        setShowDoctors(true);
      } catch (error) {
        console.error('Error fetching suggested doctors:', error);
      } finally {
        setLoading(false);
      }

    }
    const onStartConsultation=async()=>{
      setLoading(true);
      try {
        const result=await axios.post('/api/session-chat',{
          notes:note,
          selectedDoctor:selectedDoctor
        });
        console.log(result.data)
        if(result.data?.sessionId){
          console.log(result.data.sessionId);
          router.push('/dashboard/medical-agent/'+result.data.sessionId)
        } else if(result.data?.error){
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
    }
  return (
    <Dialog>
      <DialogTrigger>
        <Button className="mt-3">+ Start a Consultation</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-bold">Add Basic Details</DialogTitle>
          <DialogDescription>
            {!showDoctors ? (
              <div>
                <h2>Add Symptoms or Any Other Details</h2>
                <Textarea
                  placeholder="Add Details here..."
                  className="h-[250px] mt-8"
                  onChange={(e)=>setNote(e.target.value)}
                  value={note}
                />
              </div>
            ) : (
              <div>
                <h2 className="font-semibold mb-4">Suggested Doctors</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {suggestedDoctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      onClick={() => setSelectedDoctor(doctor)}
                      className={`flex flex-col items-center border rounded-2xl shadow p-4 cursor-pointer transition-all ${
                        selectedDoctor?.id === doctor.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:border-blue-300'
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
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>
            <Button variant={"outline"} onClick={() => {
              setShowDoctors(false);
              setSuggestedDoctors([]);
              setSelectedDoctor(undefined);
            }}>Cancel</Button>
          </DialogClose>

          {!showDoctors ? (
            <Button disabled={!note || loading} onClick={OnClickNext}>
              {loading ? 'Loading...' : 'Next'} <ArrowRight/>
            </Button>
          ) : (
            <Button 
              disabled={!selectedDoctor || loading} 
              onClick={onStartConsultation}
            >
              {loading ? 'Starting...' : 'Start Consultation'} <ArrowRight/>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewSessionDialog;
