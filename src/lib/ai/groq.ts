import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_API_KEY_2 || '';

export function getGroqClient() {
  if (!apiKey) {
    return null;
  }
  return new Groq({ apiKey });
}

export interface VoiceTurnMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Ultra-fast conversational AI turn for live voice calls (<150ms)
 */
export async function generateVoiceTurnWithGroq(
  messages: VoiceTurnMessage[],
  leadContext: {
    name: string;
    company: string;
    requirement: string;
    orgCompanyName?: string;
    solutionsContext?: string;
    aiPersonaName?: string;
  },
  language = 'English'
) {
  const groq = getGroqClient();
  if (!groq) {
    return null; // Fallback to simulated voice turn
  }

  const orgName = leadContext.orgCompanyName || 'Techsolution';
  const persona = leadContext.aiPersonaName || 'Ava, senior consultative solutions lead';
  const solutions = leadContext.solutionsContext || 'Microsoft 365 Enterprise Migration, SharePoint Online Document Management, Zero-Downtime Cloud Cutover, Power Platform Automation';

  const systemPrompt = `You are ${persona} at ${orgName}.
You are on a live phone call with ${leadContext.name} from ${leadContext.company}.
Their requirement or business focus is: "${leadContext.requirement}".
Our verified enterprise solutions and offerings: "${solutions}".

CRITICAL MULTILINGUAL REQUIREMENT:
The call language selected is "${language}". You MUST speak and reply strictly in natural, professional, spoken ${language}. If the language is Spanish, reply in Spanish. If Hindi, reply in Hindi. If Gujarati, reply in Gujarati (ગુજરાતી લિપિ). If French, German, or Arabic, reply strictly in that language. Never default to English unless the selected language is English.

Your goal:
1. Speak concisely in 1-2 natural, spoken sentences (never use bullet points, markdown, or long paragraphs).
2. Directly answer their question or validate their requirement, timeline, and team size in ${language} using our verified enterprise solutions.
3. Overcome any hesitation with warmth, precision, and authority.
4. When they express interest or ask to connect, propose a meeting for "Thursday at 3 PM with our solutions lead" (translated naturally into ${language}).
5. Sound natural, friendly, professional, and consultative.`;

  const modelsToTry = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'groq/compound-mini',
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-20b'
  ];

  for (const model of modelsToTry) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.6,
        max_tokens: 150,
      });

      let reply = completion.choices[0]?.message?.content?.trim() || null;
      if (reply) {
        // Strip any accidental AI name prefix like "Ava: " or markdown quotes
        reply = reply.replace(/^Ava:\s*/i, '').replace(/^"|"$/g, '').trim();
        return reply;
      }
    } catch (error) {
      console.warn(`Groq model ${model} turn failed, trying next:`, error);
    }
  }

  return null;
}

/**
 * Dynamic B2B lead generation with Groq LLM as fallback when Gemini is unavailable
 */
export async function generateDynamicLeadsWithGroq(query: string, platform = 'All Sources') {
  const groq = getGroqClient();
  if (!groq) return null;

  const systemPrompt = `You are the AI Lead Discovery Engine of an enterprise B2B sales automation platform.
A sales team is searching for public requirement posts matching: "${query}" on platform: "${platform}".
Generate 2-3 realistic high-intent B2B prospect requirement posts published by real enterprise decision-makers (CTOs, VPs, IT Directors) seeking vendors.
Important: Prospect company names MUST be external enterprises (e.g. Apex Health, Vanguard Logistics, Lumina Financial) and NEVER "TechNova Solutions".
Return strictly a valid JSON array of objects with keys:
"name", "jobTitle", "companyName", "companyWebsite", "industry", "companySize", "email", "phone", "linkedinProfile", "sourcePlatform", "originalPostUrl", "originalPostSnippet", "intentScore" (85-96), "budgetSignal" ("Approved"|"High"), "urgencyLevel" ("High"|"Medium"), "decisionMaker" (true), "activeRequirement" (true), "matchReasoning" (string), "fitScore" (number 90-98), "keyMatches" (array of strings), "recommendedPitch" (string), "scoreBreakdown" ({"authority": 25, "budget": 24, "urgency": 23, "fit": 24}).
Output only the JSON array, no markdown fences or preambles.`;

  const modelsToTry = ['openai/gpt-oss-20b', 'groq/compound-mini'];
  for (const model of modelsToTry) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: `Generate leads for: ${query}` }],
        temperature: 0.4,
        max_tokens: 1500,
      });

      const text = completion.choices[0]?.message?.content?.trim();
      if (text) {
        const cleanJson = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn(`Groq lead generation failed on ${model}:`, e);
    }
  }

  return null;
}
