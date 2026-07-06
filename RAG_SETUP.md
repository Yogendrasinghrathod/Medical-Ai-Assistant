# RAG Setup Instructions

## Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Vector Database (Pinecone)
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=medical-knowledge

# Embedding Model (OpenAI)
OPENAI_API_KEY=your_openai_api_key_here
EMBEDDING_MODEL=text-embedding-3-small

# Existing Variables (keep these)
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=your_database_url_here
```

## Setup Steps

### 1. Create Pinecone Index

1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Create a new index named `medical-knowledge`
3. Set dimension to `1536` (for OpenAI text-embedding-3-small)
4. Set metric to `cosine`
5. Copy your API key to `.env`

### 2. Add Medical Documents

Create a script to populate your vector database with medical knowledge:

```typescript
import { addMedicalDocuments } from './services/vector.service';

const medicalDocuments = [
  {
    text: "Common symptoms of flu include fever, chills, body aches, cough, and fatigue. Most people recover within 1-2 weeks.",
    metadata: {
      source: "medical-guidelines",
      category: "symptoms"
    }
  },
  {
    text: "Chest pain can be a sign of serious conditions like heart attack, pulmonary embolism, or pneumonia. Seek immediate medical attention if chest pain is severe or accompanied by shortness of breath.",
    metadata: {
      source: "emergency-guidelines",
      category: "urgent"
    }
  }
  // Add more medical documents...
];

await addMedicalDocuments(medicalDocuments);
```

### 3. How RAG Works

The new report generation flow:

1. **Conversation Transcript** → Extract symptoms/context
2. **Search Vector Database** → Retrieve relevant medical knowledge
3. **Send to Gemini** → Transcript + Medical Context
4. **Generate Report** → Structured medical summary

### 4. Fallback Behavior

If RAG fails (vector DB down, no API keys, etc.), the system automatically:
- Falls back to original report generation
- Continues to work without medical context
- Logs the error for debugging

### 5. Testing

Test the RAG implementation:

1. Ensure vector DB has medical documents
2. Start a voice consultation
3. Generate a report
4. Check console logs for "RAG: Successfully retrieved medical context"

## Service Files Created

- `services/vector.service.ts` - Pinecone integration and embeddings
- `services/rag.service.ts` - RAG logic and medical context retrieval
- `services/report.service.ts` - Report generation with RAG enhancement

## Modified Files

- `app/api/generate-report/route.tsx` - Now uses report.service.ts
