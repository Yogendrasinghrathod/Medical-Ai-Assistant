import "dotenv/config";
import { addMedicalDocuments } from "../services/vector.service";

const medicalDocuments = [
  {
    text: `
Common Cold:

A common cold is a viral infection of the upper respiratory tract.

Symptoms:
- Runny nose
- Sneezing
- Sore throat
- Mild cough
- Mild fever
- Fatigue

Treatment:
Rest, hydration, steam inhalation and symptomatic care.

Antibiotics are usually not needed because common cold is viral.

Seek medical help if breathing difficulty, high fever or symptoms worsen.
`,
    metadata: {
      source: "medical-db",
      category: "respiratory",
    },
  },

  {
    text: `
Influenza (Flu):

Influenza is a contagious viral respiratory illness.

Symptoms:
- Fever
- Body pain
- Chills
- Headache
- Dry cough
- Weakness

Management:
Rest, fluids and doctor consultation if symptoms are severe.
`,
    metadata: {
      source: "medical-db",
      category: "respiratory",
    },
  },

  {
    text: `
Diabetes Mellitus:

Diabetes is a chronic condition where blood glucose levels remain high.

Symptoms:
- Excessive thirst
- Frequent urination
- Fatigue
- Blurred vision
- Slow wound healing

Risk factors:
- Obesity
- Family history
- Lack of exercise

Management:
Healthy diet, physical activity, glucose monitoring and prescribed medicine.
`,
    metadata: {
      source: "medical-db",
      category: "endocrine",
    },
  },

  {
    text: `
Hypertension:

High blood pressure increases risk of heart disease, kidney disease and stroke.

Symptoms:
Often silent.

Possible symptoms:
- Headache
- Dizziness
- Chest discomfort

Management:
Exercise, low salt diet, stress management and medication if prescribed.
`,
    metadata: {
      source: "medical-db",
      category: "cardiology",
    },
  },

  {
    text: `
Heart Attack:

Heart attack occurs when blood supply to heart muscles is blocked.

Warning symptoms:
- Chest pressure or pain
- Pain spreading to arm, jaw or back
- Sweating
- Shortness of breath
- Nausea

This requires immediate emergency medical attention.
`,
    metadata: {
      source: "medical-db",
      category: "emergency",
    },
  },

  {
    text: `
Stroke:

Stroke happens when blood flow to the brain is interrupted.

FAST warning signs:

Face drooping.
Arm weakness.
Speech difficulty.
Time to seek emergency care.

Other symptoms:
Confusion, vision problems and loss of balance.
`,
    metadata: {
      source: "medical-db",
      category: "neurology",
    },
  },

  {
    text: `
Migraine:

Migraine is a neurological disorder causing recurring headaches.

Symptoms:
- Severe headache
- Nausea
- Vomiting
- Light sensitivity
- Sound sensitivity

Triggers:
Stress, dehydration, poor sleep and certain foods.
`,
    metadata: {
      source: "medical-db",
      category: "neurology",
    },
  },

  {
    text: `
Asthma:

Asthma causes inflammation and narrowing of airways.

Symptoms:
- Wheezing
- Shortness of breath
- Chest tightness
- Cough

Triggers:
Dust, smoke, allergies, exercise and infections.
`,
    metadata: {
      source: "medical-db",
      category: "respiratory",
    },
  },

  {
    text: `
Pneumonia:

Pneumonia is an infection affecting the lungs.

Symptoms:
- Fever
- Cough with mucus
- Chest pain
- Breathing difficulty
- Fatigue

Treatment depends on cause and severity.
`,
    metadata: {
      source: "medical-db",
      category: "respiratory",
    },
  },

  {
    text: `
Emergency Red Flags:

Seek urgent medical care for:

- Severe chest pain
- Difficulty breathing
- Loss of consciousness
- Severe bleeding
- Sudden weakness
- Seizures
- Severe allergic reactions
`,
    metadata: {
      source: "medical-guidelines",
      category: "red-flags",
    },
  },
];


async function seedMedicalData() {
  try {
    console.log("🚀 Starting medical knowledge seeding...");

    await addMedicalDocuments(medicalDocuments);

    console.log(
      `✅ Successfully seeded ${medicalDocuments.length} medical documents`
    );

    process.exit(0);

  } catch (error) {

    console.error(
      "❌ Medical seeding failed:",
      error
    );

    process.exit(1);
  }
}


seedMedicalData();