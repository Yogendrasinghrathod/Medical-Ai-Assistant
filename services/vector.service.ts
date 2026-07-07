import { GoogleGenAI } from '@google/genai';
import { Pinecone } from '@pinecone-database/pinecone';
console.log("🔥 GEMINI VECTOR SERVICE LOADED");
// Pinecone client for storing and searching medical documents
// Only initialize if API key is present and non-empty
const pineconeApiKey = process.env.PINECONE_API_KEY;
let pinecone: Pinecone | null = null;
if (pineconeApiKey && pineconeApiKey.trim().length > 0) {
  pinecone = new Pinecone({
    apiKey: pineconeApiKey,
  });
} else {
  console.warn('PINECONE_API_KEY not found or empty in environment variables. RAG will be disabled.');
}

// gemini for creating text embeddings
// Only initialize if API key is present and non-empty
const apiKey = process.env.GEMINI_API_KEY_REPORT;

let gemini: GoogleGenAI | null = null;

if (apiKey && apiKey.trim().length > 0) {
  gemini = new GoogleGenAI({
    apiKey,
  });
} else {
  console.warn(
    "GEMINI_API_KEY_REPORT not found. RAG embeddings will be disabled."
  );
}

const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'report-index';
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'gemini-embedding-001';

/**
 * Vector Service - Handles medical knowledge storage and retrieval
 * 
 * Using a vector database lets us find relevant medical info even when
 * patients use different words than what's in our documents (like saying
 * "heart attack" instead of "myocardial infarction"). This is way better
 * than simple keyword matching.
 */

// Get the Pinecone index
async function getIndex() {
  if (!pinecone) {
    throw new Error('Pinecone client not initialized. Check PINECONE_API_KEY.');
  }
  return pinecone.index(INDEX_NAME);
}

/**
 * Convert text to an embedding (vector of numbers)
 * 
 * Embeddings let us compare text by meaning, not just words. Similar concepts
 * end up with similar numbers, so "headache" and "migraine" will be close
 * together in the vector space.
 * 
 * @param text - Text to convert
 * @returns Array of numbers representing the text
 */
export async function createEmbedding(text: string): Promise<number[]> {
  try {
    if (!gemini) {
      throw new Error('gemini client not initialized. Check gemini_API_KEY.');
    }

    const response = await gemini.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
      config: {
        outputDimensionality: 512,
      },
    });

    return response.embeddings![0].values!;
  } catch (error) {
    console.error('Error creating embedding:', error);
    throw error;
  }
}

/**
 * Store medical documents in the vector database
 * 
 * Call this before any user consultations to build up your knowledge base.
 * Each document gets converted to an embedding and stored with its metadata.
 * 
 * @param documents - Array of medical documents to store
 */
export async function addMedicalDocuments(documents: Array<{
  text: string;
  metadata: {
    source: string;
    category: string;
  };
}>): Promise<void> {
  try {
    const index = await getIndex();

    // Process documents in batches
    for (const doc of documents) {
      // Create embedding for the document text
      const embedding = await createEmbedding(doc.text);

      // Generate unique ID for the document
      const docId = `${doc.metadata.source}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Store in Pinecone with embedding and metadata
      await index.upsert({
        records: [{
          id: docId,
          values: embedding,
          metadata: {
            text: doc.text,
            source: doc.metadata.source,
            category: doc.metadata.category,
          },
        }]
      });
    }

    console.log(`Successfully added ${documents.length} documents to vector database`);
  } catch (error) {
    console.error('Error adding medical documents:', error);
    throw error;
  }
}

/**
 * Search for similar medical documents
 * 
 * Takes a query (like symptoms), converts it to an embedding, and finds
 * the most similar documents in the database. This is how we get relevant
 * medical context to send to the LLM.
 * 
 * @param query - What to search for
 * @param topK - How many results to return
 * @returns Relevant documents with similarity scores
 */
export async function searchSimilarDocuments(
  query: string,
  topK: number = 5
): Promise<Array<{
  text: string;
  score: number;
  metadata: {
    source: string;
    category: string;
  };
}>> {
  try {
    const index = await getIndex();

    // Create embedding for the search query
    const queryEmbedding = await createEmbedding(query);

    // Search for similar vectors in Pinecone
    const results = await index.query({
      vector: queryEmbedding,
      topK: topK,
      includeMetadata: true,
    });
    

    console.log(
  "🔥 QUERY VECTOR SIZE:",
  queryEmbedding.length
);

console.log(
  "🔥 MATCH COUNT:",
  results.matches?.length
);

console.log(
  "🔥 MATCHES:",
  results.matches
);

    // Format results
    const documents = results.matches?.map((match) => ({
      text: match.metadata?.text as string || '',
      score: match.score || 0,
      metadata: {
        source: match.metadata?.source as string || '',
        category: match.metadata?.category as string || '',
      },
    })) || [];

    return documents;
  } catch (error) {
    console.error('Error searching similar documents:', error);
    throw error;
  }
}

// Check if the vector database is ready to use
export async function isVectorDbReady(): Promise<boolean> {
  try {
    console.log("🔥 CHECKING PINECONE");

    if (!pinecone) {
      console.log("❌ NO PINECONE CLIENT");
      return false;
    }

    console.log("🔥 INDEX NAME:", INDEX_NAME);

    const index = await getIndex();

    const stats = await index.describeIndexStats();

    console.log("🔥 PINECONE STATS:", stats);

    return true;

  } catch (error) {

    console.error(
      "❌ PINECONE ERROR FULL:",
      error
    );

    return false;
  }
}
