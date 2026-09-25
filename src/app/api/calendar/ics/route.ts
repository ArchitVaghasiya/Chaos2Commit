import { NextResponse } from 'next/server';
import { getGoogleCalendarEvents } from '@/lib/calendar/google-calendar';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const eventId = url.searchParams.get('id');

  const events = await getGoogleCalendarEvents();
  const event = eventId ? events.find((e) => e.id === eventId) : events[0];

  if (!event) {
    return new NextResponse('Calendar event not found', { status: 404 });
  }

  const formatIcsDate = (dateStr: string) => {
    return new Date(dateStr).toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const start = formatIcsDate(event.startTime);
  const end = formatIcsDate(event.endTime);
  const now = formatIcsDate(new Date().toISOString());

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Chaos2Commit//AI Sales Voice Agent//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${event.id}@chaos2commit.ai`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    'LOCATION:Google Meet / Telephony',
    'STATUS:CONFIRMED',
    'ORGANIZER;CN=AI Sales Executive:mailto:ava@technova.ai',
    `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=${event.leadName}:mailto:${event.leadEmail || 'guest@example.com'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics"`,
    },
  });
}
