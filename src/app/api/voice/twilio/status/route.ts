import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const callSid = url.searchParams.get('callSid');
    const leadId = url.searchParams.get('leadId');

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

    if (!callLog) {
      return NextResponse.json({ success: false, error: 'No call log found' }, { status: 404 });
    }

    let transcript: any[] = [];
    if (callLog.transcriptJson) {
      try {
        transcript = JSON.parse(callLog.transcriptJson);
      } catch (_) {}
    }

    return NextResponse.json({
      success: true,
      callSid: callLog.twilioCallSid,
      status: callLog.status,
      durationSeconds: callLog.durationSeconds,
      sentiment: callLog.sentiment,
      outcome: callLog.outcome,
      callSummary: callLog.callSummary,
      nextBestAction: callLog.nextBestAction,
      transcript,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;
    const callDuration = formData.get('CallDuration') as string;
    const recordingUrl = formData.get('RecordingUrl') as string;

    if (callSid) {
      const durationSeconds = callDuration ? parseInt(callDuration, 10) : 60;

      // Update call log if exists
      const existing = await prisma.callLog.findFirst({
        where: { twilioCallSid: callSid },
      });

      if (existing) {
        let outcome = existing.outcome;
        let status = 'CONNECTED';

        if (callStatus === 'completed') {
          status = 'CONNECTED';
          outcome = 'INTERESTED';
        } else if (callStatus === 'busy' || callStatus === 'no-answer') {
          status = 'RETRY_SCHEDULED';
          outcome = 'RETRY_SCHEDULED';
        } else if (callStatus === 'failed') {
          status = 'FAILED';
          outcome = 'NOT_INTERESTED';
        }

        await prisma.callLog.update({
          where: { id: existing.id },
          data: {
            status,
            outcome,
            durationSeconds,
            recordingUrl: recordingUrl || existing.recordingUrl,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Twilio status callback error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
