import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recordCalendlyBooking } from '@/lib/calendly/calendly-service';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const event = payload.event || payload.action;

    // Calendly webhook format: { event: "invitee.created", payload: { ... } }
    if (event === 'invitee.created') {
      const email = payload.payload?.email || payload.email;
      const tracking = payload.payload?.tracking || payload.tracking || {};
      const leadId = tracking.utm_term || tracking.leadId || payload.leadId;

      if (leadId) {
        await recordCalendlyBooking(leadId, payload.payload?.event || payload.eventUri);
        return NextResponse.json({ success: true, message: 'Lead booked via Calendly by leadId' });
      }

      if (email) {
        const lead = await prisma.lead.findFirst({ where: { email } });
        if (lead) {
          await recordCalendlyBooking(lead.id, payload.payload?.event || payload.eventUri);
          return NextResponse.json({ success: true, message: 'Lead booked via Calendly by email' });
        }
      }

      return NextResponse.json({ success: true, message: 'Calendly invitee event processed (no matching lead)' });
    }

    return NextResponse.json({ success: true, message: `Calendly webhook event '${event}' received` });
  } catch (error: any) {
    console.error('Calendly webhook error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
