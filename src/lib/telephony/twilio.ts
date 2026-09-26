import twilio from 'twilio';
import fs from 'fs';
import path from 'path';

export function getDynamicWebhookBase(hostUrl?: string): string {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/PUBLIC_WEBHOOK_URL="([^"]+)"/);
      if (match && match[1]) {
        return match[1];
      }
    }
  } catch (_) {}

  if (process.env.PUBLIC_WEBHOOK_URL) {
    return process.env.PUBLIC_WEBHOOK_URL;
  }

  if (hostUrl && !hostUrl.includes('localhost')) {
    return hostUrl;
  }

  return '';
}


export interface OutboundCallParams {
  to: string;
  fromNumber?: string;
  leadId?: string;
  leadName?: string;
  companyName?: string;
  requirement?: string;
  language?: string;
  hostUrl?: string;
  callingOrg?: string;
  aiPersona?: string;
}

export interface TwilioCallResult {
  success: boolean;
  callSid?: string;
  status: string;
  to: string;
  from: string;
  isSimulated?: boolean;
  message?: string;
  error?: string;
  trialNotice?: string;
  initialGreeting?: string;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Get configured Twilio client or null if credentials are unconfigured/placeholder
 */
export function getTwilioClient(): twilio.Twilio | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKeySid = process.env.TWILIO_API_KEY_SID;
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
  const currentToken = process.env.TWILIO_AUTH_TOKEN;

  // 1. Primary: Master Account SID & Primary Auth Token
  if (
    accountSid &&
    currentToken &&
    accountSid.startsWith('AC') &&
    !accountSid.includes('your_') &&
    currentToken.length >= 16
  ) {
    try {
      return twilio(accountSid, currentToken);
    } catch (err) {
      console.warn('Could not initialize Twilio SDK client with Auth Token:', err);
    }
  }

  // 2. Secondary fallback: Dedicated Twilio API Key & Secret
  if (apiKeySid && apiKeySecret && accountSid && apiKeySid.startsWith('SK')) {
    try {
      return twilio(apiKeySid, apiKeySecret, { accountSid });
    } catch (err) {
      console.warn('Could not initialize Twilio client with API Key:', err);
    }
  }
  return null;
}

/**
 * Initiates an outbound voice call via Twilio PSTN carrier trunking.
 */
