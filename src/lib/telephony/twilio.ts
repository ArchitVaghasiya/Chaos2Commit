import twilio from 'twilio';

export interface OutboundCallParams {
  to: string;
  fromNumber?: string;
  leadId?: string;
  leadName?: string;
  companyName?: string;
  requirement?: string;
  language?: string;
  hostUrl?: string;
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
}

/**
 * Get configured Twilio client or null if credentials are unconfigured/placeholder
 */
export function getTwilioClient(): twilio.Twilio | null {
  const currentSid = process.env.TWILIO_ACCOUNT_SID;
  const currentToken = process.env.TWILIO_AUTH_TOKEN;
  if (
    currentSid &&
    currentToken &&
    currentSid.startsWith('AC') &&
    !currentSid.includes('your_') &&
    currentToken.length >= 16
  ) {
    try {
      return twilio(currentSid, currentToken);
    } catch (err) {
      console.warn('Could not initialize Twilio SDK client:', err);
      return null;
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

  // Clean phone number
  const cleanedTo = to.replace(/[^\d+]/g, '');

  if (client) {
    try {
      // Determine public base for Twilio webhooks
      const publicBase = process.env.PUBLIC_WEBHOOK_URL || (hostUrl.includes('localhost') ? undefined : hostUrl);

      const webhookUrl = publicBase
        ? `${publicBase}/api/voice/twilio/twiml?leadId=${encodeURIComponent(leadId || '')}&name=${encodeURIComponent(
            leadName || 'Prospect'
          )}&company=${encodeURIComponent(companyName || 'Enterprise')}&lang=${encodeURIComponent(
            language
          )}`
        : 'https://demo.twilio.com/docs/voice.xml';

      const statusCallbackUrl = publicBase ? `${publicBase}/api/voice/twilio/status` : undefined;

      const call = await client.calls.create({
        to: cleanedTo,
        from: callerNumber,
        url: webhookUrl,
        ...(statusCallbackUrl ? { statusCallback: statusCallbackUrl } : {}),
      });

      return {
        success: true,
        callSid: call.sid,
        status: call.status || 'queued',
        to: cleanedTo,
        from: callerNumber,
        isSimulated: false,
        message: `Live Twilio outbound call dispatched to ${cleanedTo}`,
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

/**
 * Get Polly voice and language code for twiml
 */
export function getPollyVoiceForLanguage(language: string = 'en'): { voice: string; twilioLang: string } {
  let voice = 'Polly.Joanna';
  let twilioLang = 'en-US';

  const lower = language.toLowerCase();
  if (lower.includes('hindi') || lower.includes('हिन्दी') || lower === 'hi') {
    voice = 'Polly.Aditi';
    twilioLang = 'hi-IN';
  } else if (lower.includes('spanish') || lower.includes('español') || lower === 'es') {
    voice = 'Polly.Lucia';
    twilioLang = 'es-ES';
  } else if (lower.includes('french') || lower.includes('français') || lower === 'fr') {
    voice = 'Polly.Celine';
    twilioLang = 'fr-FR';
  } else if (lower.includes('german') || lower.includes('deutsch') || lower === 'de') {
    voice = 'Polly.Vicki';
    twilioLang = 'de-DE';
  } else if (lower.includes('arabic') || lower.includes('العربية') || lower === 'ar') {
    voice = 'Polly.Zeina';
    twilioLang = 'arb';
  }

  return { voice, twilioLang };
}

/**
 * Generates TwiML for dynamic voice interactions
 */
export function buildTwimlResponse({
  speechText,
  language = 'en',
  gatherUrl,
}: {
  speechText: string;
  language?: string;
  gatherUrl?: string;
}): string {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  const { voice, twilioLang: langCode } = getPollyVoiceForLanguage(language);

  if (gatherUrl) {
    const gather = twiml.gather({
      input: ['speech', 'dtmf'],
      action: gatherUrl,
      method: 'POST',
      speechTimeout: 'auto',
      timeout: 5,
    });
    gather.say({ voice: voice as any, language: langCode as any }, speechText);
  } else {
    twiml.say({ voice: voice as any, language: langCode as any }, speechText);
  }

  return twiml.toString();
}
