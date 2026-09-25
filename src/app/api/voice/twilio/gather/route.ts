import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVoiceTurnWithGroq } from '@/lib/ai/groq';
import { generateVoiceTurnWithGemini } from '@/lib/ai/gemini';
import { getPollyVoiceForLanguage, sendOutboundSms, getDynamicWebhookBase } from '@/lib/telephony/twilio';
import {
  extractMeetingDateTime,
  scheduleMeetingOnGoogleCalendar,
  GOOGLE_CALENDAR_OWNER_EMAIL,
} from '@/lib/calendar/google-calendar';

export async function POST(request: Request) {
  return handleGather(request);
}

export async function GET(request: Request) {
  return handleGather(request);
}

async function handleGather(request: Request) {
  try {
    const url = new URL(request.url);
    const step = url.searchParams.get('step') || 'dialogue';
    const leadId = url.searchParams.get('leadId') || '';
    const leadName = url.searchParams.get('name') || 'there';
    const company = url.searchParams.get('company') || 'your company';
    let language = url.searchParams.get('lang') || 'Gujarati';

    let speechResult = '';
    let digits = '';
    let callSid = '';

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      speechResult = (formData.get('SpeechResult') as string) || '';
      digits = (formData.get('Digits') as string) || '';
      callSid = (formData.get('CallSid') as string) || '';
    } else {
      try {
        const json = await request.json();
        speechResult = json.SpeechResult || json.speechResult || '';
        digits = json.Digits || json.digits || '';
        callSid = json.CallSid || json.callSid || '';
      } catch (_) {}
    }

    if (!callSid) {
      callSid = url.searchParams.get('CallSid') || '';
    }

    // Retrieve active Lead and Organization Settings
    let lead: any = null;
    if (leadId) {
      try {
        lead = await prisma.lead.findUnique({ where: { id: leadId } });
      } catch (_) {}
    }

    let orgSetting: any = null;
    try {
      orgSetting = await prisma.organizationSetting.findFirst();
    } catch (_) {}

    const orgName = 'Techsolution';
    const productsCatalog =
      orgSetting?.productsCatalog ||
      'Microsoft 365 Enterprise Migration, SharePoint Online Document Management, Zero-Downtime Cloud Cutover, Power Platform Automation';
    const aiPersona = orgSetting?.aiPersonaName || 'Ava (Enterprise Solutions Lead)';

    // Find active CallLog
    let callLog: any = null;
    if (callSid) {
      callLog = await prisma.callLog.findFirst({
        where: { twilioCallSid: callSid },
      });
    }
    if (!callLog && leadId) {
      callLog = await prisma.callLog.findFirst({
        where: { leadId },
        orderBy: { createdAt: 'desc' },
      });
    }

    const publicBase = getDynamicWebhookBase() || process.env.PUBLIC_WEBHOOK_URL || url.origin;

    // =========================================================================
    // STEP 1: INTERACTIVE LANGUAGE SELECTION (DTMF 1/2/3 or Speech)
    // =========================================================================
    if (step === 'language') {
      const speechLower = (speechResult || '').toLowerCase();
      const digitsTrimmed = (digits || '').trim();

      let detectedLang = 'Gujarati';
      if (
        digitsTrimmed === '1' ||
        digitsTrimmed.includes('1') ||
        speechLower.includes('gujarat') ||
        speechLower.includes('ગુજરાત') ||
        speechLower.includes('gujarati') ||
        speechLower.includes('ગુજરાતી') ||
        speechLower.includes('ek') ||
        speechLower.includes('એક') ||
        speechLower.includes('one')
      ) {
        detectedLang = 'Gujarati';
      } else if (
        digitsTrimmed === '2' ||
        digitsTrimmed.includes('2') ||
        speechLower.includes('hindi') ||
        speechLower.includes('हिन्दी') ||
        speechLower.includes('हिंदी') ||
        speechLower.includes('दो') ||
        speechLower.includes('do') ||
        speechLower.includes('two')
      ) {
        detectedLang = 'Hindi';
      } else if (
        digitsTrimmed === '3' ||
        digitsTrimmed.includes('3') ||
        speechLower.includes('english') ||
        speechLower.includes('inglis') ||
        speechLower.includes('angrezi') ||
        speechLower.includes('teen') ||
        speechLower.includes('tran') ||
        speechLower.includes('three')
      ) {
        detectedLang = 'English';
      } else if (/[\u0A80-\u0AFF]/.test(speechResult)) {
        detectedLang = 'Gujarati';
      } else if (/[\u0900-\u097F]/.test(speechResult)) {
        detectedLang = 'Hindi';
      } else if (speechLower.includes('hello') || speechLower.includes('hi') || speechLower.includes('yes')) {
        detectedLang = 'English';
      } else {
        detectedLang = url.searchParams.get('defaultLang') || lead?.preferredLanguage || 'Gujarati';
      }

      // Update lead's preferred language in database
      if (lead) {
        try {
          await prisma.lead.update({
            where: { id: lead.id },
            data: { preferredLanguage: detectedLang },
          });
        } catch (_) {}
      }

      // Configure Polly voice & native Twilio speech recognition language
      const { voice, sayLang, gatherLang } = getPollyVoiceForLanguage(detectedLang);
      const firstName = (leadName || lead?.name || 'Yash').trim().split(' ')[0];

      // Formulate opening solutions pitch in the selected language without prospect company name in hello
      let openingPitch = '';
      if (detectedLang === 'Gujarati') {
        openingPitch = `આભાર! આપણે આ કૉલ ગુજરાતીમાં ચાલુ રાખીશું. નમસ્તે ${firstName}! હું ${orgName} તરફથી Ava બોલી રહી છું. હું Microsoft 365, SharePoint Migration અને Cloud Enterprise સોલ્યુશન્સ વિશે વાત કરવા કૉલ કરી રહી છું. આપ આ પ્રોજેક્ટ વિશે શું પ્લાન કરી રહ્યા છો?`;
      } else if (detectedLang === 'Hindi') {
        openingPitch = `धन्यवाद! हम इस कॉल को हिंदी में जारी रखेंगे। नमस्ते ${firstName}! मैं ${orgName} से Ava बोल रही हूँ। मैं Microsoft 365, SharePoint Migration और Cloud Enterprise Solutions के संबंध में बात करने के लिए कॉल कर रही हूँ। आप इस प्रोजेक्ट को लेकर क्या योजना बना रहे हैं?`;
      } else {
        openingPitch = `Thank you! Continuing in English. Hello ${firstName}! I'm Ava from ${orgName}. I'm calling regarding Microsoft 365, SharePoint Migration, and Cloud Enterprise solutions. Could you tell me a bit about your current requirements or timeline?`;
      }

      // Record in CallLog transcript
      if (callLog) {
        try {
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          let transcript: any[] = [];
          if (callLog.transcriptJson) {
            try {
              transcript = JSON.parse(callLog.transcriptJson);
            } catch (_) {}
          }
          transcript.push({
            speaker: 'system',
            text: `Language selected: ${detectedLang} (Keypad/Digits "${digitsTrimmed || 'none'}", Speech "${speechResult || 'none'}")`,
            timestamp,
          });
          transcript.push({
            speaker: 'agent',
            text: openingPitch,
            timestamp,
          });
          await prisma.callLog.update({
            where: { id: callLog.id },
            data: {
              language: detectedLang,
              status: 'CONNECTED',
              transcriptJson: JSON.stringify(transcript),
            },
          });
        } catch (_) {}
      }

      const nextDialogueAction = `${publicBase}/api/voice/twilio/gather?step=dialogue&leadId=${encodeURIComponent(
        leadId
      )}&name=${encodeURIComponent(leadName)}&company=${encodeURIComponent(company)}&lang=${encodeURIComponent(
        detectedLang
      )}`;

      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="${escapeXml(nextDialogueAction)}" method="POST" speechTimeout="auto" timeout="6" language="${gatherLang}">
    <Say voice="${voice}" language="${sayLang}">${escapeXml(openingPitch)}</Say>
  </Gather>
  <Say voice="${voice}" language="${sayLang}">Thank you for speaking with ${orgName}. Have a wonderful day!</Say>
  <Hangup/>
</Response>`;

      return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
    }

    // =========================================================================
    // STEP 2: CONTINUOUS TWO-WAY DUPLEX DIALOGUE IN SELECTED LANGUAGE
    // =========================================================================
    const { voice, sayLang, gatherLang } = getPollyVoiceForLanguage(language);
    const dialogueActionUrl = `${publicBase}/api/voice/twilio/gather?step=dialogue&leadId=${encodeURIComponent(
      leadId
    )}&name=${encodeURIComponent(leadName)}&company=${encodeURIComponent(company)}&lang=${encodeURIComponent(
      language
    )}`;

    // Parse transcript history
    let existingTranscript: any[] = [];
    if (callLog?.transcriptJson) {
      try {
        existingTranscript = JSON.parse(callLog.transcriptJson);
      } catch (_) {}
    }

    // Handle silence / timeout when user didn't speak
    if (!speechResult.trim()) {
      let promptSilence = `I'm still here whenever you're ready! Feel free to ask about our Microsoft 365 or SharePoint solutions.`;
      if (language === 'Gujarati') {
        promptSilence = `હું લાઈન પર જ છું. આપના Microsoft 365 અથવા ક્લાઉડ સોલ્યુશન્સ વિશે કોઈ સવાલ હોય તો આપ જણાવી શકો છો.`;
      } else if (language === 'Hindi') {
        promptSilence = `क्या आप अभी भी लाइन पर हैं? अगर आपके कोई सवाल हैं तो कृपया बताएं।`;
      }

      const silenceXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="${escapeXml(dialogueActionUrl)}" method="POST" speechTimeout="auto" timeout="6" language="${gatherLang}">
    <Say voice="${voice}" language="${sayLang}">${escapeXml(promptSilence)}</Say>
  </Gather>
  <Say voice="${voice}" language="${sayLang}">Thank you for your time. Have a wonderful day!</Say>
  <Hangup/>
</Response>`;

      return new NextResponse(silenceXml, { headers: { 'Content-Type': 'text/xml' } });
    }

    // Prospect Spoke!
    const prospectText = speechResult.trim();
    const prospectLower = prospectText.toLowerCase();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append Prospect turn
    existingTranscript.push({
      speaker: 'prospect',
      text: prospectText,
      timestamp,
    });

    // 1. Negative Call & DND Detection
    const isNegativeDnd =
      prospectLower.includes('stop calling') ||
      prospectLower.includes('remove me') ||
      prospectLower.includes('not interested') ||
      prospectLower.includes('do not call') ||
      prospectLower.includes("don't call") ||
      prospectLower.includes('unsubscribe') ||
      prospectLower.includes('wrong number') ||
      prospectLower.includes('spam') ||
      prospectLower.includes('બંધ કરો') ||
      prospectLower.includes('કૉલ મત કરો') ||
      prospectLower.includes('ફોન ના કરતા') ||
      prospectLower.includes('કાઢી નાખો');

    const targetPhone = lead?.phone || '+919737362307';
    let targetEmail = lead?.email || 'yashgohel241@gmail.com';
    if (
      !targetEmail ||
      targetEmail.includes('gohelinfotech.com') ||
      (leadName && leadName.toLowerCase().includes('yash')) ||
      targetPhone.includes('9737362307')
    ) {
      targetEmail = 'yashgohel241@gmail.com';
    }

    // 2. Human Handoff & Explicit Calendly Link SMS
    const isHumanHandoff =
      prospectLower.includes('human') ||
      prospectLower.includes('real person') ||
      prospectLower.includes('speak to a person') ||
      prospectLower.includes('talk to someone') ||
      prospectLower.includes('send link') ||
      prospectLower.includes('send a link') ||
      prospectLower.includes('booking link') ||
      prospectLower.includes('calendly') ||
      prospectLower.includes('send sms') ||
      prospectLower.includes('ટીમ સાથે વાત') ||
      prospectLower.includes('લિંક મોકલ') ||
      prospectLower.includes('બુકિંગ લિંક') ||
      prospectLower.includes('કેલેન્ડલી') ||
      prospectLower.includes('मैसेज भेजो') ||
      prospectLower.includes('लिंक भेजो') ||
      prospectLower.includes('कैलेंडली');

    // 3. Callback / Busy Detection
    const isCallbackRequested =
      prospectLower.includes('busy right now') ||
      prospectLower.includes('in a meeting') ||
      prospectLower.includes('call me back') ||
      prospectLower.includes('call back later') ||
      prospectLower.includes('call tomorrow') ||
      prospectLower.includes('not a good time') ||
      prospectLower.includes('આવતીકાલે ફોન') ||
      prospectLower.includes('પછી ફોન કરો') ||
      prospectLower.includes('બીઝી છું') ||
      prospectLower.includes('बाद में कॉल करो');

    // 4. Meeting Intent & Date/Time Extraction (Supports ANY day, ANY time, English/Gujarati/Hindi)
    const parsedMeeting = extractMeetingDateTime(prospectText);

    // Check if the previous agent turn already proposed or confirmed a meeting
    const agentTurns = existingTranscript.filter((t: any) => t.speaker === 'agent');
    const lastAgentText = (agentTurns.slice(-1)[0]?.text || '').toLowerCase();
    const wasMeetingPreviouslyMentioned =
      lastAgentText.includes('meeting') ||
      lastAgentText.includes('મીટિંગ') ||
      lastAgentText.includes('મીટીંગ') ||
      lastAgentText.includes('मीटिंग') ||
      lastAgentText.includes('schedule') ||
      lastAgentText.includes('શેડ્યૂલ') ||
      lastAgentText.includes('કન્ફર્મ') ||
      lastAgentText.includes('તય') ||
      lastAgentText.includes('तय');

    const isAffirmative =
      prospectLower.includes('yes') ||
      prospectLower.includes('sure') ||
      prospectLower.includes('sounds good') ||
      prospectLower.includes('perfect') ||
      prospectLower.includes('okay') ||
      prospectLower.includes('ok') ||
      prospectLower.includes('done') ||
      prospectLower.includes('fine') ||
      prospectLower.includes('haan') ||
      prospectLower.includes('ha') ||
      prospectLower.includes('હા') ||
      prospectLower.includes('ચાલશે') ||
      prospectLower.includes('બરાબર') ||
      prospectLower.includes('સરસ') ||
      prospectLower.includes('हाँ') ||
      prospectLower.includes('चलेगा') ||
      prospectLower.includes('ठीक है') ||
      prospectLower.includes('थैंक यू') ||
      prospectLower.includes('thank you');

    const hasDirectMeetingWord =
      prospectLower.includes('meeting') ||
      prospectLower.includes('schedule') ||
      prospectLower.includes('book') ||
      prospectLower.includes('calendar') ||
      prospectLower.includes('appointment') ||
      prospectLower.includes('slot') ||
      prospectLower.includes('call me at') ||
      prospectLower.includes('let us meet') ||
      prospectLower.includes("let's meet") ||
      prospectLower.includes('let’s meet') ||
      prospectLower.includes('set up a call') ||
      prospectLower.includes('confirm meeting') ||
      prospectLower.includes('મીટિંગ') ||
      prospectLower.includes('શેડ્યૂલ') ||
      prospectLower.includes('બુક') ||
      prospectLower.includes('નક્કી') ||
      prospectLower.includes('મીટીંગ') ||
      prospectLower.includes('मीटिंग') ||
      prospectLower.includes('शेड्यूल') ||
      prospectLower.includes('તય') ||
      prospectLower.includes('तय');

    const isMeetingBooked =
      !isNegativeDnd &&
      (hasDirectMeetingWord ||
        (parsedMeeting.detected && (hasDirectMeetingWord || isAffirmative || wasMeetingPreviouslyMentioned)) ||
        (wasMeetingPreviouslyMentioned && isAffirmative));

    const isMeetingWrapUp =
      wasMeetingPreviouslyMentioned && isAffirmative && !parsedMeeting.detected && !hasDirectMeetingWord;

    let aiReply = '';
    let shouldHangup = false;
    let sentiment: 'POSITIVE' | 'NEUTRAL' | 'HESITANT' | 'OBJECTION' | 'NEGATIVE' = 'NEUTRAL';
    let outcomeStatus = 'INTERESTED';

    if (isNegativeDnd) {
      sentiment = 'NEGATIVE';
      outcomeStatus = 'DND';
      shouldHangup = true;
      if (language === 'Gujarati') {
        aiReply = `હું સંપૂર્ણપણે સમજી શકું છું અને અસુવિધા બદલ દિલગીર છું. હું તરત જ તમારો નંબર અમારી ડૂ-નોટ-કૉલ (DND) રજિસ્ટ્રીમાં નોંધું છું જેથી ભવિષ્યમાં કોઈ સંપર્ક ન થાય. આપનો દિવસ શુભ રહે.`;
      } else if (language === 'Hindi') {
        aiReply = `मैं पूरी तरह समझती हूँ और असुविधा के लिए क्षमा चाहती हूँ। मैं तुरंत आपका नंबर हमारी डू-नॉट-कॉल (DND) रजिस्ट्री में दर्ज कर रही हूँ। आपका दिन शुभ हो।`;
      } else {
        aiReply = `I completely understand, and I sincerely apologize for the interruption. I am immediately adding your number to our internal Do-Not-Call compliance registry so you will not receive any further outreach. Have a great day.`;
      }

      if (lead) {
        try {
          await prisma.lead.update({
            where: { id: lead.id },
            data: { dndStatus: true, status: 'DND' },
          });
        } catch (_) {}
      }
    } else if (isMeetingWrapUp) {
      // Prospect affirmed the meeting previously offered/booked
      sentiment = 'POSITIVE';
      outcomeStatus = 'MEETING_BOOKED';
      shouldHangup = true;
      if (language === 'Gujarati') {
        aiReply = `ઉત્તમ! આપનો ખૂબ ખૂબ આભાર. અમે નક્કી કરેલા સમયે આપની સાથે મીટિંગમાં જોડાવા માટે ઉત્સુક છીએ. Techsolution સાથે વાત કરવા બદલ આભાર, આપનો દિવસ શુભ રહે!`;
      } else if (language === 'Hindi') {
        aiReply = `बहुत बढ़िया! आपका बहुत धन्यवाद। हम तय समय पर आपसे मीटिंग में जुड़ने के लिए उत्सुक हैं। Techsolution से बात करने के लिए धन्यवाद, आपका दिन शुभ हो!`;
      } else {
        aiReply = `Wonderful! Thank you so much Yash. We look forward to meeting with you then. Have a wonderful day!`;
      }
    } else if (isHumanHandoff) {
      sentiment = 'NEUTRAL';
      outcomeStatus = 'HUMAN_HANDOFF';
      const calendlyUrl = `https://calendly.com/technova-solutions/cloud-qualification?leadId=${encodeURIComponent(
        leadId
      )}&name=${encodeURIComponent(leadName)}`;

      if (language === 'Gujarati') {
        aiReply = `ચોક્કસ, હું સમજી શકું છું! મેં તમારા મોબાઈલ નંબર પર કેલેન્ડલી (Calendly) બુકિંગ લિંકનો SMS મોકલી દીધો છે, જેથી તમે તમારી અનુકૂળતા મુજબ સમય પસંદ કરીને અમારી ટીમ સાથે કૉલ બુક કરી શકો. કૃપા કરીને તમારો ફોન ચેક કરશો!`;
      } else if (language === 'Hindi') {
        aiReply = `बिल्कुल, मैं समझ सकती हूँ! मैंने आपके मोबाइल नंबर पर हमारी Calendly बुकिंग लिंक का SMS भेज दिया है, ताकि आप अपनी पसंद का समय चुनकर सीधे हमारी टीम से बात कर सकें। कृपया अपना फोन चेक करें!`;
      } else {
        aiReply = `I completely understand! I have just sent a text message to your phone with our Calendly booking link so you can directly book a call with our team from the preferred timeslots. Please check your messages!`;
      }

      // Dispatch real SMS via Twilio to physical phone
      try {
        await sendOutboundSms({
          to: targetPhone,
          body: `Hi ${leadName.split(' ')[0]}, here is your direct link to schedule a qualification demo with our senior solutions team: ${calendlyUrl}`,
        });
        if (lead) {
          await prisma.lead.update({
            where: { id: lead.id },
            data: {
              calendlyLinkSent: true,
              calendlyLinkSentAt: new Date(),
              calendlyStatus: 'LINK_SENT',
              calendlyEventUri: calendlyUrl,
              status: 'CONTACTED',
            },
          });
        }
      } catch (smsErr) {
        console.warn('SMS dispatch handled:', smsErr);
      }
    } else if (isCallbackRequested) {
      sentiment = 'HESITANT';
      outcomeStatus = 'CALLBACK_SCHEDULED';
      if (language === 'Gujarati') {
        aiReply = `કોઈ વાંધો નથી! મેં તમારા અનુકૂળ સમય મુજબ આવતીકાલે ફોલો-અપ કૉલ શેડ્યૂલ કરી દીધો છે. આપણે ટૂંક સમયમાં વાત કરીશું!`;
      } else if (language === 'Hindi') {
        aiReply = `बिल्कुल कोई बात नहीं! मैंने कल आपके लिए उपयुक्त समय पर फॉलो-अप कॉल शेड्यूल कर दिया है। हम जल्द ही बात करेंगे!`;
      } else {
        aiReply = `No problem at all! I have scheduled a priority callback for tomorrow at your preferred time window. We look forward to connecting then!`;
      }

      if (lead) {
        try {
          await prisma.lead.update({
            where: { id: lead.id },
            data: {
              status: 'CALLBACK_SCHEDULED',
              scheduledCallbackAt: new Date(Date.now() + 86400000),
            },
          });
        } catch (_) {}
      }
    } else if (isMeetingBooked) {
      sentiment = 'POSITIVE';
      outcomeStatus = 'MEETING_BOOKED';

      const meetingTime = parsedMeeting.meetingTime || new Date(Date.now() + 24 * 3600 * 1000);
      let displayStr = parsedMeeting.displayStr;
      if (!displayStr) {
        const d = new Date(meetingTime);
        displayStr = `${d.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })} at 3:00 PM`;
      }

      // Directly initiate and schedule meeting on Google Calendar & DB
      let googleCalEvent: any = null;
      try {
        googleCalEvent = await scheduleMeetingOnGoogleCalendar({
          leadId: lead?.id || leadId,
          leadName: lead?.name || leadName || 'Yash Gohel',
          leadEmail: targetEmail,
          leadPhone: targetPhone,
          companyName: company || lead?.companyName || 'Gohel Infotech Solutions',
          meetingTime,
          durationMinutes: 30,
          topic: 'Microsoft 365, SharePoint Migration & AI Enterprise Architecture',
          calendarOwnerEmail: GOOGLE_CALENDAR_OWNER_EMAIL,
          title: `Techsolution Demo & Sync with ${lead?.name || leadName || 'Yash Gohel'}`,
        });
      } catch (gcalErr) {
        console.warn('Google Calendar direct booking error:', gcalErr);
      }

      // Dispatch direct 1-click Google Calendar SMS to physical phone
      try {
        const calLink = googleCalEvent?.googleCalendarUrl || 'https://calendar.google.com';
        await sendOutboundSms({
          to: targetPhone,
          body: `Hi ${(lead?.name || leadName || 'Yash').split(' ')[0]}, your meeting with Techsolution is confirmed for ${displayStr}! Direct Google Calendar link: ${calLink}`,
        });
      } catch (smsErr) {
        console.warn('Meeting SMS dispatch error:', smsErr);
      }

      if (lead) {
        try {
          await prisma.lead.update({
            where: { id: lead.id },
            data: {
              status: 'MEETING_BOOKED',
              email: targetEmail,
              calendlyStatus: 'BOOKED',
              calendlyEventUri: googleCalEvent?.googleCalendarUrl || null,
              calendlyBookedAt: new Date(),
            },
          });
        } catch (_) {}
      }

      if (language === 'Gujarati') {
        aiReply = `ખૂબ સરસ! મેં ${displayStr} વાગ્યે Techsolution ના સોલ્યુશન્સ સ્પેશિયાલિસ્ટ સાથે આપણી મીટિંગ કન્ફર્મ કરી દીધી છે. આ મીટિંગનું Google Calendar આમંત્રણ આપના ઈમેલ ${targetEmail} પર અને ડાયરેક્ટ લિંક SMS દ્વારા આપના મોબાઈલ પર મોકલી દેવાઈ છે. શું આ સમય આપને અનુકૂળ રહેશે?`;
      } else if (language === 'Hindi') {
        aiReply = `शानदार! मैंने ${displayStr} Techsolution के सॉल्यूशंस स्पेशलिस्ट के साथ आपकी मीटिंग तय कर दी है। इसका Google Calendar आमंत्रण आपके ईमेल ${targetEmail} और डायरेक्ट लिंक आपके मोबाइल पर SMS द्वारा भेज दी गई है। क्या यह समय आपके लिए सही रहेगा?`;
      } else {
        aiReply = `Fantastic! I have directly scheduled your meeting for ${displayStr} with our senior solutions lead at Techsolution. The Google Calendar invitation has been sent to ${targetEmail} and texted directly to your phone. Does that time work well for you?`;
      }
    } else {
      // 5. Groq LLaMA 3.3 70B & Gemini 2.5 Flash Consultative Engine
      const history = existingTranscript.map((t: any) => ({
        role: (t.speaker === 'agent' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: t.text,
      }));

      const leadContext = {
        name: leadName,
        company,
        requirement: lead?.originalPostSnippet || 'Microsoft 365, SharePoint Migration & Cloud Solutions',
        orgCompanyName: orgName,
        solutionsContext: productsCatalog,
        aiPersonaName: aiPersona,
      };

      const groqReply = await generateVoiceTurnWithGroq(history, leadContext, language);
      if (groqReply) {
        aiReply = groqReply;
      } else {
        const geminiReply = await generateVoiceTurnWithGemini(history, leadContext, language);
        if (geminiReply) {
          aiReply = geminiReply;
        } else {
          if (language === 'Gujarati') {
            aiReply = `બરાબર સમજાયું. આપ ${company} માં આ માઈગ્રેશન અને ક્લાઉડ સેટઅપ માટે શું સમયમર્યાદા અને ટીમનું કદ વિચારી રહ્યા છો?`;
          } else if (language === 'Hindi') {
            aiReply = `बिल्कुल समझ गई। आप ${company} में इस क्लाउड रोलआउट के लिए क्या समय सीमा और टीम का आकार निर्धारित कर रहे हैं?`;
          } else {
            aiReply = `Understood. What timeline and team size are you planning for this rollout at ${company}?`;
          }
        }
      }

      if (
        prospectLower.includes('yes') ||
        prospectLower.includes('interested') ||
        prospectLower.includes('great') ||
        prospectLower.includes('હા') ||
        prospectLower.includes('સરસ')
      ) {
        sentiment = 'POSITIVE';
      } else if (
        prospectLower.includes('price') ||
        prospectLower.includes('cost') ||
        prospectLower.includes('expensive') ||
        prospectLower.includes('કિંમત')
      ) {
        sentiment = 'OBJECTION';
      }
    }

    // Append AI reply to transcript
    existingTranscript.push({
      speaker: 'agent',
      text: aiReply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    // Update CallLog in database
    if (callLog) {
      try {
        await prisma.callLog.update({
          where: { id: callLog.id },
          data: {
            transcriptJson: JSON.stringify(existingTranscript),
            sentiment,
            outcome: outcomeStatus,
            language,
            callSummary: `Live PSTN call turn. Latest prospect statement: "${prospectText.substring(0, 80)}"`,
            nextBestAction:
              outcomeStatus === 'MEETING_BOOKED'
                ? 'Send calendar invite and prep architecture deck.'
                : outcomeStatus === 'HUMAN_HANDOFF'
                ? 'SMS Calendly link sent. Monitor booking.'
                : outcomeStatus === 'DND'
                ? 'Compliance DND active.'
                : 'Continue qualifying scope and timeline.',
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
  <Say voice="${voice}" language="${sayLang}">${escapeXml(aiReply)}</Say>
  <Hangup/>
</Response>`;
    } else {
      responseXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="${escapeXml(dialogueActionUrl)}" method="POST" speechTimeout="auto" timeout="6" language="${gatherLang}">
    <Say voice="${voice}" language="${sayLang}">${escapeXml(aiReply)}</Say>
  </Gather>
  <Say voice="${voice}" language="${sayLang}">Thank you for speaking with ${orgName}. Have a wonderful day!</Say>
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
  <Say voice="Polly.Aditi" language="hi-IN">Thank you for your time. Have a great day.</Say>
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
