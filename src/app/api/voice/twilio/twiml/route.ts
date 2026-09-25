import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  return handleTwiml(request);
}

export async function POST(request: Request) {
  return handleTwiml(request);
}

async function handleTwiml(request: Request) {
  const url = new URL(request.url);
  const leadId = url.searchParams.get('leadId') || '';
  const name = url.searchParams.get('name') || 'there';
  const company = url.searchParams.get('company') || 'your company';
  const publicBase = process.env.PUBLIC_WEBHOOK_URL || url.origin;

  // Retrieve current organization settings for company name & solutions
  let orgName = 'CloudScale Solutions';
  try {
    const org = await prisma.organizationSetting.findFirst();
    if (org?.companyName) {
      orgName = org.companyName;
    }
  } catch (_) {}

  // Interactive Language Selection Prompt:
  // Allows user to press 1/2/3 or speak "Gujarati" / "Hindi" / "English" directly on their physical phone.
  const welcomeText = `Welcome to ${orgName}! For Gujarati, press 1 or say Gujarati. हिन्दी के लिए 2 दबाएँ या हिन्दी बोलें। For English, press 3 or speak English.`;

  const gatherActionUrl = `${publicBase}/api/voice/twilio/gather?step=language&leadId=${encodeURIComponent(
    leadId
  )}&name=${encodeURIComponent(name)}&company=${encodeURIComponent(company)}`;

  const fallbackRedirectUrl = `${publicBase}/api/voice/twilio/gather?step=language&leadId=${encodeURIComponent(
    leadId
  )}&name=${encodeURIComponent(name)}&company=${encodeURIComponent(company)}&defaultLang=Gujarati`;

  const twimlXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech dtmf" numDigits="1" action="${gatherActionUrl}" method="POST" speechTimeout="auto" timeout="6">
    <Say voice="Polly.Aditi" language="hi-IN">${escapeXml(welcomeText)}</Say>
  </Gather>
  <Redirect method="POST">${fallbackRedirectUrl}</Redirect>
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
