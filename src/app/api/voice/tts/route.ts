import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text') || '';
  const lang = searchParams.get('lang') || 'en';

  if (!text) {
    return new NextResponse('Missing text parameter', { status: 400 });
  }

  // Resolve language code
  let tl = 'en';
  const l = lang.toLowerCase();
  if (l.includes('hindi') || l.includes('हिन्दी') || l === 'hi' || l === 'hi-in') {
    tl = 'hi';
  } else if (l.includes('spanish') || l.includes('español') || l === 'es' || l === 'es-es') {
    tl = 'es';
  } else if (l.includes('french') || l.includes('français') || l === 'fr' || l === 'fr-fr') {
    tl = 'fr';
  } else if (l.includes('german') || l.includes('deutsch') || l === 'de' || l === 'de-de') {
    tl = 'de';
  } else if (l.includes('arabic') || l.includes('العربية') || l === 'ar' || l === 'ar-sa') {
    tl = 'ar';
  }

  // Clean text and split if needed (Google TTS supports up to ~250 chars per request)
  const cleanText = text
    .replace(/[*_#`~]/g, '')
    .trim()
    .slice(0, 250);

  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tl}&client=tw-ob&q=${encodeURIComponent(cleanText)}`;

  try {
    const res = await fetch(ttsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      return new NextResponse('TTS service responded with error', { status: res.status });
    }

    const audioBuffer = await res.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('Error fetching TTS audio:', error);
    return new NextResponse('Failed to generate TTS audio', { status: 500 });
  }
}
