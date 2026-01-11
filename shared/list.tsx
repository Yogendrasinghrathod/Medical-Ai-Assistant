export const AIDoctorAgents = [
    {
        id: 1,
        specialist: "General Physician",
        description: "Helps with everyday health concerns and common symptoms.",
        image: "/doctor1.png",
        agentPrompt: "You are a friendly General Physician AI. Greet the user and quickly ask what symptoms they're experiencing. Keep responses short and helpful.",
        voiceId: "will",
        assistantId: process.env.NEXT_PUBLIC_ASSISTANT_ID_GENERAL_PHYSICIAN || "",
        subscriptionRequired: false
    },
    {
        id: 2,
        specialist: "Pediatrician",
        description: "Expert in children's health, from babies to teens.",
        image: "/doctor2.png",
        agentPrompt: "You are a kind Pediatrician AI. Ask brief questions about the child's health and share quick, safe suggestions.",
        voiceId: "chris",
        assistantId: process.env.NEXT_PUBLIC_ASSISTANT_ID_PEDIATRICIAN || "",
        subscriptionRequired: true
    },
    {
        id: 3,
        specialist: "Dermatologist",
        description: "Handles skin issues like rashes, acne, or infections.",
        image: "/doctor3.png",
        agentPrompt: "You are a knowledgeable Dermatologist AI. Ask short questions about the skin issue and give simple, clear advice.",
        voiceId: "sarge",
        assistantId: process.env.NEXT_PUBLIC_ASSISTANT_ID_DERMATOLOGIST || "",
        subscriptionRequired: true
    },
    {
        id: 4,
        specialist: "Psychologist",
        description: "Supports mental health and emotional well-being.",
        image: "/doctor4.png",
        agentPrompt: "You are a caring Psychologist AI. Ask how the user is feeling emotionally and give short, supportive tips.",
        voiceId: "susan",
        assistantId: process.env.NEXT_PUBLIC_ASSISTANT_ID_PSYCHOLOGIST || "",
        subscriptionRequired: true
    },
    {
        id: 5,
        specialist: "Nutritionist",
        description: "Provides advice on healthy eating and weight management.",
        image: "/doctor5.png",
        agentPrompt: "You are a motivating Nutritionist AI. Ask about current diet or goals and suggest quick, healthy tips.",
        voiceId: "eileen",
        assistantId: process.env.NEXT_PUBLIC_ASSISTANT_ID_NUTRITIONIST || "",
        subscriptionRequired: true
    },
    {
        id: 6,
        specialist: "Cardiologist",
        description: "Focuses on heart health and blood pressure issues.",
        image: "/doctor6.png",
        agentPrompt: "You are a calm Cardiologist AI. Ask about heart symptoms and offer brief, helpful advice.",
        voiceId: "charlotte",
        assistantId: process.env.NEXT_PUBLIC_ASSISTANT_ID_CARDIOLOGIST || "",
        subscriptionRequired: true
    },
    {
        id: 7,
        specialist: "ENT Specialist",
        description: "Handles ear, nose, and throat-related problems.",
        image: "/doctor7.png",
        agentPrompt: "You are a friendly ENT AI. Ask quickly about ENT symptoms and give simple, clear suggestions.",
        voiceId: "ayla",
        assistantId: process.env.NEXT_PUBLIC_ASSISTANT_ID_ENT_SPECIALIST || "",
        subscriptionRequired: true
    },
    {
        id: 8,
        specialist: "Orthopedic",
        description: "Helps with bone, joint, and muscle pain.",
        image: "/doctor8.png",
        agentPrompt: "You are an understanding Orthopedic AI. Ask where the pain is and give short, supportive advice.",
        voiceId: "aaliyah",
        assistantId: process.env.NEXT_PUBLIC_ASSISTANT_ID_ORTHOPEDIC || "",
        subscriptionRequired: true
    },
    {
        id: 9,
        specialist: "Gynecologist",
        description: "Cares for women's reproductive and hormonal health.",
        image: "/doctor9.png",
        agentPrompt: "You are a respectful Gynecologist AI. Ask brief, gentle questions and keep answers short and reassuring.",
        voiceId: "hudson",
        assistantId: process.env.NEXT_PUBLIC_ASSISTANT_ID_GYNECOLOGIST || "",
        subscriptionRequired: true
    },
    {
        id: 10,
        specialist: "Dentist",
        description: "Handles oral hygiene and dental problems.",
        image: "/doctor10.png",
        agentPrompt: "You are a cheerful Dentist AI. Ask about the dental issue and give quick, calming suggestions.",
        voiceId: "atlas",
        assistantId: process.env.NEXT_PUBLIC_ASSISTANT_ID_DENTIST || "",
        subscriptionRequired: true
    }
];
