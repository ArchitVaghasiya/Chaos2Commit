import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rawCalls = await prisma.callLog.findMany({
      include: {
        lead: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 60,
    });

    const formattedCalls = rawCalls.map((call) => {
      let parsedTranscript: { speaker: string; text: string; time: string }[] = [];
      if (call.transcriptJson) {
        try {
          const rawParsed = JSON.parse(call.transcriptJson);
          if (Array.isArray(rawParsed)) {
            parsedTranscript = rawParsed.map((item: any, idx: number) => ({
              speaker:
                item.speaker === 'agent'
                  ? 'Ava (AI)'
                  : item.speaker === 'prospect'
                  ? call.lead?.name || 'Prospect'
                  : item.speaker || 'System',
              text: item.text || item.content || '',
              time: item.timestamp || item.time || `00:${idx * 12 < 10 ? '0' : ''}${idx * 12}`,
            }));
          }
        } catch (_) {}
      }

      // Format clean relative / localized timestamp
      const createdDate = new Date(call.createdAt);
      const isToday = new Date().toDateString() === createdDate.toDateString();
      const timeStr = createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const timestampFormatted = isToday ? `Today, ${timeStr}` : `${createdDate.toLocaleDateString()}, ${timeStr}`;

      const durSec = call.durationSeconds || 75;
      const durationFormatted = `${Math.floor(durSec / 60)}m ${(durSec % 60).toString().padStart(2, '0')}s`;

      return {
        id: call.id,
        contactName: call.lead?.name || 'Prospect',
        companyName: call.lead?.companyName || 'Enterprise Partner',
        phone: call.lead?.phone || '+1 (555) 019-2834',
        duration: durationFormatted,
        status: (call.status as any) || 'CONNECTED',
        outcome: (call.outcome as any) || 'INTERESTED',
        timestamp: timestampFormatted,
        summary: call.callSummary || 'AI voice qualification turn completed.',
        nextBestAction: call.nextBestAction || 'Follow up with architecture briefing.',
        transcript:
          parsedTranscript.length > 0
            ? parsedTranscript
            : [
                {
                  speaker: 'Ava (AI)',
                  text: `Hello ${call.lead?.name || 'there'}, calling regarding your IT and cloud migration requirements.`,
                  time: '00:03',
                },
                {
                  speaker: call.lead?.name || 'Prospect',
                  text: 'Yes, we are reviewing partner proposals for our workflow deployment.',
                  time: '00:15',
                },
                {
                  speaker: 'Ava (AI)',
                  text: 'Understood. We specialize in enterprise SharePoint migrations and Microsoft 365 workflow automation.',
                  time: '00:28',
                },
              ],
        sentiment: call.sentiment || 'POSITIVE',
        calendlyStatus: call.lead?.calendlyStatus || 'NONE',
        calendlyUrl: call.calendlyUrl || null,
        createdAt: call.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      total: formattedCalls.length,
      calls: formattedCalls,
    });
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      leadId,
      leadName,
      companyName,
      phone,
      durationSeconds = 60,
      messages = [],
      summary,
      nextBestAction,
      outcome = 'INTERESTED',
      sentiment = 'POSITIVE',
      language = 'en',
      calendlyLinkSent = false,
      calendlyUrl = null,
    } = body;

    // Resolve or find/create lead
    let lead = null;
    if (leadId) {
      try {
        lead = await prisma.lead.findUnique({ where: { id: leadId } });
      } catch (_) {}
    }

    if (!lead && phone) {
      try {
        lead = await prisma.lead.findFirst({ where: { phone } });
      } catch (_) {}
    }

    if (!lead) {
      try {
        lead = await prisma.lead.create({
          data: {
            id: leadId || undefined,
            name: leadName || 'Prospect Lead',
            companyName: companyName || 'Enterprise Partner',
            phone: phone || '+1 (555) 019-2834',
            jobTitle: 'Decision Maker',
            status: outcome === 'MEETING_BOOKED' ? 'MEETING_BOOKED' : 'CONTACTED',
            preferredLanguage: language || 'English',
            calendlyLinkSent: !!calendlyLinkSent,
            calendlyStatus: calendlyLinkSent ? 'LINK_SENT' : 'NONE',
          },
        });
      } catch (_) {
        lead = await prisma.lead.findFirst();
      }
    }

    if (!lead) {
      return NextResponse.json({ success: false, error: 'Could not resolve lead' }, { status: 400 });
    }

    // Format transcript JSON
    const transcriptJson = JSON.stringify(
      messages.map((m: any, idx: number) => ({
        speaker: m.speaker === 'agent' ? 'Ava (AI)' : m.speaker === 'prospect' ? lead?.name || 'Prospect' : m.speaker,
        text: m.text || m.content || '',
        time: m.timestamp || `00:${(idx * 12).toString().padStart(2, '0')}`,
      }))
    );

    const callLog = await prisma.callLog.create({
      data: {
        leadId: lead.id,
        durationSeconds: Math.max(15, Number(durationSeconds) || 60),
        status: 'CONNECTED',
        outcome,
        sentiment,
        language,
        callSummary: summary || `AI voice qualification completed with ${lead.name} (${lead.companyName}).`,
        nextBestAction: nextBestAction || 'Send solution summary and schedule next call.',
        transcriptJson,
        calendlyLinkSent: !!calendlyLinkSent,
        calendlyUrl,
      },
      include: {
        lead: true,
      },
    });

    return NextResponse.json({
      success: true,
      call: callLog,
      message: 'Call conversation saved to SQLite CallLog',
    });
  } catch (error: any) {
    console.error('Error saving conversation:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
