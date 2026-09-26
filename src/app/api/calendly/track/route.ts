import { NextResponse } from 'next/server';
import {
  sendCalendlyLinkViaSms,
  recordCalendlyBooking,
  markUnbookedAndScheduleRedial,
  getCalendlyTrackingSummary,
} from '@/lib/calendly/calendly-service';
import { prisma } from '@/lib/prisma';

import {
  scheduleMeetingOnGoogleCalendar,
  GOOGLE_CALENDAR_OWNER_EMAIL,
} from '@/lib/calendar/google-calendar';

export async function GET() {
  try {
    const summary = await getCalendlyTrackingSummary();
    return NextResponse.json({ success: true, ...summary });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, leadId, phone, eventUri } = body;

    if (!leadId) {
      return NextResponse.json({ success: false, error: 'leadId is required' }, { status: 400 });
    }

    if (action === 'SEND_SMS') {
      const result = await sendCalendlyLinkViaSms(leadId, phone);
      return NextResponse.json(result);
    }

    if (action === 'BOOK') {
      const result = await recordCalendlyBooking(leadId, eventUri);
      // Automatically store to jayrajsinhbhatti9687@gmail.com Google Calendar with zero human interference
      try {
        const lead = result.lead;
        if (lead) {
          await scheduleMeetingOnGoogleCalendar({
            leadId: lead.id,
            leadName: lead.name,
            leadEmail: lead.email,
            leadPhone: lead.phone,
            companyName: lead.companyName,
            meetingTime: lead.calendlyBookedAt || new Date(Date.now() + 24 * 3600 * 1000),
            topic: 'Calendly Confirmed Demo & Sync',
            calendarOwnerEmail: GOOGLE_CALENDAR_OWNER_EMAIL,
          });
        }
      } catch (gcalErr) {
        console.warn('Auto GCal booking from Calendly error:', gcalErr);
      }
      return NextResponse.json(result);
    }

    if (action === 'MARK_UNBOOKED' || action === 'EXPIRE') {
      const result = await markUnbookedAndScheduleRedial(leadId);
      return NextResponse.json(result);
    }

    if (action === 'TRIGGER_REDIAL') {
      const lead = await prisma.lead.findUnique({ where: { id: leadId } });
      if (!lead) {
        return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
      }

      await prisma.lead.update({
        where: { id: leadId },
        data: {
          calendlyStatus: 'REDIAL_TRIGGERED',
          status: 'CONTACTED',
          redialCount: (lead.redialCount || 0) + 1,
        },
      });

      return NextResponse.json({
        success: true,
        message: `AI Re-dial initiated for ${lead.name}`,
        lead,
        callContext: {
          leadId: lead.id,
          name: lead.name,
          phone: lead.phone,
          company: lead.companyName,
          reason: 'CALENDLY_UNBOOKED_FOLLOWUP',
          openingLine: `Hi ${lead.name}, this is Ava from Techsolution. I noticed you received our Calendly booking link earlier but hadn't selected a time slot yet. I wanted to follow up directly to see if we can find a convenient 10-minute window for a quick discussion?`,
        },
      });
    }

    return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('Calendly track API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
