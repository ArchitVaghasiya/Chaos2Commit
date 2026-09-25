import { NextResponse } from 'next/server';
import { buildTwimlResponse } from '@/lib/telephony/twilio';

export async function GET(request: Request) {
  return handleTwiml(request);
}

export async function POST(request: Request) {
  return handleTwiml(request);
}

async function handleTwiml(request: Request) {
  const url = new URL(request.url);
  const name = url.searchParams.get('name') || 'there';
  const company = url.searchParams.get('company') || 'your company';
  const language = url.searchParams.get('lang') || 'English';

  let greeting = `Hello ${name}! This is Ava calling from CloudScale Solutions regarding your cloud and Microsoft 365 requirements at ${company}. How can we assist you today?`;

  const langLower = language.toLowerCase();
  if (langLower.includes('gujarati') || langLower.includes('ગુજરાતી') || langLower === 'gu') {
    greeting = `નમસ્તે ${name}! હું CloudScale Solutions માંથી Ava બોલું છું. તમારી કંપની ${company} માટે Cloud Migration અને Microsoft 365 સોલ્યુશન્સ વિશે વાત કરવા કૉલ કર્યો છે.`;
  } else if (langLower.includes('hindi') || langLower.includes('हिन्दी') || langLower === 'hi') {
    greeting = `नमस्ते ${name}! मैं CloudScale Solutions से Ava बोल रही हूँ। आपकी कंपनी ${company} के Cloud और Microsoft 365 प्रोजेक्ट के संबंध में बात करना चाहती हूँ।`;
  } else if (langLower.includes('spanish') || langLower.includes('español')) {
    greeting = `¡Hola ${name}! Le saluda Ava de TechNova Solutions respecto a su requerimiento de nube en ${company}. ¿Cómo podemos ayudarle hoy?`;
  } else if (langLower.includes('german') || langLower.includes('deutsch')) {
    greeting = `Guten Tag ${name}! Hier ist Ava von TechNova Solutions bezüglich Ihrer Cloud-Anforderungen bei ${company}. Wie können wir Ihnen heute weiterhelfen?`;
  } else if (langLower.includes('french') || langLower.includes('français')) {
    greeting = `Bonjour ${name} ! C'est Ava de TechNova Solutions concernant votre projet cloud chez ${company}. Comment pouvons-nous vous aider aujourd'hui ?`;
  } else if (langLower.includes('arabic') || langLower.includes('العربية')) {
    greeting = `مرحباً ${name}! معك آفا من تكنوفا للحلول بخصوص متطلبات السحابة لشركتكم ${company}. كيف يمكننا مساعدتكم اليوم؟`;
  }

  const leadId = url.searchParams.get('leadId') || '';
  const publicBase = process.env.PUBLIC_WEBHOOK_URL || url.origin;
  const gatherUrl = `${publicBase}/api/voice/twilio/gather?leadId=${encodeURIComponent(
    leadId
  )}&name=${encodeURIComponent(name)}&company=${encodeURIComponent(company)}&lang=${encodeURIComponent(
    language
  )}`;

  const twimlXml = buildTwimlResponse({
    speechText: greeting,
    language,
    gatherUrl,
  });

  return new NextResponse(twimlXml, {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}
