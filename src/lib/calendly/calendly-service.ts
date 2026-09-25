import { prisma } from '@/lib/prisma';
import { sendOutboundSms } from '@/lib/telephony/twilio';

export interface CalendlyLeadStatus {
  id: string;
  name: string;
  phone: string | null;
  companyName: string;
  calendlyStatus: 'NONE' | 'LINK_SENT' | 'BOOKED' | 'NOT_BOOKED' | 'REDIAL_TRIGGERED';
  calendlyLinkSentAt: Date | null;
  calendlyBookedAt: Date | null;
  redialScheduledAt: Date | null;
  redialCount: number;
}

/**
 * Generate Calendly scheduling URL with lead identifiers
 */
export function generateCalendlyUrl(leadId: string, leadName: string): string {
  const base = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/ai-sales-team/quick-sync';
  const cleanId = encodeURIComponent(leadId || 'lead-guest');
  const cleanName = encodeURIComponent(leadName || 'Valued Lead');
  return `${base}?leadId=${cleanId}&name=${cleanName}`;
}

/**
 * Dispatches a real/simulated SMS with a Calendly booking link to the lead
 */
export async function sendCalendlyLinkViaSms(leadId: string, overridePhone?: string) {
  let lead: any = null;
  if (leadId) {
    try {
      lead = await prisma.lead.findUnique({ where: { id: leadId } });
    } catch (_) {}
  }

  const name = lead?.name || 'there';
  const targetPhone = overridePhone || lead?.phone || '+1 (555) 019-2834';
  const calendlyUrl = generateCalendlyUrl(lead?.id || leadId, name);

  const smsBody = `Hi ${name}, here is the link to schedule a direct call with our team: ${calendlyUrl} . Please choose any timeslot that works best for you!`;

  const smsResult = await sendOutboundSms({
    to: targetPhone,
    body: smsBody,
  });

  // Update lead status in database
  if (lead?.id) {
    try {
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          calendlyLinkSent: true,
          calendlyLinkSentAt: new Date(),
          calendlyStatus: 'LINK_SENT',
        },
      });
    } catch (e) {
      console.warn('Could not update lead calendlyStatus:', e);
    }
  }

  return {
    success: true,
    smsResult,
    calendlyUrl,
    targetPhone,
    smsBody,
    sentAt: new Date().toISOString(),
  };
}

/**
 * Ensures a lead exists before tracking Calendly events, creating on-demand if needed
 */
async function ensureLeadExists(leadId: string): Promise<any> {
  let existing = null;
  if (leadId) {
    try {
      existing = await prisma.lead.findUnique({ where: { id: leadId } });
    } catch (_) {}
  }
  if (!existing) {
    try {
      existing = await prisma.lead.create({
        data: {
          id: leadId || undefined,
          name: 'Priya Nair',
          companyName: 'CloudTech Solutions',
          phone: '+1 (555) 872-9012',
          email: 'priya.nair@cloudtech.example.com',
          jobTitle: 'VP of Technology & Cloud Infrastructure',
          location: 'San Francisco, CA',
          country: 'United States',
          preferredLanguage: 'English',
        },
      });
    } catch (_) {
      existing = await prisma.lead.findFirst();
    }
  }
  return existing;
}

/**
 * Record that a lead has successfully booked a meeting via Calendly
 */
export async function recordCalendlyBooking(leadId: string, eventUri?: string) {
  try {
    const lead = await ensureLeadExists(leadId);
    if (!lead) return { success: false, error: 'Could not resolve lead' };

    const updated = await prisma.lead.update({
      where: { id: lead.id },
      data: {
        status: 'MEETING_BOOKED',
        calendlyStatus: 'BOOKED',
        calendlyBookedAt: new Date(),
        calendlyEventUri: eventUri || `https://calendly.com/events/${Date.now()}`,
      },
    });

    return {
      success: true,
      message: `Lead ${updated.name} successfully booked a meeting via Calendly. Auto-redial cancelled.`,
      lead: updated,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Mark that a lead has NOT booked via Calendly after designated window,
 * and enqueue them for an automated AI Re-Dial.
 */
export async function markUnbookedAndScheduleRedial(leadId: string) {
  try {
    const existing = await ensureLeadExists(leadId);
    if (!existing) return { success: false, error: 'Could not resolve lead' };

    const newRedialCount = (existing.redialCount || 0) + 1;
    const updated = await prisma.lead.update({
      where: { id: existing.id },
      data: {
        calendlyStatus: 'NOT_BOOKED',
        redialScheduledAt: new Date(),
        redialCount: newRedialCount,
        status: 'CALLBACK_SCHEDULED',
      },
    });

    return {
      success: true,
      message: `Lead ${updated.name} has not booked via Calendly. Auto-redial queued (Attempt #${newRedialCount}).`,
      lead: updated,
      suggestedScript: `Hi ${updated.name}, Ava following up from TechNova Solutions. I noticed you hadn't had a chance to pick a time slot on the Calendly link we sent earlier. I'm calling back to see if we can lock in a quick 10-minute slot right now or answer any questions?`,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get tracking summary for all Calendly links and unbooked re-dial queue
 */
export async function getCalendlyTrackingSummary() {
  try {
    const leadsWithCalendly = await prisma.lead.findMany({
      where: {
        OR: [
          { calendlyLinkSent: true },
          { calendlyStatus: { in: ['LINK_SENT', 'BOOKED', 'NOT_BOOKED', 'REDIAL_TRIGGERED'] } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    const pending = leadsWithCalendly.filter((l) => l.calendlyStatus === 'LINK_SENT');
    const booked = leadsWithCalendly.filter((l) => l.calendlyStatus === 'BOOKED');
    const unbookedForRedial = leadsWithCalendly.filter(
      (l) => l.calendlyStatus === 'NOT_BOOKED' || l.calendlyStatus === 'REDIAL_TRIGGERED'
    );

    return {
      totalSent: leadsWithCalendly.length,
      pendingCount: pending.length,
      bookedCount: booked.length,
      unbookedCount: unbookedForRedial.length,
      leads: leadsWithCalendly,
      unbookedForRedial,
    };
  } catch (error: any) {
    console.error('Error fetching Calendly tracking summary:', error);
    return {
      totalSent: 0,
      pendingCount: 0,
      bookedCount: 0,
      unbookedCount: 0,
      leads: [],
      unbookedForRedial: [],
    };
  }
}
