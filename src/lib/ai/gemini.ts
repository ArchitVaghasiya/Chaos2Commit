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
You are the AI Lead Discovery Engine of an enterprise B2B sales automation platform.
A sales team is searching for public requirement posts matching: "${query}" on platform: "${platform}".

Generate 3 realistic, high-intent B2B prospect requirement posts published publicly by real enterprise buyers (executives, CTOs, VP Engineering, Directors of Procurement) actively seeking solution partners/vendors.
Important: Prospect company names MUST be external enterprises (e.g. Apex Health Systems, Vanguard Logistics, Lumina Financial, Horizon Retail) and NEVER "TechNova Solutions" (which is the selling company).

Return ONLY a valid JSON array of objects with this exact structure:
[
  {
    "name": "Full Name",
    "jobTitle": "e.g. CTO / VP of Technology / Director of IT / Head of Procurement",
    "companyName": "External Enterprise Name",
    "companyWebsite": "www.companydomain.com",
    "industry": "Industry e.g. Healthcare / Finance / Logistics / Software / Retail",
    "companySize": "e.g. 51 – 200 employees / 500+ employees",
    "email": "work email matching their name and domain",
    "phone": "+1 (555) 000-0000",
    "linkedinProfile": "https://linkedin.com/in/prospect-slug",
    "sourcePlatform": "${platform === 'All Sources' ? 'LinkedIn' : platform}",
    "originalPostUrl": "https://linkedin.com/posts/active-requirement-post",
    "originalPostSnippet": "Realistic 2-4 sentence public post describing their active need, timeline, and request for partner DMs/recommendations.",
    "intentScore": 88 to 96,
    "budgetSignal": "Approved" or "High",
    "urgencyLevel": "High" or "Medium",
    "decisionMaker": true,
    "activeRequirement": true,
    "matchReasoning": "1-2 sentences explaining specifically why this post matched the query '${query}', citing the buyer need and authority.",
    "fitScore": 92 to 98,
    "keyMatches": ["Primary Need", "Secondary Requirement", "Timeline/Tech"],
    "recommendedPitch": "Actionable 1-sentence sales pitch angle tailored for the AI voice agent on the initial call.",
    "scoreBreakdown": {
      "authority": 24 to 25,
      "budget": 23 to 25,
      "urgency": 22 to 25,
      "fit": 23 to 25
    }
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

/**
 * Dynamic conversational AI voice turn with Gemini (sub-second multilingual generation)
 * Serves as reliable fallback when Groq is unavailable or rate-limited.
 */
export async function generateVoiceTurnWithGemini(
  messages: Array<{ role: string; content: string }>,
  leadContext: {
    name: string;
    company: string;
    requirement: string;
    orgCompanyName?: string;
    solutionsContext?: string;
    aiPersonaName?: string;
  },
  language = 'English'
): Promise<string | null> {
  const model = getGeminiModel('gemini-2.5-flash');
  if (!model) return null;

  const orgName = leadContext.orgCompanyName || 'Techsolution';
  const persona = leadContext.aiPersonaName || 'Ava, an expert enterprise B2B solutions specialist';
  const solutions = leadContext.solutionsContext || 'Microsoft 365 Enterprise Migration, SharePoint Online Document Management, Zero-Downtime Cloud Cutover, Power Platform Automation';

  const systemPrompt = `You are ${persona} at ${orgName}.
You are on a live phone call with ${leadContext.name} from ${leadContext.company}.
Their active requirement is: "${leadContext.requirement}".
Our verified enterprise solutions and offerings: "${solutions}".

CRITICAL MULTILINGUAL INSTRUCTION:
The prospect is speaking in "${language}". You MUST respond strictly and fluently in spoken, natural, professional ${language} (using native script, e.g. Devanagari script for Hindi, Gujarati script for Gujarati, etc.). Never switch to English unless English was requested.

Spoken Guidelines:
1. Speak concisely in 1 to 2 natural, spoken sentences (never use bullet points, markdown asterisks, or long text).
2. Directly answer their question or acknowledge what they said using our verified solutions, and qualify either their timeline or user/team headcount.
3. If they confirm interest, ask for next steps, or request a call, propose meeting on "Thursday at 3 PM with our solutions lead" in ${language}.
4. Tone: warm, authoritative, respectful, and consultative.`;

  try {
    const historyText = messages
      .slice(-6)
      .map((m) => `${m.role === 'assistant' ? 'Ava' : 'Prospect'}: ${m.content}`)
      .join('\n');

    const prompt = `${systemPrompt}\n\nRecent Conversation:\n${historyText}\n\nAva's immediate 1-2 sentence spoken reply in ${language}:`;

    const result = await model.generateContent(prompt);
    let reply = result.response.text().trim();
    if (reply) {
      reply = reply.replace(/^Ava:\s*/i, '').replace(/^"|"$/g, '').trim();
      return reply;
    }
    return null;
  } catch (error) {
    console.warn('Gemini voice turn error:', error);
    return null;
  }
}

