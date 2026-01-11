"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import {
  IconMicrophone,
  IconStethoscope,
  IconHeartbeat,
  IconFileText,
  IconClock,
  IconBrain,
  IconSearch,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

export function FeatureBentoGrid() {
  return (
    <BentoGrid className="max-w-6xl mx-auto md:auto-rows-[22rem]">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          className={cn("[&>p:text-lg]", item.className)}
          icon={item.icon}
        />
      ))}
    </BentoGrid>
  );
}

// Voice Consultation Animation
const VoiceConsultation = () => {
  const [isActive, setIsActive] = useState(false);
  
  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      onHoverStart={() => setIsActive(true)}
      onHoverEnd={() => setIsActive(false)}
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] rounded-lg flex-col items-center justify-center space-y-4 p-4"
    >
      <div className="flex items-center space-x-2">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-full"
            variants={{
              initial: { height: 8 },
              animate: {
                height: [8, 32, 8],
                transition: {
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                },
              },
            }}
          />
        ))}
      </div>
      <motion.div
        variants={{
          initial: { scale: 1 },
          animate: { scale: [1, 1.1, 1] },
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg"
      >
        <IconMicrophone className="h-8 w-8 text-white" />
      </motion.div>
      <motion.p
        variants={{
          initial: { opacity: 0.5 },
          animate: { opacity: 1 },
        }}
        className="text-xs text-center font-semibold text-blue-600 dark:text-blue-400"
      >
        {isActive ? "Listening..." : "Voice AI Active"}
      </motion.p>
    </motion.div>
  );
};

// AI Medical Specialists - Using actual doctors from the project
const MedicalSpecialists = () => {
  const specialists = [
    { name: "General Physician", color: "from-blue-500 to-cyan-500", icon: "👨‍⚕️" },
    { name: "Pediatrician", color: "from-green-500 to-emerald-500", icon: "👶" },
    { name: "Dermatologist", color: "from-purple-500 to-pink-500", icon: "🧴" },
  ];

  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] rounded-lg flex-row space-x-2 p-2"
    >
      {specialists.map((spec, i) => (
        <motion.div
          key={i}
          variants={{
            initial: { y: 0, opacity: 0.8 },
            hover: { y: -8, opacity: 1 },
          }}
          transition={{ delay: i * 0.1 }}
          className={cn(
            "h-full w-1/3 rounded-xl bg-gradient-to-br",
            spec.color,
            "p-3 flex flex-col items-center justify-center space-y-2 shadow-lg"
          )}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            className="text-3xl"
          >
            {spec.icon}
          </motion.div>
          <p className="text-xs font-bold text-white text-center leading-tight">{spec.name}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Symptom-Based Doctor Matching
const SymptomMatching = () => {
  const symptoms = ["Headache", "Fever", "Rash"];
  const [matched, setMatched] = useState(false);

  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      onHoverStart={() => setMatched(true)}
      onHoverEnd={() => setMatched(false)}
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] rounded-lg flex-col space-y-3 p-4"
    >
      <div className="flex items-center space-x-2 mb-2">
        <IconSearch className="h-4 w-4 text-indigo-500" />
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          Analyzing Symptoms...
        </span>
      </div>
      {symptoms.map((symptom, i) => (
        <motion.div
          key={i}
          variants={{
            initial: { x: -20, opacity: 0 },
            hover: { 
              x: 0, 
              opacity: 1,
              transition: { delay: i * 0.15 }
            },
          }}
          className="flex items-center justify-between p-2 rounded-lg bg-white/50 dark:bg-black/50 backdrop-blur-sm"
        >
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {symptom}
          </span>
          <motion.div
            className="px-2 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
            animate={matched ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, delay: i * 0.2 }}
          >
            <span className="text-xs font-bold text-white">✓</span>
          </motion.div>
        </motion.div>
      ))}
      {matched && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-2 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30"
        >
          <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 text-center">
            → Matched with Specialist
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

// Medical Reports Generation
const MedicalReports = () => {
  const [progress, setProgress] = useState(0);

  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      onHoverStart={() => {
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              return 100;
            }
            return prev + 10;
          });
        }, 200);
      }}
      onHoverEnd={() => setProgress(0)}
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] rounded-lg flex-col space-y-4 p-4"
    >
      <motion.div
        variants={{
          initial: { scale: 0.8, rotate: -5 },
          hover: { scale: 1, rotate: 0 },
        }}
        className="flex-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-4 flex items-center justify-center"
      >
        <IconFileText className="h-12 w-12 text-white" />
      </motion.div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            Generating Report
          </span>
          <span className="text-gray-500">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

