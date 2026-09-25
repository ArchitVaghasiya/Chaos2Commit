import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVoiceTurnWithGroq } from '@/lib/ai/groq';
import { generateVoiceTurnWithGemini } from '@/lib/ai/gemini';
import { buildTwimlResponse, getPollyVoiceForLanguage } from '@/lib/telephony/twilio';

export async function POST(request: Request) {
  return handleGather(request);
}

export async function GET(request: Request) {
  return handleGather(request);
}

async function handleGather(request: Request) {
  try {
    const url = new URL(request.url);
    const leadId = url.searchParams.get('leadId') || '';
    const leadName = url.searchParams.get('name') || 'there';
    const company = url.searchParams.get('company') || 'your company';
    const language = url.searchParams.get('lang') || 'English';

    let speechResult = '';
    let callSid = '';

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      speechResult = (formData.get('SpeechResult') as string) || '';
      callSid = (formData.get('CallSid') as string) || '';
    } else {
      try {
        const json = await request.json();
        speechResult = json.SpeechResult || json.speechResult || '';
        callSid = json.CallSid || json.callSid || '';
      } catch (_) {}
    }

    if (!callSid) {
      callSid = url.searchParams.get('CallSid') || '';
    }

    // Find active CallLog
    let callLog: any = null;
    if (callSid) {
      callLog = await prisma.callLog.findFirst({
        where: { twilioCallSid: callSid },
      });
    } else if (leadId) {
      callLog = await prisma.callLog.findFirst({
        where: { leadId },
        orderBy: { createdAt: 'desc' },
      });
    }

    const { voice, twilioLang } = getPollyVoiceForLanguage(language);
    const gatherActionUrl = `${url.origin}/api/voice/twilio/gather?leadId=${encodeURIComponent(leadId)}&name=${encodeURIComponent(leadName)}&company=${encodeURIComponent(company)}&lang=${encodeURIComponent(language)}`;

    // Case 1: Silence / Timeout (No speech detected on phone)
    if (!speechResult.trim()) {
      let promptSilence = `I'm still here whenever you're ready! Feel free to ask about our Microsoft 365 or SharePoint solutions.`;
      const langLower = language.toLowerCase();
      if (langLower.includes('hindi') || langLower.includes('हिन्दी')) {
        promptSilence = `क्या आप अभी भी लाइन पर हैं? अगर आपके कोई सवाल हैं तो कृपया बताएं।`;
      } else if (langLower.includes('german') || langLower.includes('deutsch')) {
        promptSilence = `Sind Sie noch in der Leitung? Geben Sie mir gerne ein kurzes Feedback zu Ihrem Projekt.`;
      } else if (langLower.includes('spanish') || langLower.includes('español')) {
        promptSilence = `¿Sigue en la línea? Por favor indíqueme si tiene alguna duda sobre sus requerimientos cloud.`;
      } else if (langLower.includes('french') || langLower.includes('français')) {
        promptSilence = `Êtes-vous toujours en ligne ? N'hésitez pas à me faire part de vos questions sur votre projet cloud.`;
      } else if (langLower.includes('arabic') || langLower.includes('العربية')) {
        promptSilence = `هل ما زلتم معنا على الخط؟ يرجى إخبارنا إذا كانت لديكم أي استفسارات.`;
      }

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="${gatherActionUrl}" method="POST" speechTimeout="auto" language="${twilioLang}">
    <Say voice="${voice}" language="${twilioLang}">${escapeXml(promptSilence)}</Say>
  </Gather>
  <Say voice="${voice}" language="${twilioLang}">Thank you for your time. Have a wonderful day!</Say>
  <Hangup/>
</Response>`;

      return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
    }

    // Clean prospect text
    const prospectText = speechResult.trim();
    const prospectLower = prospectText.toLowerCase();

    // Parse existing transcript history
    let existingTranscript: any[] = [];
    if (callLog?.transcriptJson) {
      try {
        existingTranscript = JSON.parse(callLog.transcriptJson);
      } catch (_) {}
    }

    // Add user turn to transcript
    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    existingTranscript.push({
      speaker: 'prospect',
      text: prospectText,
      timestamp: userTimestamp,
    });

    // Check for Negative / DND request
    const isNegative =
      prospectLower.includes('stop calling') ||
      prospectLower.includes('remove me') ||
      prospectLower.includes('do not call') ||
      prospectLower.includes('not interested') ||
      prospectLower.includes('wrong number') ||
      prospectLower.includes('कॉल मत करो') ||
      prospectLower.includes('बंद करो') ||
      prospectLower.includes('kein interesse') ||
      prospectLower.includes('nicht anrufen');

    // Check for Human Handoff
    const isHumanHandoff =
      prospectLower.includes('speak to a human') ||
      prospectLower.includes('talk to a person') ||
      prospectLower.includes('representative') ||
      prospectLower.includes('human agent') ||
      prospectLower.includes('solutions architect');

    // Check for Meeting Booked
    const isMeetingBooked =
      prospectLower.includes('thursday') ||
      prospectLower.includes('schedule a call') ||
      prospectLower.includes('book a demo') ||
      prospectLower.includes('sounds good') ||
      prospectLower.includes('let us meet') ||
      prospectLower.includes('send me an invite');

    let aiReply = '';
    let shouldHangup = false;

    if (isNegative) {
      shouldHangup = true;
      aiReply = `I completely understand, and I sincerely apologize for the interruption. I am adding your number to our internal Do-Not-Call compliance list immediately. Have a pleasant day.`;
      const langLower = language.toLowerCase();
      if (langLower.includes('hindi') || langLower.includes('हिन्दी')) {
        aiReply = `माफ़ कीजियेगा, मैं समझ सकती हूँ। मैंने आपका नंबर हमारी डू-नॉट-कॉल लिस्ट में जोड़ दिया है। आपका दिन शुभ हो।`;
      } else if (langLower.includes('german') || langLower.includes('deutsch')) {
        aiReply = `Verstanden. Ich trage Ihre Nummer unverzüglich in unsere Sperrliste ein. Entschuldigen Sie die Störung.`;
      } else if (langLower.includes('spanish') || langLower.includes('español')) {
        aiReply = `Entendido. He registrado su número en nuestra lista de exclusión. Que tenga un buen día.`;
      }

      if (leadId) {
        try {
          await prisma.lead.update({
            where: { id: leadId },
            data: { dndStatus: true, status: 'NOT_INTERESTED' },
          });
        } catch (_) {}
      }
    } else if (isHumanHandoff) {
      aiReply = `Absolutely! I am bridging our Senior Solutions Architect to this call right now. Please hold for one moment.`;
    } else {
      // Build LLM messages
      const history = existingTranscript.map((t: any) => ({
        role: (t.speaker === 'agent' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: t.text,
      }));

      // Try Groq for sub-150ms speech reply
      const groqResp = await generateVoiceTurnWithGroq(
        history,
        { name: leadName, company, requirement: 'Microsoft 365 & SharePoint Solutions' },
        language
      );

      if (groqResp) {
        aiReply = groqResp;
      } else {
        const geminiResp = await generateVoiceTurnWithGemini(
          history,
          { name: leadName, company, requirement: 'Microsoft 365 & SharePoint Solutions' },
          language
        );
        aiReply = geminiResp || `Thank you for sharing that. Would tomorrow afternoon work for a brief 15-minute technical walkthrough?`;
      }
    }

    // Append AI reply to transcript
    existingTranscript.push({
      speaker: 'agent',
      text: aiReply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    // Update database CallLog
    if (callLog) {
      try {
        await prisma.callLog.update({
          where: { id: callLog.id },
          data: {
            transcriptJson: JSON.stringify(existingTranscript),
            sentiment: isNegative ? 'NEGATIVE' : isMeetingBooked ? 'POSITIVE' : 'NEUTRAL',
            outcome: isMeetingBooked ? 'MEETING_BOOKED' : isNegative ? 'NOT_INTERESTED' : 'INTERESTED',
            callSummary: `Real-time Twilio PSTN call turn logged. Latest prospect statement: "${prospectText.substring(0, 80)}"`,
            nextBestAction: isMeetingBooked ? 'Send calendar invite for scheduled meeting slot.' : isNegative ? 'Compliance DND active.' : 'Continue qualification on team size and target timeline.',
          },
        });
      } catch (dbErr) {
        console.warn('Could not update callLog in gather route:', dbErr);
      }
    }

    // Generate responsive TwiML
    let responseXml = '';
    if (shouldHangup) {
      responseXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}" language="${twilioLang}">${escapeXml(aiReply)}</Say>
  <Hangup/>
</Response>`;
    } else {
      responseXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="${gatherActionUrl}" method="POST" speechTimeout="auto" language="${twilioLang}">
    <Say voice="${voice}" language="${twilioLang}">${escapeXml(aiReply)}</Say>
  </Gather>
  <Say voice="${voice}" language="${twilioLang}">Thank you for speaking with TechNova Solutions. We will follow up with full details shortly. Goodbye!</Say>
  <Hangup/>
</Response>`;
    }

    return new NextResponse(responseXml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error: any) {
    console.error('Twilio gather error:', error);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="en-US">Thank you for your time. Have a great day.</Say>
  <Hangup/>
</Response>`;
    return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
  }
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
