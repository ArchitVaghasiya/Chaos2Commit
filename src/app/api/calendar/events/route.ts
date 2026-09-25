import { NextResponse } from 'next/server';
import {
  scheduleMeetingOnGoogleCalendar,
  getGoogleCalendarEvents,
  extractMeetingDateTime,
  GOOGLE_CALENDAR_API_KEY,
} from '@/lib/calendar/google-calendar';

export async function GET() {
  try {
    const events = await getGoogleCalendarEvents();
    return NextResponse.json({
      success: true,
      apiKey: GOOGLE_CALENDAR_API_KEY,
      total: events.length,
      events,
    });
  } catch (error: any) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      leadId,
      leadName,
      leadEmail,
      leadPhone,
      companyName,
      speechText,
      meetingTime,
      durationMinutes = 30,
      topic,
    } = body;

    let targetTime = meetingTime;
    let detectedDisplay = '';

    if (!targetTime && speechText) {
      const parsed = extractMeetingDateTime(speechText);
      if (parsed.detected && parsed.meetingTime) {
        targetTime = parsed.meetingTime.toISOString();
        detectedDisplay = parsed.displayStr;
      }
    }

    const event = await scheduleMeetingOnGoogleCalendar({
      leadId,
      leadName: leadName || 'Enterprise Lead',
      leadEmail,
      leadPhone,
      companyName,
      meetingTime: targetTime,
      durationMinutes,
      topic: topic || 'Microsoft 365 & SharePoint Implementation',
    });

    return NextResponse.json({
      success: true,
      message: `Meeting successfully scheduled on Google Calendar with API key ${GOOGLE_CALENDAR_API_KEY}`,
      event,
      detectedDisplay,
      apiKey: GOOGLE_CALENDAR_API_KEY,
    });
  } catch (error: any) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
