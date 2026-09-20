import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
// Fallback to empty string to prevent build crash, but API calls will fail if missing
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured in the environment variables.' },
        { status: 500 }
      );
    }

    const { text, targetLanguage } = await req.json();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields: text, targetLanguage' },
        { status: 400 }
      );
    }

    // Initialize the gemini-1.5-flash model for fast translation
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Translate the following text into ${targetLanguage}. Return ONLY the translated text, with no markdown, quotes, explanations, or conversational filler. Maintain the exact formatting and tone of the original text:\n\n"${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let translatedText = response.text().trim();

    // Strip leading/trailing quotes if the model accidentally included them
    if (translatedText.startsWith('"') && translatedText.endsWith('"')) {
      translatedText = translatedText.slice(1, -1);
    }

    return NextResponse.json({ translatedText });
  } catch (error: any) {
    console.error('Translation API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to translate text' },
      { status: 500 }
    );
  }
}
