import { NextResponse } from 'next/server';
import { placeOutboundCall } from '@/lib/telephony/twilio';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { leadId, phoneNumber, language = 'English', campaignId } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required for live Twilio outbound call.' },
        { status: 400 }
      );
    }

    let resolvedLeadId = leadId;
    let lead: any = null;
    if (resolvedLeadId) {
      try {
        lead = await prisma.lead.findUnique({ where: { id: resolvedLeadId } });
      } catch (_) {}
    } else {
      try {
        lead = await prisma.lead.findFirst({
          where: { phone: phoneNumber },
        });
        if (!lead) {
          lead = await prisma.lead.findFirst();
        }
        if (lead) {
          resolvedLeadId = lead.id;
        }
      } catch (_) {}
    }

    // Determine host URL for callbacks
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const hostUrl = `${protocol}://${host}`;

    const callResult = await placeOutboundCall({
      to: phoneNumber,
      leadId: resolvedLeadId,
      leadName: lead?.name || 'Prospect',
      companyName: lead?.companyName || 'Enterprise Lead',
      requirement: lead?.originalPostSnippet || 'Cloud & M365 Solutions',
      language: lead?.preferredLanguage || language,
      hostUrl,
    });

    if (!callResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: callResult.error || 'Failed to place Twilio outbound call',
          trialNotice: callResult.trialNotice,
        },
        { status: 400 }
      );
    }

    // Create CallLog in database
    let createdCallLog: any = null;
    if (resolvedLeadId) {
      try {
        createdCallLog = await prisma.callLog.create({
          data: {
            leadId: resolvedLeadId,
            campaignId: campaignId || lead?.campaignId || null,
            status: 'DIALING',
            outcome: 'INTERESTED',
            durationSeconds: 0,
            language: lead?.preferredLanguage || language,
            telephonyProvider: 'TWILIO_VOICE',
            callSummary: `Live Twilio PSTN call initiated to ${phoneNumber}. Tracking Call SID: ${callResult.callSid}`,
            nextBestAction: 'Connecting live carrier voice trunking with Ava AI.',
            twilioCallSid: callResult.callSid,
            transcriptJson: JSON.stringify([
              {
                speaker: 'system',
                text: `Twilio Outbound call dispatched to ${phoneNumber} (SID: ${callResult.callSid}). Status: ${callResult.status}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]),
          },
        });

        // Update lead status to CALL_SCHEDULED / CONTACTED
        if (lead) {
          try {
            await prisma.lead.update({
              where: { id: resolvedLeadId },
              data: { status: 'CALL_SCHEDULED' },
            });
          } catch (_) {}
        }
      } catch (dbErr) {
        console.warn('Could not persist initial Twilio call log in DB:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      call: callResult,
      callLogId: createdCallLog?.id,
    });
  } catch (error: any) {
    console.error('Twilio outbound call error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Twilio call failed' },
      { status: 500 }
    );
  }
}
