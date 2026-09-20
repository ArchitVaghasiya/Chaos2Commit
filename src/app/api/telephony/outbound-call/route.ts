import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phoneNumber, leadName, companyName, language } = body;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json(
        {
          success: false,
          error: 'Twilio credentials not fully configured in .env',
        },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);

    // Destination phone number - default to Yash's verified phone number if not provided
    const destinationNumber = phoneNumber || '+919737362307';
    const targetName = leadName || 'Yash';
    const targetCompany = companyName || 'Nexus Dynamics Corp';

    // Tailored spoken pitch message
    const speechMessage = `Hello ${targetName}! This is Ava, your AI Sales Agent from Team 4Stream at Chaos2Commit hackathon. I am calling regarding the 150-user SharePoint and Microsoft 365 implementation at ${targetCompany}. Our real-world autonomous telephone calling is now connected live to your mobile phone. We look forward to our meeting on Thursday at 3 PM. Thank you!`;

    const twimlPayload = `<Response><Say voice="Polly.Aditi" language="en-IN">${speechMessage}</Say></Response>`;
    const twimletUrl = `http://twimlets.com/echo?Twiml=${encodeURIComponent(twimlPayload)}`;

    const call = await client.calls.create({
      url: twimletUrl,
      to: destinationNumber,
      from: fromNumber,
    });

    return NextResponse.json({
      success: true,
      callSid: call.sid,
      status: call.status,
      message: `Live call placed to ${destinationNumber}!`,
    });
  } catch (error: any) {
    console.error('Twilio Outbound Call Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to initiate outbound Twilio call',
      },
      { status: 500 }
    );
  }
}