export async function placeOutboundCall(params: OutboundCallParams): Promise<TwilioCallResult> {
  const { to, fromNumber, leadId, leadName, companyName, language = 'English', hostUrl = 'http://localhost:3000' } = params;
  const client = getTwilioClient();
  const callerNumber = fromNumber || process.env.TWILIO_PHONE_NUMBER || '+17372508034';

  // Clean phone number and ensure valid E.164 country code format
  let cleanedTo = to.replace(/[^\d+]/g, '');
  if (!cleanedTo.startsWith('+')) {
    if (cleanedTo.length === 10) {
      cleanedTo = `+91${cleanedTo}`;
    } else {
      cleanedTo = `+${cleanedTo}`;
    }
  }

  if (client) {
    try {
      // Determine dynamic public base for Twilio webhooks
      const publicBase = getDynamicWebhookBase(hostUrl);

      // Extract prospect first name and target company
      const firstName = (leadName || 'Yash').trim().split(' ')[0];
      const prospectCompany = (companyName || 'Gohel Infotech Solutions').replace(/&/g, 'and').replace(/[<>'"]/g, '');
      const callingOrg = params.callingOrg || 'Techsolution';
      const aiPersona = params.aiPersona || 'Ava';

      const safeLeadId = encodeURIComponent(leadId || '');
      const safeLeadName = encodeURIComponent(leadName || firstName);
      const safeCompany = encodeURIComponent(prospectCompany);
      const safeLang = encodeURIComponent(language || 'Gujarati');

      const { voice, sayLang, gatherLang } = getPollyVoiceForLanguage(language);

      // Formulate Ava's direct consultative greeting matching the web call
      // Introducing from Techsolution directly, without stating prospect company name in hello
      let avaGreeting = '';
      const lowerLang = (language || '').toLowerCase();
      if (lowerLang.includes('gujarati') || lowerLang.includes('ગુજરાતી') || lowerLang === 'gu') {
        avaGreeting = `નમસ્તે ${firstName}! હું ${callingOrg} તરફથી ${aiPersona} બોલી રહી છું. હું Microsoft 365, SharePoint Migration અને Cloud Enterprise સોલ્યુશન્સ વિશે વાત કરવા કૉલ કરી રહી છું. આપ આ પ્રોજેક્ટ વિશે શું પ્લાન કરી રહ્યા છો?`;
      } else if (lowerLang.includes('hindi') || lowerLang.includes('हिन्दी') || lowerLang === 'hi') {
        avaGreeting = `नमस्ते ${firstName}! मैं ${callingOrg} से ${aiPersona} बोल रही हूँ। मैं Microsoft 365, SharePoint Migration और Cloud Enterprise Solutions के संबंध में बात करने के लिए कॉल कर रही हूँ। आप इस प्रोजेक्ट को लेकर क्या योजना बना रहे हैं?`;
      } else if (lowerLang.includes('spanish') || lowerLang.includes('español')) {
        avaGreeting = `Hola ${firstName}, soy ${aiPersona} de ${callingOrg}. Le llamo en referencia a las soluciones de nube y Microsoft 365. ¿Podría comentarme un poco sobre sus requerimientos actuales?`;
      } else if (lowerLang.includes('french') || lowerLang.includes('français')) {
        avaGreeting = `Bonjour ${firstName}, je suis ${aiPersona} de ${callingOrg}. Je vous appelle au sujet des solutions cloud et Microsoft 365. Pourriez-vous m'en dire plus sur vos besoins actuels ?`;
      } else if (lowerLang.includes('german') || lowerLang.includes('deutsch')) {
        avaGreeting = `Hallo ${firstName}, ich bin ${aiPersona} von ${callingOrg}. Ich rufe bezüglich Cloud-Lösungen und Microsoft 365 an. Könnten Sie mir kurz Ihre aktuellen Anforderungen schildern?`;
      } else {
        avaGreeting = `Hello ${firstName}! I'm ${aiPersona} from ${callingOrg}. I'm calling regarding Microsoft 365, SharePoint Migration, and Cloud Enterprise solutions. Could you tell me a bit about your current requirements or timeline?`;
      }

      // Step 1: Prompt prospect for language preference with dedicated keypad digits (1/2/3) or speech
      const languageUrl = publicBase
        ? `${publicBase}/api/voice/twilio/gather?step=language&leadId=${safeLeadId}&name=${safeLeadName}&company=${safeCompany}&lang=${safeLang}`
        : '';

      const languagePromptText = `Welcome to ${callingOrg}! For Gujarati, press 1 or say Gujarati. हिन्दी के लिए 2 दबाएँ या हिन्दी बोलें। For English, press 3 or speak English.`;

      // INLINE TWIML: Prompts for dedicated number (1=Gujarati, 2=Hindi, 3=English) or speech first!
      const inlineTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${
    languageUrl
      ? `<Gather input="dtmf speech" numDigits="1" action="${languageUrl.replace(/&/g, '&amp;')}" method="POST" speechTimeout="auto" timeout="6">
    <Say voice="Polly.Aditi" language="en-IN">Welcome to ${escapeXml(callingOrg)}! For Gujarati, press 1 or say Gujarati.</Say>
    <Say voice="Polly.Aditi" language="hi-IN">हिन्दी के लिए 2 दबाएँ या हिन्दी बोलें।</Say>
    <Say voice="Polly.Aditi" language="en-IN">For English, press 3 or speak English.</Say>
  </Gather>
  <Redirect method="POST">${languageUrl.replace(/&/g, '&amp;')}&amp;defaultLang=Gujarati</Redirect>`
      : `<Say voice="Polly.Aditi" language="en-IN">Welcome to ${escapeXml(callingOrg)}!</Say>
  <Hangup/>`
  }
</Response>`;

      const twimlUrl = `${publicBase}/api/voice/twilio/twiml?leadId=${safeLeadId}&name=${safeLeadName}&company=${safeCompany}&lang=${safeLang}`;
      const statusCallbackUrl = publicBase ? `${publicBase}/api/voice/twilio/status` : undefined;

      const callOptions: any = {
        to: cleanedTo,
        from: callerNumber,
        url: twimlUrl,
      };

      if (statusCallbackUrl) {
        callOptions.statusCallback = statusCallbackUrl;
      }

      const call = await client.calls.create(callOptions);

      return {
        success: true,
        callSid: call.sid,
        status: call.status || 'queued',
        to: cleanedTo,
        from: callerNumber,
        isSimulated: false,
        message: `Live Twilio outbound call dispatched to ${cleanedTo}`,
        initialGreeting: languagePromptText,
      };
    } catch (err: any) {
      console.warn('Twilio API call attempt handled:', err?.message || err);
      const isTrialUnverified =
        err?.code === 573002 ||
        err?.code === 21215 ||
        (err?.message && (err.message.includes('verified') || err.message.includes('trial') || err.message.includes('permission')));

      let customError = `Twilio Outbound Error: ${err?.message || 'Call placement failed'}`;
      if (err?.code === 573002) {
        customError = `Twilio Trial Policy (Code 573002): In trial mode, Twilio requires: 1) A Twilio phone number in your account, and 2) Destination number ${cleanedTo} added to "Verified Caller IDs".`;
      } else if (err?.code === 21212) {
        customError = `Twilio Error (Code 21212): The "From" phone number ${callerNumber} is not a valid phone number or not verified on your Twilio account.`;
      }

      return {
        success: false,
        status: 'failed',
        to: cleanedTo,
        from: callerNumber,
        error: customError,
        trialNotice: isTrialUnverified
          ? `Action Required in Twilio Console: Add ${cleanedTo} under Phone Numbers > Verified Caller IDs (https://console.twilio.com/us1/develop/phone-numbers/manage/verified) and ensure you have an active Twilio number.`
          : undefined,
      };
    }
  }

  return {
    success: false,
    status: 'failed',
    to: cleanedTo,
    from: callerNumber,
    error: 'Twilio credentials not configured in environment.',
  };
}

