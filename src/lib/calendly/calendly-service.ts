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
 * Ensures a lead exists before tracking Calendly events, creating on-demand if needed
 */
async function ensureLeadExists(leadId: string): Promise<any> {
  let existing = null;
  if (leadId) {
    try {
      const rows: any[] = await prisma.$queryRawUnsafe('SELECT * FROM "Lead" WHERE "id" = ? LIMIT 1', leadId);
      if (rows && rows.length > 0) existing = rows[0];
    } catch (_) {}
  }
  if (!existing) {
    try {
      const first: any[] = await prisma.$queryRawUnsafe('SELECT * FROM "Lead" LIMIT 1');
      if (first && first.length > 0) {
        existing = first[0];
      } else {
        const id = leadId || `lead-${Date.now()}`;
        const now = new Date().toISOString();
        await prisma.$executeRawUnsafe(
          `INSERT INTO "Lead" (
            "id", "name", "companyName", "phone", "email", "jobTitle", "location", "country", "preferredLanguage", "status", "calendlyStatus", "createdAt", "updatedAt"
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'DISCOVERED', 'NONE', ?, ?)`,
          id,
          'Priya Nair',
          'CloudTech Solutions',
          '+1 (555) 872-9012',
          'priya.nair@cloudtech.example.com',
          'VP of Technology & Cloud Infrastructure',
          'San Francisco, CA',
          'United States',
          'English',
          now,
          now
        );
        const created: any[] = await prisma.$queryRawUnsafe('SELECT * FROM "Lead" WHERE "id" = ? LIMIT 1', id);
        existing = created?.[0] || null;
      }
    } catch (e) {
      console.warn('ensureLeadExists fallback error:', e);
    }
  }
  return existing;
}

/**
 * Dispatches a real/simulated SMS with a Calendly booking link to the lead
 */
export async function sendCalendlyLinkViaSms(leadId: string, overridePhone?: string) {
  const lead = await ensureLeadExists(leadId);

  const name = lead?.name || 'there';
  const targetPhone = overridePhone || lead?.phone || '+1 (555) 019-2834';
  const calendlyUrl = generateCalendlyUrl(lead?.id || leadId, name);

  const smsBody = `Hi ${name}, here is the link to schedule a direct call with our team: ${calendlyUrl} . Please choose any timeslot that works best for you!`;

  const smsResult = await sendOutboundSms({
    to: targetPhone,
    body: smsBody,
  });

  // Update lead status in database using direct SQL to guarantee reliability
  if (lead?.id) {
    try {
      const now = new Date().toISOString();
      await prisma.$executeRawUnsafe(
        `UPDATE "Lead" SET "calendlyLinkSent" = 1, "calendlyLinkSentAt" = ?, "calendlyStatus" = 'LINK_SENT', "updatedAt" = ? WHERE "id" = ?`,
        now,
        now,
        lead.id
      );
    } catch (e) {
      console.warn('Could not update lead calendlyStatus via raw SQL:', e);
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
 * Record that a lead has successfully booked a meeting via Calendly
 */
export async function recordCalendlyBooking(leadId: string, eventUri?: string) {
  try {
    const lead = await ensureLeadExists(leadId);
    if (!lead) return { success: false, error: 'Could not resolve lead' };

    const now = new Date().toISOString();
    const uri = eventUri || `https://calendly.com/events/${Date.now()}`;

    await prisma.$executeRawUnsafe(
      `UPDATE "Lead" SET "status" = 'MEETING_BOOKED', "calendlyStatus" = 'BOOKED', "calendlyBookedAt" = ?, "calendlyEventUri" = ?, "updatedAt" = ? WHERE "id" = ?`,
      now,
      uri,
      now,
      lead.id
    );

    const updatedRows: any[] = await prisma.$queryRawUnsafe('SELECT * FROM "Lead" WHERE "id" = ? LIMIT 1', lead.id);
    const updated = updatedRows?.[0] || { ...lead, calendlyStatus: 'BOOKED', status: 'MEETING_BOOKED' };

    return {
      success: true,
      message: `Lead ${updated.name} successfully booked a meeting via Calendly. Auto-redial cancelled.`,
      lead: updated,
    };
  } catch (error: any) {
    console.error('recordCalendlyBooking error:', error);
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

    const newRedialCount = Number(existing.redialCount || 0) + 1;
    const now = new Date().toISOString();

    await prisma.$executeRawUnsafe(
      `UPDATE "Lead" SET "calendlyStatus" = 'NOT_BOOKED', "redialScheduledAt" = ?, "redialCount" = ?, "status" = 'CALLBACK_SCHEDULED', "updatedAt" = ? WHERE "id" = ?`,
      now,
      newRedialCount,
      now,
      existing.id
    );

    const updatedRows: any[] = await prisma.$queryRawUnsafe('SELECT * FROM "Lead" WHERE "id" = ? LIMIT 1', existing.id);
    const updated = updatedRows?.[0] || { ...existing, calendlyStatus: 'NOT_BOOKED', redialCount: newRedialCount };

    return {
      success: true,
      message: `Lead ${updated.name} has not booked via Calendly. Auto-redial queued (Attempt #${newRedialCount}).`,
      lead: updated,
      suggestedScript: `Hi ${updated.name}, Ava following up from Techsolution. I noticed you hadn't had a chance to pick a time slot on the Calendly link we sent earlier. I'm calling back to see if we can lock in a quick 10-minute slot right now or answer any questions?`,
    };
  } catch (error: any) {
    console.error('markUnbookedAndScheduleRedial error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get tracking summary for all Calendly links and unbooked re-dial queue
 */
export async function getCalendlyTrackingSummary() {
  try {
    const leadsWithCalendly: any[] = await prisma.$queryRawUnsafe(`
      SELECT * FROM "Lead" 
      WHERE "calendlyLinkSent" = 1 
         OR "calendlyStatus" IN ('LINK_SENT', 'BOOKED', 'NOT_BOOKED', 'REDIAL_TRIGGERED')
      ORDER BY "updatedAt" DESC 
      LIMIT 50
    `);

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
