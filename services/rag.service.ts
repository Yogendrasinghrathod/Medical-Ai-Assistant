import { createEmbedding, searchSimilarDocuments, isVectorDbReady } from './vector.service';

/**
 * RAG Service - Adds medical context to report generation
 * 
 * RAG (Retrieval-Augmented Generation) helps the LLM give better answers
 * by pulling in relevant medical info from our knowledge base. This means
 * more accurate reports and less made-up stuff.
 */

/**
 * Search the medical knowledge base
 * 
 * Takes a query and finds the most relevant medical documents using vector search.
 * This works even when patients use everyday language instead of medical terms.
 * 
 * @param query - What to search for (symptoms, conditions, etc.)
 * @param topK - How many results to return
 * @returns Relevant medical information
 */
export async function searchMedicalKnowledge(
  query: string,
  topK: number = 3
): Promise<string> {
  try {
    // Check if vector database is ready
    const isReady = await isVectorDbReady();
    if (!isReady) {
      console.warn('Vector database not ready, skipping RAG retrieval');
      return '';
    }

    // Search for similar medical documents
    const results = await searchSimilarDocuments(query, topK);

    // Combine retrieved documents into context
    const medicalContext = results
      .map((doc, index) => `[Source ${index + 1}: ${doc.metadata.source}]\n${doc.text}`)
      .join('\n\n');

    return medicalContext;
  } catch (error) {
    console.error('Error searching medical knowledge:', error);
    // Return empty string on error - will trigger fallback in report generation
    return '';
  }
}

/**
 * Pull out the medical stuff from a conversation
 * 
 * Conversations have a lot of filler (hi, how are you, etc.). This function
 * extracts just the medical parts so we can search for relevant info.
 * 
 * @param transcript - The full conversation
 * @returns Medical context extracted from the conversation
 */
export function extractMedicalContext(transcript: string): string {
  try {
    // Simple extraction: look for common medical keywords
    const medicalKeywords = [
      'pain', 'ache', 'hurt', 'symptom', 'fever', 'cough', 'headache',
      'nausea', 'vomiting', 'dizziness', 'fatigue', 'weakness', 'chest',
      'breath', 'stomach', 'throat', 'back', 'joint', 'muscle', 'skin',
      'rash', 'swelling', 'bleeding', 'infection', 'disease', 'condition',
      'medication', 'medicine', 'drug', 'prescription', 'treatment',
      'diagnosis', 'doctor', 'hospital', 'emergency', 'chronic', 'acute'
    ];

    // Split transcript into sentences
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // Filter sentences containing medical keywords
    const medicalSentences = sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return medicalKeywords.some(keyword => lowerSentence.includes(keyword));
    });

    // If no medical sentences found, return first few sentences as fallback
    if (medicalSentences.length === 0) {
      return sentences.slice(0, 3).join('. ');
    }

    // Return extracted medical context
    return medicalSentences.join('. ');
  } catch (error) {
    console.error('Error extracting medical context:', error);
    // Return original transcript as fallback
    return transcript;
  }
}

/**
 * Get relevant medical context for a conversation
 * 
 * This is the main RAG function. It extracts medical info from the
 * conversation, searches our knowledge base, and returns relevant context
 * to help generate better reports.
 * 
 * @param transcript - The patient conversation
 * @returns Medical context (empty string if something goes wrong)
 */
export async function getMedicalContext(transcript: string): Promise<string> {
  try {
    // Extract medical context from transcript
    const medicalQuery = extractMedicalContext(transcript);

    // Search vector database for relevant medical knowledge
    const retrievedContext = await searchMedicalKnowledge(medicalQuery, 3);

    return retrievedContext;
  } catch (error) {
    console.error('Error getting medical context:', error);
    // Return empty string on error - triggers fallback in report generation
    return '';
  }
}

// Create an embedding for text (wrapper for vector service)
// Use this if you need embeddings outside the vector service
export async function createTextEmbedding(text: string): Promise<number[]> {
  return createEmbedding(text);
}