export interface SendSmsParams {
  to: string;
  body: string;
  from?: string;
}

export interface SendSmsResult {
  success: boolean;
  messageSid?: string;
  isSimulated: boolean;
  to: string;
  body: string;
  error?: string;
}

/**
 * Send an outbound SMS message (e.g. Calendly booking link for human handoff).
 * Uses live Twilio SMS when configured; falls back gracefully to simulated carrier dispatch.
 */
export async function sendOutboundSms(params: SendSmsParams): Promise<SendSmsResult> {
  const { to, body, from } = params;
  const client = getTwilioClient();
  const callerNumber = from || process.env.TWILIO_PHONE_NUMBER || '+17372508034';
  
  // Format target to strict E.164 without whitespace or punctuation
  let cleanedTo = (to || '').replace(/[^\d+]/g, '');
  if (!cleanedTo.startsWith('+')) {
    if (cleanedTo.length === 10) {
      cleanedTo = `+91${cleanedTo}`;
    } else {
      cleanedTo = `+${cleanedTo}`;
    }
  }

  if (client) {
    try {
      const msg = await client.messages.create({
        to: cleanedTo,
        from: callerNumber,
        body,
      });
      return {
        success: true,
        messageSid: msg.sid,
        isSimulated: false,
        to: cleanedTo,
        body,
      };
    } catch (err: any) {
      // Twilio Trial Policy: International outbound SMS requires predefined template (e.g. sms_appointment_reminders)
      if (err?.message?.includes('Invalid template name') || err?.message?.includes('predefined SMS templates') || err?.code === 63015) {
        try {
          console.log('Retrying Twilio SMS with trial template: sms_appointment_reminders');
          const trialMsg = await client.messages.create({
            to: cleanedTo,
            from: callerNumber,
            body: 'sms_appointment_reminders',
          });
          return {
            success: true,
            messageSid: trialMsg.sid,
            isSimulated: false,
            to: cleanedTo,
            body: `📅 Appointment Reminder: Meeting scheduled for ${cleanedTo} (Verified Twilio Trial Template)`,
          };
        } catch (trialErr: any) {
          console.warn('Twilio trial template SMS also failed:', trialErr?.message || trialErr);
        }
      }

      console.warn('Twilio SMS dispatch handled (carrier fallback):', err?.message || err);
      return {
        success: true,
        messageSid: `SM_SIM_${Date.now()}`,
        isSimulated: true,
        to: cleanedTo,
        body,
        error: err?.message,
      };
    }
  }

  return {
    success: true,
    messageSid: `SM_SIM_${Date.now()}`,
    isSimulated: true,
    to: cleanedTo,
    body,
  };
}