// Session History Tracking
const SessionHistory = () => {
  const sessions = [
    { date: "Today", doctor: "General Physician", status: "completed" },
    { date: "2 days ago", doctor: "Pediatrician", status: "completed" },
    { date: "1 week ago", doctor: "Dermatologist", status: "completed" },
  ];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] rounded-lg flex-col space-y-2 p-4"
    >
      {sessions.map((session, i) => (
        <motion.div
          key={i}
          variants={{
            initial: { x: -20, opacity: 0 },
            animate: {
              x: 0,
              opacity: 1,
              transition: { delay: i * 0.15 },
            },
          }}
          className="flex items-center justify-between p-2 rounded-lg bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {session.doctor}
            </span>
            <span className="text-xs text-gray-500">{session.date}</span>
          </div>
          <motion.div
            className="w-2 h-2 rounded-full bg-green-500"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

// 24/7 Availability
const AlwaysAvailable = () => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] rounded-lg relative overflow-hidden"
    >
      <motion.div
        variants={{
          initial: { scale: 0.8, opacity: 0.5 },
          animate: {
            scale: [0.8, 1, 0.8],
            opacity: [0.5, 1, 0.5],
            transition: {
              duration: 3,
              repeat: Infinity,
            },
          },
        }}
        className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-lg"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <IconClock className="h-12 w-12 text-white" />
        </motion.div>
        <motion.div
          variants={{
            initial: { opacity: 0 },
            animate: {
              opacity: [0, 1, 0],
              transition: { duration: 2, repeat: Infinity },
            },
          }}
          className="text-center"
        >
          <p className="text-sm font-bold text-white">24/7</p>
          <p className="text-xs font-semibold text-white/90">Always Available</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

const items = [
  {
    title: "Voice Consultation",
    description: (
      <span className="text-sm">
        Real-time voice conversations with AI medical specialists for instant healthcare guidance and support.
      </span>
    ),
    header: <VoiceConsultation />,
    className: "md:col-span-1",
    icon: <IconMicrophone className="h-4 w-4 text-blue-500" />,
  },
  {
    title: "AI Medical Specialists",
    description: (
      <span className="text-sm">
        Access specialized AI doctors including General Physicians, Pediatricians, Dermatologists, and more.
      </span>
    ),
    header: <MedicalSpecialists />,
    className: "md:col-span-1",
    icon: <IconStethoscope className="h-4 w-4 text-red-500" />,
  },
  {
    title: "Smart Symptom Matching",
    description: (
      <span className="text-sm">
        AI analyzes your symptoms and automatically suggests the most relevant medical specialist for your needs.
      </span>
    ),
    header: <SymptomMatching />,
    className: "md:col-span-1",
    icon: <IconSearch className="h-4 w-4 text-indigo-500" />,
  },
  {
    title: "Medical Reports",
    description: (
      <span className="text-sm">
        Automated generation of comprehensive medical reports with symptoms, diagnosis, and recommendations after each consultation.
      </span>
    ),
    header: <MedicalReports />,
    className: "md:col-span-2",
    icon: <IconFileText className="h-4 w-4 text-indigo-500" />,
  },
  {
    title: "Consultation History",
    description: (
      <span className="text-sm">
        Track all your previous consultations with detailed session history and easy access to past reports.
      </span>
    ),
    header: <SessionHistory />,
    className: "md:col-span-1",
    icon: <IconHeartbeat className="h-4 w-4 text-emerald-500" />,
  },
  {
    title: "24/7 Availability",
    description: (
      <span className="text-sm">
        Get medical assistance anytime, anywhere. Our AI medical agents are available round the clock.
      </span>
    ),
    header: <AlwaysAvailable />,
    className: "md:col-span-1",
    icon: <IconClock className="h-4 w-4 text-green-500" />,
  },
];
