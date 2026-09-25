import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDynamicWebhookBase, getPollyVoiceForLanguage } from '@/lib/telephony/twilio';

export async function GET(request: Request) {
  return handleTwiml(request);
}

export async function POST(request: Request) {
  return handleTwiml(request);
}

async function handleTwiml(request: Request) {
  const url = new URL(request.url);
  const leadId = url.searchParams.get('leadId') || '';
  const name = url.searchParams.get('name') || 'Yash';
  const company = url.searchParams.get('company') || 'Gohel Infotech Solutions';
  const lang = url.searchParams.get('lang') || 'Gujarati';
  const publicBase = getDynamicWebhookBase() || process.env.PUBLIC_WEBHOOK_URL || url.origin;

  let orgSetting: any = null;
  try {
    orgSetting = await prisma.organizationSetting.findFirst();
  } catch (_) {}
  
  const firstName = name.trim().split(' ')[0] || 'Yash';
  const prospectCompany = company.replace(/&/g, 'and').replace(/[<>'"]/g, '');
  const callingOrg = 'Techsolution';
  const aiPersonaFullName = orgSetting?.aiPersonaName || 'Ava';
  const aiPersona = aiPersonaFullName.split(' ')[0];

  const languageActionUrl = `${publicBase}/api/voice/twilio/gather?step=language&leadId=${encodeURIComponent(
    leadId
  )}&name=${encodeURIComponent(name)}&company=${encodeURIComponent(prospectCompany)}&lang=${encodeURIComponent(lang)}`;

  const safeActionUrl = languageActionUrl.replace(/&/g, '&amp;');

  const twimlXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="dtmf speech" numDigits="1" action="${safeActionUrl}" method="POST" speechTimeout="auto" timeout="6">
    <Say voice="Polly.Aditi" language="en-IN">Welcome to ${escapeXml(callingOrg)}! For Gujarati, press 1 or say Gujarati.</Say>
    <Say voice="Polly.Aditi" language="hi-IN">हिन्दी के लिए 2 दबाएँ या हिन्दी बोलें।</Say>
    <Say voice="Polly.Aditi" language="en-IN">For English, press 3 or speak English.</Say>
  </Gather>
  <Redirect method="POST">${safeActionUrl}&amp;defaultLang=Gujarati</Redirect>
</Response>`;

  return new NextResponse(twimlXml, {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
