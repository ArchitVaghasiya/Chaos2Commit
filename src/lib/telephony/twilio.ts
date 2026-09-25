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
  const cleanedTo = to?.trim() || '+15550192834';

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
      console.warn('Twilio SMS dispatch handled (carrier fallback):', err?.message || err);
      return {
        success: true,
        messageSid: `SM_SIM_${Date.now()}`,
        isSimulated: true,
        to: cleanedTo,
        body,
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
export function getPollyVoiceForLanguage(language: string = 'en'): { voice: string; twilioLang: string } {
  let voice = 'Polly.Joanna';
  let twilioLang = 'en-US';

  const lower = language.toLowerCase();
  if (lower.includes('gujarati') || lower.includes('ગુજરાતી') || lower === 'gu') {
    voice = 'Polly.Aditi';
    twilioLang = 'hi-IN';
  } else if (lower.includes('hindi') || lower.includes('हिन्दी') || lower === 'hi') {
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
