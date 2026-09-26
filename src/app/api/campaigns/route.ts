import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: { calls: true, leads: true },
    });

    // If database has no campaigns yet, seed realistic starter campaigns connected to real leads
    if (campaigns.length === 0) {
      const allLeads = await prisma.lead.findMany({ take: 10 });
      const leadIds = allLeads.map((l) => l.id);

      const defaultCamp1 = await prisma.campaign.create({
        data: {
          name: 'Enterprise M365 & SharePoint Outreach',
          status: 'RUNNING',
          workflowType: 'LEADS_AND_CALLING',
          targetIndustry: 'IT Services & Software',
          targetLocation: 'North America (EST / PST)',
          targetLanguage: 'English',
          minIntentScore: 80,
          progressPercent: 35,
          totalLeadsCount: Math.max(5, leadIds.length),
          callsMadeCount: 3,
          conversationsCount: 2,
          interestedCount: 1,
          meetingsBooked: 1,
          scheduleType: 'Daily (9 AM - 5 PM Local)',
          repeatCadence: 'Daily',
        },
      });

      if (leadIds.length > 0) {
        await prisma.lead.updateMany({
          where: { id: { in: leadIds.slice(0, 5) } },
          data: { campaignId: defaultCamp1.id },
        });
      }

      const defaultCamp2 = await prisma.campaign.create({
        data: {
          name: 'CSV Priority Outbound - Twilio PSTN Direct',
          status: 'RUNNING',
          workflowType: 'CALLING_ONLY',
          targetIndustry: 'Finance & Banking',
          targetLocation: 'Global (Follow Prospect Timezone)',
          targetLanguage: 'Auto (Prospect Location)',
          minIntentScore: 75,
          progressPercent: 60,
          totalLeadsCount: Math.max(4, leadIds.length - 5),
          callsMadeCount: 4,
          conversationsCount: 3,
          interestedCount: 2,
          meetingsBooked: 1,
          scheduleType: 'Immediate Launch',
          repeatCadence: 'One-time',
        },
      });

      if (leadIds.length > 5) {
        await prisma.lead.updateMany({
          where: { id: { in: leadIds.slice(5) } },
          data: { campaignId: defaultCamp2.id },
        });
      }

      campaigns = await prisma.campaign.findMany({
        orderBy: { createdAt: 'desc' },
        include: { calls: true, leads: true },
      });
    }

    return NextResponse.json({ success: true, campaigns });
  } catch (error) {
    console.error('Campaigns fetch error:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      status = 'RUNNING',
      workflowType = 'LEADS_AND_CALLING',
      targetIndustry = 'IT Services',
      targetLocation = 'North America (EST / PST)',
      targetLanguage = 'English',
      minIntentScore = 80,
      scheduleType = 'Daily (9 AM - 5 PM Local)',
      repeatCadence = 'Daily',
      leadIds = [],
    } = body;

    // 1. Create the campaign row
    const newCampaign = await prisma.campaign.create({
      data: {
        name,
        status,
        workflowType,
        targetIndustry,
        targetLocation,
        targetLanguage,
        minIntentScore: Number(minIntentScore),
        scheduleType,
        repeatCadence,
        progressPercent: 0,
        totalLeadsCount: 0,
        callsMadeCount: 0,
        conversationsCount: 0,
        interestedCount: 0,
        meetingsBooked: 0,
      },
    });

    let assignedLeadIds: string[] = Array.isArray(leadIds) && leadIds.length > 0 ? leadIds : [];

    // 2. If no explicit leadIds passed, automatically attach leads matching criteria
    if (assignedLeadIds.length === 0) {
      const matchingLeads = await prisma.lead.findMany({
        where: {
          intentScore: { gte: Number(minIntentScore) },
        },
        take: 8,
      });

      if (matchingLeads.length > 0) {
        assignedLeadIds = matchingLeads.map((l) => l.id);
      } else {
        // Fallback: pick any available leads
        const fallbackLeads = await prisma.lead.findMany({ take: 5 });
        assignedLeadIds = fallbackLeads.map((l) => l.id);
      }
    }

    // 3. Link leads to this campaign in the database
    if (assignedLeadIds.length > 0) {
      await prisma.lead.updateMany({
        where: { id: { in: assignedLeadIds } },
        data: {
          campaignId: newCampaign.id,
          workflowType,
        },
      });
    }

    // 4. Update campaign total leads count
    const updatedCampaign = await prisma.campaign.update({
      where: { id: newCampaign.id },
      data: { totalLeadsCount: assignedLeadIds.length },
      include: { leads: true, calls: true },
    });

    return NextResponse.json({ success: true, campaign: updatedCampaign });
  } catch (error) {
    console.error('Campaign creation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create campaign' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, callsMadeCount, conversationsCount, interestedCount, meetingsBooked, progressPercent, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Campaign ID required' }, { status: 400 });
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        ...(callsMadeCount !== undefined && { callsMadeCount: Number(callsMadeCount) }),
        ...(conversationsCount !== undefined && { conversationsCount: Number(conversationsCount) }),
        ...(interestedCount !== undefined && { interestedCount: Number(interestedCount) }),
        ...(meetingsBooked !== undefined && { meetingsBooked: Number(meetingsBooked) }),
        ...(progressPercent !== undefined && { progressPercent: Number(progressPercent) }),
        ...(status && { status }),
      },
      include: { leads: true, calls: true },
    });

    return NextResponse.json({ success: true, campaign: updated });
  } catch (error) {
    console.error('Campaign update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update campaign' }, { status: 500 });
  }
}
