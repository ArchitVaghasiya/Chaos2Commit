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
      let parsedTranscript: { speaker: string; text: string; time: string; timestamp?: string; offsetSeconds?: number }[] = [];
      const durSec = call.durationSeconds || 75;
      const createdDate = new Date(call.createdAt);

      if (call.transcriptJson) {
        try {
          const rawParsed = JSON.parse(call.transcriptJson);
          if (Array.isArray(rawParsed)) {
            let lastSec = 0;
            parsedTranscript = rawParsed.map((item: any, idx: number) => {
              const speakerName =
                item.speaker === 'agent'
                  ? 'Ava (AI)'
                  : item.speaker === 'prospect'
                  ? call.lead?.name || 'Prospect'
                  : item.role === 'user'
                  ? call.lead?.name || 'Prospect'
                  : item.role === 'assistant'
                  ? 'Ava (AI)'
                  : item.speaker || 'System';

              let timeStr = item.time;
              const isWallClock = typeof timeStr === 'string' && /^\d{1,2}:\d{2}\s*(am|pm|AM|PM)$/i.test(timeStr.trim());

              if (!timeStr || isWallClock) {
                if (typeof item.offsetSeconds === 'number') {
                  const m = Math.floor(item.offsetSeconds / 60).toString().padStart(2, '0');
                  const s = (item.offsetSeconds % 60).toString().padStart(2, '0');
                  timeStr = `${m}:${s}`;
                } else {
                  const turnSec = Math.min(Math.max(0, durSec - 2), lastSec + (idx === 0 ? 2 : 12));
                  lastSec = turnSec;
                  const m = Math.floor(turnSec / 60).toString().padStart(2, '0');
                  const s = (turnSec % 60).toString().padStart(2, '0');
                  timeStr = `${m}:${s}`;
                }
              }

              const clockTime = item.timestamp || (isWallClock ? item.time : createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

              return {
                speaker: speakerName,
                text: item.text || item.content || '',
                time: timeStr,
                timestamp: clockTime,
                offsetSeconds: item.offsetSeconds ?? (idx * 12),
              };
            });
          }
        } catch (_) {}
      }

      // Format clean relative / localized timestamp for Call Card
      const isToday = new Date().toDateString() === createdDate.toDateString();
      const timeStr = createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const timestampFormatted = isToday ? `Today, ${timeStr}` : `${createdDate.toLocaleDateString()}, ${timeStr}`;

      const durationFormatted = `${Math.floor(durSec / 60)}m ${(durSec % 60).toString().padStart(2, '0')}s`;

      return {
        id: call.id,
        contactName: call.lead?.name || 'Prospect',
        companyName: call.lead?.companyName || 'Enterprise Partner',
        phone: call.lead?.phone || '+1 (555) 019-2834',
        duration: durationFormatted,
        durationSeconds: durSec,
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
                  timestamp: timeStr,
                },
                {
                  speaker: call.lead?.name || 'Prospect',
                  text: 'Yes, we are reviewing partner proposals for our workflow deployment.',
                  time: '00:15',
                  timestamp: timeStr,
                },
                {
                  speaker: 'Ava (AI)',
                  text: 'Understood. We specialize in enterprise SharePoint migrations and Microsoft 365 workflow automation.',
                  time: '00:28',
                  timestamp: timeStr,
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

    // Format transcript JSON with strict audio offset and wall-clock timing conventions
    const callDuration = Math.max(10, Number(durationSeconds) || 60);
    let cumulativeSec = 0;
    const formattedTranscript = messages.map((m: any, idx: number) => {
      // 1. Calculate proper audio offset seconds
      let offsetSec: number | null = typeof m.offsetSeconds === 'number' ? m.offsetSeconds : null;
      if (offsetSec === null && typeof m.time === 'string' && m.time.includes(':')) {
        const parts = m.time.trim().split(':').map(Number);
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          offsetSec = parts[0] * 60 + parts[1];
        }
      }
      if (offsetSec === null) {
        offsetSec = Math.min(Math.max(0, callDuration - 2), cumulativeSec + (idx === 0 ? 2 : 12));
      }
      cumulativeSec = offsetSec;

      const mins = Math.floor(offsetSec / 60).toString().padStart(2, '0');
      const secs = (offsetSec % 60).toString().padStart(2, '0');
      const audioOffset = `${mins}:${secs}`;

      // 2. Wall-clock timestamp (e.g. 09:44 AM)
      const isWallClock = typeof m.timestamp === 'string' && /^\d{1,2}:\d{2}\s*(am|pm|AM|PM)$/i.test(m.timestamp.trim());
      const clockTime = isWallClock
        ? m.timestamp
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        speaker:
          m.speaker === 'agent'
            ? 'Ava (AI)'
            : m.speaker === 'prospect'
            ? lead?.name || 'Prospect'
            : m.speaker || (m.role === 'user' ? lead?.name || 'Prospect' : 'Ava (AI)'),
        text: m.text || m.content || '',
        time: audioOffset,
        timestamp: clockTime,
        offsetSeconds: offsetSec,
      };
    });

    const transcriptJson = JSON.stringify(formattedTranscript);

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
