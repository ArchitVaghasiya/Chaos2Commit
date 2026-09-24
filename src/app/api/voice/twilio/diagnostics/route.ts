import { NextResponse } from 'next/server';
import { getTwilioClient } from '@/lib/telephony/twilio';

export async function GET(request: Request) {
  return handleDiagnostics(request);
}

export async function POST(request: Request) {
  return handleDiagnostics(request);
}

async function handleDiagnostics(request: Request) {
  try {
    const url = new URL(request.url);
    let targetPhone = url.searchParams.get('targetPhone') || '+91 9737362307';

    if (request.method === 'POST') {
      try {
        const body = await request.json();
        if (body.targetPhone) targetPhone = body.targetPhone;
        if (body.updateTwilioPhone) {
          const fs = await import('fs');
          const path = await import('path');
          const envPath = path.join(process.cwd(), '.env');
          let content = fs.readFileSync(envPath, 'utf8');
          content = content.replace(/TWILIO_PHONE_NUMBER=".*?"/, `TWILIO_PHONE_NUMBER="${body.updateTwilioPhone}"`);
          fs.writeFileSync(envPath, content);
          process.env.TWILIO_PHONE_NUMBER = body.updateTwilioPhone;
        }
      } catch (_) {}
    }

    const client = getTwilioClient();
    if (!client) {
      return NextResponse.json({
        success: false,
        isConfigured: false,
        error: 'Twilio Account SID or Auth Token is missing or invalid in environment.',
      });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const envPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';

    // Fetch account details
    const account = await client.api.v2010.accounts(accountSid).fetch();
    const isTrial = account.type.toLowerCase().includes('trial');

    // Fetch incoming phone numbers in account
    const incoming = await client.incomingPhoneNumbers.list({ limit: 20 });
    const ownedNumbers = incoming.map((n) => ({
      phoneNumber: n.phoneNumber,
      sid: n.sid,
      friendlyName: n.friendlyName,
    }));

    // Fetch verified caller IDs (required for trial accounts)
    const callerIds = await client.outgoingCallerIds.list({ limit: 50 });
    const verifiedNumbers = callerIds.map((c) => ({
      phoneNumber: c.phoneNumber,
      friendlyName: c.friendlyName,
      sid: c.sid,
    }));

    // Normalize phone numbers for comparison
    const cleanTarget = targetPhone.replace(/[^\d+]/g, '');
    const isTargetVerified =
      !isTrial ||
      verifiedNumbers.some((v) => {
        const cleanV = v.phoneNumber.replace(/[^\d+]/g, '');
        return cleanV === cleanTarget || cleanV.endsWith(cleanTarget.slice(-10));
      });

    const isEnvPhoneOwned = ownedNumbers.some((n) => {
      const cleanOwned = n.phoneNumber.replace(/[^\d+]/g, '');
      const cleanEnv = envPhoneNumber.replace(/[^\d+]/g, '');
      return cleanOwned === cleanEnv;
    });

    const needsTwilioNumber = ownedNumbers.length === 0;
    const needsTargetVerification = isTrial && !isTargetVerified;
    const isReady = !needsTwilioNumber && !needsTargetVerification;

    const actionSteps: { step: number; title: string; detail: string; link?: string; completed: boolean }[] = [];

    // Step 1: Twilio Number
    actionSteps.push({
      step: 1,
      title: needsTwilioNumber ? 'Claim a Free Twilio Phone Number' : 'Twilio Phone Number Active',
      detail: needsTwilioNumber
        ? 'Your Twilio account has no active phone numbers yet. In your Twilio Console, click "Get a trial phone number" or go to Phone Numbers > Manage > Buy a number (100% free with your trial balance).'
        : `Active Twilio Caller Line: ${ownedNumbers[0]?.phoneNumber}`,
      link: 'https://console.twilio.com/us1/develop/phone-numbers/manage/incoming',
      completed: !needsTwilioNumber,
    });

    // Step 2: Destination Number Verification (Trial accounts)
    actionSteps.push({
      step: 2,
      title: isTrial
        ? needsTargetVerification
          ? `Verify Your Mobile Number (${targetPhone})`
          : `Mobile Number Verified (${targetPhone})`
        : 'Enterprise / Upgraded Account (Any destination allowed)',
      detail: isTrial
        ? needsTargetVerification
          ? `Because your Twilio account is in Trial mode, Twilio requires you to add your mobile number (${targetPhone}) under "Verified Caller IDs". Twilio will send a quick 6-digit SMS verification code.`
          : `Destination ${targetPhone} is verified and ready to receive live phone calls.`
        : 'No recipient restrictions apply.',
      link: 'https://console.twilio.com/us1/develop/phone-numbers/manage/verified',
      completed: !needsTargetVerification,
    });

    return NextResponse.json({
      success: true,
      isConfigured: true,
      account: {
        sid: account.sid,
        friendlyName: account.friendlyName,
        status: account.status,
        type: account.type,
        isTrial,
      },
      envPhoneNumber,
      isEnvPhoneOwned,
      ownedNumbers,
      verifiedNumbers,
      targetPhone,
      isTargetVerified,
      needsTwilioNumber,
      needsTargetVerification,
      isReady,
      publicWebhookUrl: process.env.PUBLIC_WEBHOOK_URL || null,
      actionSteps,
    });
  } catch (error: any) {
    console.error('Twilio diagnostics error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to inspect Twilio account',
      },
      { status: 500 }
    );
  }
}
