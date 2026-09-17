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
  leadContext: { name: string; company: string; requirement: string }
) {
  const groq = getGroqClient();
  if (!groq) {
    return null; // Fallback to simulated voice turn
  }

  const systemPrompt = `You are Ava, a senior consultative sales executive at TechNova Solutions.
You are on a live phone call with ${leadContext.name} from ${leadContext.company}.
Their public requirement was: "${leadContext.requirement}".

Your goal:
1. Speak concisely in 1-2 natural, spoken sentences (never use bullet points, markdown, or long paragraphs).
2. Validate their requirement, timeline, and team size.
3. Overcome any hesitation with warmth and authority.
4. When they express interest or ask to connect, propose a meeting for "Thursday at 3 PM with our solutions lead".
5. Sound natural, friendly, professional, and consultative.`;

  const modelsToTry = ['groq/compound-mini', 'openai/gpt-oss-20b'];

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
