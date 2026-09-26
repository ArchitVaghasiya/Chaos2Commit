import { NextResponse } from 'next/server';

function splitIntoTtsChunks(str: string, maxLen = 120): string[] {
  // Strip markdown formatting characters
  const clean = str.replace(/[*_#`~]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return [];

  // Match sentences split by Hindi purna viram (।), period, exclamation, question mark, newline, or semicolon
  const sentences = clean.match(/[^।!?.!\n;]+[।!?.!\n;]*/g) || [clean];
  const chunks: string[] = [];

  for (const sentence of sentences) {
    const s = sentence.trim();
    if (!s) continue;

    if (s.length <= maxLen) {
      chunks.push(s);
    } else {
      // Split on word boundaries so we never truncate in the middle of a word or Unicode glyph
      const words = s.split(' ');
      let currentChunk = '';
      for (const word of words) {
        if ((currentChunk + ' ' + word).trim().length <= maxLen) {
          currentChunk = (currentChunk + ' ' + word).trim();
        } else {
          if (currentChunk) chunks.push(currentChunk);
          currentChunk = word;
        }
      }
      if (currentChunk) chunks.push(currentChunk);
    }
  }

  return chunks.length > 0 ? chunks : [clean.slice(0, maxLen)];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text') || '';
  const lang = searchParams.get('lang') || 'en';

  if (!text) {
    return new NextResponse('Missing text parameter', { status: 400 });
  }

  // Resolve language code for Google Translate TTS
  let tl = 'en';
  const l = lang.toLowerCase();
  if (l.includes('gujarati') || l.includes('ગુજરાતી') || l === 'gu' || l === 'gu-in') {
    tl = 'gu';
  } else if (l.includes('hindi') || l.includes('हिन्दी') || l === 'hi' || l === 'hi-in') {
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

  const chunks = splitIntoTtsChunks(text, 120);

  if (chunks.length === 0) {
    return new NextResponse('No valid text to speak', { status: 400 });
  }

  try {
    // Fetch all audio chunks in parallel for lowest latency
    const audioBuffers = await Promise.all(
      chunks.map(async (chunk) => {
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tl}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
        const res = await fetch(ttsUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            Referer: 'https://translate.google.com/',
          },
        });

        if (!res.ok) {
          console.warn(`TTS chunk fetch failed for "${chunk.slice(0, 30)}...": status ${res.status}`);
          return Buffer.alloc(0);
        }

        const arrayBuf = await res.arrayBuffer();
        return Buffer.from(arrayBuf);
      })
    );

    const validBuffers = audioBuffers.filter((buf) => buf.length > 0);

    if (validBuffers.length === 0) {
      return new NextResponse('Failed to retrieve audio from TTS provider', { status: 502 });
    }

    const combinedAudio = Buffer.concat(validBuffers);

    return new NextResponse(combinedAudio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': combinedAudio.length.toString(),
        'Cache-Control': 'public, max-age=3600',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error: any) {
    console.error('Error fetching TTS audio:', error);
    return new NextResponse('Failed to generate TTS audio', { status: 500 });
  }
}