/**
 * Get Polly voice and language code for twiml
 */
export function getPollyVoiceForLanguage(language: string = 'en'): {
  voice: string;
  twilioLang: string;
  sayLang: string;
  gatherLang: string;
} {
  let voice = 'Polly.Aditi';
  let sayLang = 'en-IN';
  let gatherLang = 'en-IN';

  const lower = language.toLowerCase();
  if (lower.includes('gujarati') || lower.includes('ગુજરાતી') || lower === 'gu') {
    voice = 'Google.gu-IN-Standard-A';
    sayLang = 'gu-IN';
    gatherLang = 'gu-IN';
  } else if (lower.includes('hindi') || lower.includes('हिन्दी') || lower === 'hi') {
    voice = 'Polly.Aditi';
    sayLang = 'hi-IN';
    gatherLang = 'hi-IN';
  } else if (lower.includes('spanish') || lower.includes('español') || lower === 'es') {
    voice = 'Polly.Lucia';
    sayLang = 'es-ES';
    gatherLang = 'es-ES';
  } else if (lower.includes('french') || lower.includes('français') || lower === 'fr') {
    voice = 'Polly.Celine';
    sayLang = 'fr-FR';
    gatherLang = 'fr-FR';
  } else if (lower.includes('german') || lower.includes('deutsch') || lower === 'de') {
    voice = 'Polly.Vicki';
    sayLang = 'de-DE';
    gatherLang = 'de-DE';
  } else if (lower.includes('arabic') || lower.includes('العربية') || lower === 'ar') {
    voice = 'Polly.Zeina';
    sayLang = 'arb';
    gatherLang = 'ar-XA';
  }

  return { voice, twilioLang: sayLang, sayLang, gatherLang };
}

/**
 * Generates TwiML for dynamic voice interactions
 */
export function buildTwimlResponse({
  speechText,
  language = 'en',
  gatherUrl,
  numDigits,
}: {
  speechText: string;
  language?: string;
  gatherUrl?: string;
  numDigits?: number;
}): string {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  const { voice, sayLang, gatherLang } = getPollyVoiceForLanguage(language);

  if (gatherUrl) {
    const gatherOptions: any = {
      input: ['speech', 'dtmf'],
      action: gatherUrl,
      method: 'POST',
      speechTimeout: 'auto',
      timeout: 5,
      language: gatherLang,
    };
    if (numDigits) {
      gatherOptions.numDigits = numDigits;
    }
    const gather = twiml.gather(gatherOptions);
    gather.say({ voice: voice as any, language: sayLang as any }, speechText);
  } else {
    twiml.say({ voice: voice as any, language: sayLang as any }, speechText);
  }

  return twiml.toString();
}
