import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_2 || '';

export function getGeminiModel(modelName = 'gemini-1.5-flash') {
  if (!apiKey) {
    return null;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Classify public requirement posts and calculate Predictive Intent Score (0-100)
 */
export async function analyzeLeadIntentWithGemini(postSnippet: string, companyProfile: string) {
  const model = getGeminiModel();
  if (!model) {
    return null; // Fall back to heuristic engine
  }

  const prompt = `
You are an expert enterprise B2B sales qualification intelligence agent.
Analyze the following public requirement post against our company profile.

Our Company Profile & Offerings:
"${companyProfile}"

Public Requirement Post:
"${postSnippet}"

Extract and calculate the following in valid JSON format:
{
  "intentScore": number (0 to 100 based on buyer intent urgency, budget signal, decision maker authority, and product fit),
  "budgetSignal": string ("High" | "Enterprise" | "Medium" | "Low"),
  "urgencyLevel": string ("High" | "Medium" | "Low"),
  "decisionMaker": boolean,
  "activeRequirement": boolean,
  "summaryReasoning": string,
  "recommendedPitchAngle": string
}
Only output valid JSON.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    // Strip markdown code fences if present
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    return JSON.parse(cleanJson);
  } catch (error) {
    console.warn('Gemini API call failed, using fallback heuristic:', error);
    return null;
  }
}
