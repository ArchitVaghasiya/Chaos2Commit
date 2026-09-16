import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const platform = searchParams.get('platform') || '';

    const leads = await prisma.lead.findMany({
      where: {
        AND: [
          query
            ? {
                OR: [
                  { name: { contains: query } },
                  { companyName: { contains: query } },
                  { jobTitle: { contains: query } },
                  { originalPostSnippet: { contains: query } },
                ],
              }
            : {},
          platform && platform !== 'All Sources'
            ? { sourcePlatform: { equals: platform } }
            : {},
        ],
      },
      orderBy: { intentScore: 'desc' },
      include: { calls: true },
    });

    return NextResponse.json({ success: true, leads });
  } catch (error) {
    console.error('Failed to fetch leads:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newLead = await prisma.lead.create({
      data: {
        name: body.name,
        email: body.email,
        emailVerified: body.emailVerified ?? true,
        phone: body.phone,
        phoneVerified: body.phoneVerified ?? true,
        linkedinProfile: body.linkedinProfile,
        companyName: body.companyName,
        companyWebsite: body.companyWebsite,
        jobTitle: body.jobTitle,
        industry: body.industry ?? 'IT Services',
        companySize: body.companySize ?? '51 – 200 employees',
        sourcePlatform: body.sourcePlatform ?? 'LinkedIn',
        originalPostUrl: body.originalPostUrl,
        originalPostSnippet: body.originalPostSnippet,
        intentScore: body.intentScore ?? 85,
        budgetSignal: body.budgetSignal ?? 'High',
        urgencyLevel: body.urgencyLevel ?? 'High',
        decisionMaker: body.decisionMaker ?? true,
        activeRequirement: body.activeRequirement ?? true,
        status: body.status ?? 'DISCOVERED',
      },
    });

    return NextResponse.json({ success: true, lead: newLead });
  } catch (error) {
    console.error('Failed to create lead:', error);
    return NextResponse.json({ success: false, error: 'Failed to create lead' }, { status: 500 });
  }
}
