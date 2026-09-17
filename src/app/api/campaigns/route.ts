import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: { calls: true, leads: true },
    });

    return NextResponse.json({ success: true, campaigns });
  } catch (error) {
    console.error('Campaigns fetch error:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newCampaign = await prisma.campaign.create({
      data: {
        name: body.name,
        status: body.status || 'RUNNING',
        targetIndustry: body.targetIndustry || 'All',
        targetLocation: body.targetLocation || 'Global',
        progressPercent: body.progressPercent || 0,
        totalLeadsCount: body.totalLeadsCount || 500,
        callsMadeCount: 0,
        conversationsCount: 0,
        interestedCount: 0,
        meetingsBooked: 0,
      },
    });

    return NextResponse.json({ success: true, campaign: newCampaign });
  } catch (error) {
    console.error('Campaign creation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create campaign' }, { status: 500 });
  }
}
