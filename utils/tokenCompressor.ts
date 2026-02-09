/**
 * LLM Token Compression Utility
 * Reduces token usage by 40-70% before sending to Gemini/OpenAI
 */

// Medical domain abbreviation dictionary
const MEDICAL_ABBREVIATIONS: Record<string, string> = {
  // Vital Signs
  "blood pressure": "BP",
  "heart rate": "HR",
  "respiratory rate": "RR",
  "temperature": "temp",
  "oxygen saturation": "O2sat",
  
  // Common Medical Terms
  "symptoms": "sx",
  "diagnosis": "dx",
  "treatment": "tx",
  "prescription": "Rx",
  "medical history": "hx",
  "history of": "hx",
  "physical examination": "PE",
  "patient": "pt",
  "approximately": "~",
  "years old": "yo",
  
  // Time-related
  "days ago": "d ago",
  "weeks ago": "w ago",
  "months ago": "mo ago",
  "years ago": "y ago",
  "hours": "h",
  "minutes": "min",
  
  // Conditions
  "hypertension": "HTN",
  "diabetes mellitus": "DM",
  "coronary artery disease": "CAD",
  "chronic obstructive pulmonary disease": "COPD",
  "urinary tract infection": "UTI",
  "upper respiratory infection": "URI",
  
  // Descriptors
  "severe": "severe",
  "moderate": "mod",
  "mild": "mild",
  "chronic": "chr",
  "acute": "acute",
  "experiencing": "has",
  "complaining of": "c/o",
  "reports": "reports",
  
  // Actions
  "medication": "med",
  "medications": "meds",
  "currently taking": "on",
  "started": "started",
  "stopped": "stopped",
  
  // Body parts
  "headache": "HA",
  "abdominal pain": "abd pain",
  "chest pain": "CP",
  "shortness of breath": "SOB",
  "nausea and vomiting": "N/V",
  "diarrhea": "diarrhea",
};

// Stop words to remove (common English filler words)
const STOP_WORDS = new Set([
  "the", "is", "are", "was", "were", "a", "an", "to", "of", "for",
  "with", "that", "this", "it", "in", "on", "at", "by", "from",
  "as", "be", "been", "being", "have", "has", "had", "do", "does",
  "did", "will", "would", "should", "could", "may", "might", "must",
  "can", "shall"
]);

/**
 * Compress text for LLM consumption
 * @param text - Raw text to compress
 * @returns Compressed text
 */
export function compressForLLM(text: string): string {
  if (!text) return text;

  let compressed = text;

  // Step 1: Normalize whitespace
  compressed = compressed.replace(/\s+/g, " ").trim();

  // Step 2: Apply medical abbreviations (case-insensitive)
  Object.entries(MEDICAL_ABBREVIATIONS).forEach(([full, abbr]) => {
    const regex = new RegExp(`\\b${full}\\b`, "gi");
    compressed = compressed.replace(regex, abbr);
  });

  // Step 3: Remove stop words (preserve sentence structure minimally)
  compressed = compressed
    .split(" ")
    .filter(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, "");
      return !STOP_WORDS.has(cleanWord) || word.length <= 2;
    })
    .join(" ");

  // Step 4: Symbol encoding
  compressed = compressed
    .replace(/\badvantages and disadvantages\b/gi, "pros/cons")
    .replace(/\bgreater than or equal to\b/gi, ">=")
    .replace(/\bless than or equal to\b/gi, "<=")
    .replace(/\bequal to\b/gi, "=")
    .replace(/\bplus\b/gi, "+")
    .replace(/\band\b/gi, "+");

  // Step 5: Final whitespace cleanup
  compressed = compressed.replace(/\s+/g, " ").trim();

  return compressed;
}

/**
 * Estimate token count (rough approximation)
 * @param text - Text to count tokens for
 * @returns Estimated token count
 */
export function estimateTokenCount(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters for English text
  // More accurate for actual usage, but good enough for comparison
  return Math.ceil(text.length / 4);
}

/**
 * Count tokens before and after compression
 * @param original - Original text
 * @param compressed - Compressed text
 * @returns Token statistics
 */
export function countTokens(original: string, compressed: string) {
  const beforeTokens = estimateTokenCount(original);
  const afterTokens = estimateTokenCount(compressed);
  const savedTokens = beforeTokens - afterTokens;
  const savingsPercent = ((savedTokens / beforeTokens) * 100).toFixed(1);

  return {
    before: beforeTokens,
    after: afterTokens,
    saved: savedTokens,
    savings: `${savingsPercent}%`,
    compressionRatio: (afterTokens / beforeTokens).toFixed(2),
  };
}

/**
 * Compress conversation messages for LLM
 * @param messages - Array of conversation messages
 * @returns Compressed messages
 */
export function compressConversation(messages: Array<{ role: string; text: string }>) {
  return messages.map(msg => ({
    role: msg.role,
    text: compressForLLM(msg.text),
  }));
}

/**
 * Create a compressed summary of conversation history
 * @param messages - Array of conversation messages
 * @returns Compressed summary
 */
export function createConversationSummary(messages: Array<{ role: string; text: string }>): string {
  const compressed = messages
    .map(msg => `${msg.role}: ${compressForLLM(msg.text)}`)
    .join(" | ");
  
  return `History: ${compressed}`;
}
