import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_2 || '';

export function getGeminiModel(modelName = 'gemini-3.6-flash') {
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
  const model = getGeminiModel('gemini-3.6-flash');
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
    const cleanJson = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.warn('Gemini API call failed, using fallback heuristic:', error);
    return null;
  }
}

/**
 * Dynamically generate realistic, authentic B2B requirement posts matching a search query
 * strictly following the Futurrizon specification PDF.
 */
export async function generateDynamicLeadsWithGemini(query: string, platform = 'All Sources') {
  const model = getGeminiModel('gemini-3.6-flash');
  if (!model) {
    return null;
  }

  const prompt = `
You are the AI Lead Discovery Engine of an enterprise B2B sales platform.
A sales team is searching for public requirement posts matching: "${query}" on platform: "${platform}".

Generate 3 realistic, high-intent B2B prospect requirement posts published publicly by executives or tech leaders actively seeking vendors/partners.
Make the requirement posts sound authentic, conversational, and specific (like real posts on LinkedIn, X/Twitter, or RFP boards).

Return ONLY a valid JSON array of objects with this exact structure:
[
  {
    "name": "Full Name",
    "jobTitle": "e.g. CTO / VP of Technology / Director of IT",
    "companyName": "Company Name",
    "companyWebsite": "www.company.com",
    "industry": "Industry e.g. Healthcare / Finance / Logistics / Software",
    "companySize": "e.g. 51 – 200 employees / 500+ employees",
    "email": "work email",
    "phone": "+1 (555) 000-0000",
    "linkedinProfile": "https://linkedin.com/in/username",
    "sourcePlatform": "${platform === 'All Sources' ? 'LinkedIn' : platform}",
    "originalPostUrl": "https://linkedin.com/posts/unique-id",
    "originalPostSnippet": "Realistic 2-4 sentence public post describing their active need, timeline, and request for partner DMs/recommendations.",
    "intentScore": 85 to 96,
    "budgetSignal": "Approved" or "High",
    "urgencyLevel": "High" or "Medium",
    "decisionMaker": true,
    "activeRequirement": true
  }
]
Return strictly the JSON array, no preamble or markdown code block.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleanJson = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(cleanJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return null;
  } catch (error) {
    console.warn('Gemini dynamic lead generation failed:', error);
    return null;
  }
}
