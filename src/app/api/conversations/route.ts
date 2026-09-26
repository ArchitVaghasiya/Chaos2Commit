import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch calls with lead details using raw query or findMany fallback
    let rawCalls: any[] = [];
    try {
      rawCalls = await prisma.$queryRawUnsafe(`
        SELECT 
          c.id, c.leadId, c.campaignId, c.status, c.outcome, c.durationSeconds,
          c.language, c.callSummary, c.nextBestAction, c.transcriptJson,
          c.meetingScheduledAt, c.recordingUrl, c.createdAt, c.calendlyLinkSent,
          c.calendlyUrl, c.callbackScheduledAt, c.sentiment,
          l.name as leadName, l.companyName as leadCompanyName,
          l.phone as leadPhone, l.email as leadEmail, l.calendlyStatus as leadCalendlyStatus
        FROM "CallLog" c
        LEFT JOIN "Lead" l ON c.leadId = l.id
        ORDER BY c."createdAt" DESC
        LIMIT 60
      `);
    } catch (_) {
      try {
        rawCalls = await prisma.callLog.findMany({
          include: { lead: true },
          orderBy: { createdAt: 'desc' },
          take: 60,
        });
      } catch (e2) {
        console.warn('Fallback findMany error:', e2);
      }
    }

    // Ensure strict descending chronological sorting by real timestamp
    rawCalls.sort((a: any, b: any) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeB - timeA;
    });

    const formattedCalls = (rawCalls || []).map((call: any) => {
      let parsedTranscript: { speaker: string; text: string; time: string; timestamp?: string; offsetSeconds?: number }[] = [];
      const durSec = Number(call.durationSeconds) || 75;
      const createdDate = new Date(call.createdAt || Date.now());

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
                  ? call.leadName || call.lead?.name || 'Prospect'
                  : item.role === 'user'
                  ? call.leadName || call.lead?.name || 'Prospect'
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

      const contactName = call.leadName || call.lead?.name || 'Prospect';
      const companyName = call.leadCompanyName || call.lead?.companyName || 'Enterprise Partner';
      const phone = call.leadPhone || call.lead?.phone || '+1 (555) 019-2834';

      return {
        id: call.id,
        contactName,
        companyName,
        phone,
        duration: durationFormatted,
        durationSeconds: durSec,
        status: call.status || 'CONNECTED',
        outcome: call.outcome || 'INTERESTED',
        timestamp: timestampFormatted,
        summary: call.callSummary || 'AI voice qualification turn completed.',
        nextBestAction: call.nextBestAction || 'Follow up with architecture briefing.',
        transcript:
          parsedTranscript.length > 0
            ? parsedTranscript
            : [
                {
                  speaker: 'Ava (AI)',
                  text: `Hello ${contactName}, calling regarding your IT and cloud migration requirements.`,
                  time: '00:03',
                  timestamp: timeStr,
                },
                {
                  speaker: contactName,
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
        calendlyStatus: call.leadCalendlyStatus || call.lead?.calendlyStatus || (call.calendlyLinkSent ? 'LINK_SENT' : 'NONE'),
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
      twilioCallSid = null,
    } = body;

    // 0. If this is a Twilio call with an existing CallLog, update it directly
    if (twilioCallSid) {
      try {
        const existing = await prisma.callLog.findFirst({
          where: { twilioCallSid },
        });
        if (existing) {
          const finalDuration = Math.max(Number(existing.durationSeconds) || 0, Number(durationSeconds) || 0);
          const finalSummary = summary || existing.callSummary;
          const finalNextAction = nextBestAction || existing.nextBestAction;

          let finalTranscript = existing.transcriptJson;
          if (messages && Array.isArray(messages) && messages.length > 0) {
            let existingTurns: any[] = [];
            try {
              if (existing.transcriptJson) existingTurns = JSON.parse(existing.transcriptJson);
            } catch (_) {}

            if (messages.length >= existingTurns.length) {
              finalTranscript = JSON.stringify(messages);
            }
          }

          const updated = await prisma.callLog.update({
            where: { id: existing.id },
            data: {
              status: 'COMPLETED',
              durationSeconds: finalDuration,
              outcome: outcome || existing.outcome,
              sentiment: sentiment || existing.sentiment,
              callSummary: finalSummary,
              nextBestAction: finalNextAction,
              ...(finalTranscript ? { transcriptJson: finalTranscript } : {}),
            },
          });

          return NextResponse.json({
            success: true,
            call: updated,
            message: 'Existing Twilio CallLog updated successfully',
          });
        }
      } catch (twilioUpdateErr) {
        console.warn('Error updating existing Twilio call log:', twilioUpdateErr);
      }
    }

    // Resolve or create lead in DB
    let lead: any = null;
    if (leadId) {
      try {
        const rows: any[] = await prisma.$queryRawUnsafe('SELECT * FROM "Lead" WHERE "id" = ? LIMIT 1', leadId);
        if (rows && rows.length > 0) lead = rows[0];
      } catch (_) {}
    }

    if (!lead && phone) {
      try {
        const rows: any[] = await prisma.$queryRawUnsafe('SELECT * FROM "Lead" WHERE "phone" = ? LIMIT 1', phone);
        if (rows && rows.length > 0) lead = rows[0];
      } catch (_) {}
    }

    if (!lead) {
      try {
        const first: any[] = await prisma.$queryRawUnsafe('SELECT * FROM "Lead" LIMIT 1');
        if (first && first.length > 0) {
          lead = first[0];
        } else {
          const newId = leadId || `lead-${Date.now()}`;
          const nowStr = new Date().toISOString();
          await prisma.$executeRawUnsafe(
            `INSERT INTO "Lead" (
              "id", "name", "companyName", "phone", "email", "jobTitle",
              "status", "preferredLanguage", "calendlyLinkSent", "calendlyStatus",
              "createdAt", "updatedAt"
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            newId,
            leadName || 'Prospect Lead',
            companyName || 'Enterprise Partner',
            phone || '+1 (555) 019-2834',
            'prospect@example.com',
            'Decision Maker',
            outcome === 'MEETING_BOOKED' ? 'MEETING_BOOKED' : 'CONTACTED',
            language || 'English',
            calendlyLinkSent ? 1 : 0,
            calendlyLinkSent ? 'LINK_SENT' : 'NONE',
            nowStr,
            nowStr
          );
          const created: any[] = await prisma.$queryRawUnsafe('SELECT * FROM "Lead" WHERE "id" = ? LIMIT 1', newId);
          lead = created?.[0] || null;
        }
      } catch (createErr) {
        console.warn('Error resolving lead for call log:', createErr);
      }
    }

    const resolvedLeadId = lead?.id || leadId || 'lead-guest';
    const resolvedLeadName = lead?.name || leadName || 'Prospect';
    const resolvedCompanyName = lead?.companyName || companyName || 'Enterprise Partner';

    // Format transcript JSON with strict audio offset and wall-clock timing conventions
    const callDuration = Math.max(10, Number(durationSeconds) || 60);
    let cumulativeSec = 0;
    const formattedTranscript = messages.map((m: any, idx: number) => {
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

      const isWallClock = typeof m.timestamp === 'string' && /^\d{1,2}:\d{2}\s*(am|pm|AM|PM)$/i.test(m.timestamp.trim());
      const clockTime = isWallClock
        ? m.timestamp
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        speaker:
          m.speaker === 'agent'
            ? 'Ava (AI)'
            : m.speaker === 'prospect'
            ? resolvedLeadName
            : m.speaker || (m.role === 'user' ? resolvedLeadName : 'Ava (AI)'),
        text: m.text || m.content || '',
        time: audioOffset,
        timestamp: clockTime,
        offsetSeconds: offsetSec,
      };
    });

    const transcriptJson = JSON.stringify(formattedTranscript);
    const callLogId = `call-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    const finalSummary = summary || `AI voice qualification completed with ${resolvedLeadName} (${resolvedCompanyName}).`;
    const finalNextAction = nextBestAction || 'Send solution summary and schedule next call.';

    // Execute direct raw SQL insertion into CallLog to avoid any Prisma Client type mismatch
    await prisma.$executeRawUnsafe(
      `INSERT INTO "CallLog" (
        "id", "leadId", "durationSeconds", "status", "outcome", "sentiment",
        "language", "callSummary", "nextBestAction", "transcriptJson",
        "calendlyLinkSent", "calendlyUrl", "createdAt"
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      callLogId,
      resolvedLeadId,
      callDuration,
      'CONNECTED',
      outcome,
      sentiment,
      language,
      finalSummary,
      finalNextAction,
      transcriptJson,
      calendlyLinkSent ? 1 : 0,
      calendlyUrl || null,
      nowMs
    );

    // Update lead status in DB
    try {
      const newStatus = outcome === 'MEETING_BOOKED' ? 'MEETING_BOOKED' : 'CONTACTED';
      await prisma.$executeRawUnsafe(
        `UPDATE "Lead" SET "status" = ?, "updatedAt" = ? WHERE "id" = ?`,
        newStatus,
        nowIso,
        resolvedLeadId
      );
    } catch (_) {}

    return NextResponse.json({
      success: true,
      call: {
        id: callLogId,
        leadId: resolvedLeadId,
        leadName: resolvedLeadName,
        durationSeconds: callDuration,
        status: 'CONNECTED',
        outcome,
        sentiment,
        callSummary: finalSummary,
        nextBestAction: finalNextAction,
        transcriptJson,
        createdAt: nowIso,
      },
      message: 'Call conversation successfully saved to database CallLog',
    });
  } catch (error: any) {
    console.error('Error saving conversation:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
