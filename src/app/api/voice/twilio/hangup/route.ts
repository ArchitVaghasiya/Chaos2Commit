import { NextResponse } from 'next/server';
import { getTwilioClient } from '@/lib/telephony/twilio';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { callSid } = await request.json();
    if (callSid) {
      const client = getTwilioClient();
      if (client && !callSid.startsWith('CA_')) {
        try {
          await client.calls(callSid).update({ status: 'completed' });
        } catch (err) {
          console.warn('Could not terminate Twilio call directly:', err);
        }
      }
      await prisma.callLog.updateMany({
        where: { twilioCallSid: callSid },
        data: { status: 'COMPLETED' },
      });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
