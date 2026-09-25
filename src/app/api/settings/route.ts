import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let org = await prisma.organizationSetting.findFirst();
    if (!org) {
      org = await prisma.organizationSetting.create({
        data: {
          id: 'default-org',
          companyName: 'CloudScale Solutions',
          website: 'https://cloudscale-solutions.com',
          description: 'Enterprise Microsoft 365, SharePoint Migration & AI Solutions Provider',
          productsCatalog: 'Microsoft 365 Enterprise Migration, SharePoint Online Document Management, Zero-Downtime Cloud Cutover, Power Platform Automation',
          targetKeywords: 'Microsoft 365, SharePoint, Cloud Migration, Power Automate, Zero Downtime, Tenant Migration',
          aiPersonaName: 'Ava (Enterprise Solutions Lead)',
          aiLanguageDefault: 'en',
          voiceMinutesUsed: 12450,
          voiceMinutesLimit: 20000,
          isApprovedForAi: true,
        },
      });
    }
    return NextResponse.json({ success: true, settings: org });
  } catch (error: any) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      companyName,
      website,
      description,
      productsCatalog,
      targetKeywords,
      aiPersonaName,
      aiLanguageDefault,
    } = body;

    let existingOrg = await prisma.organizationSetting.findFirst();

    let updatedOrg;
    if (existingOrg) {
      updatedOrg = await prisma.organizationSetting.update({
        where: { id: existingOrg.id },
        data: {
          ...(companyName !== undefined && { companyName }),
          ...(website !== undefined && { website }),
          ...(description !== undefined && { description }),
          ...(productsCatalog !== undefined && { productsCatalog }),
          ...(targetKeywords !== undefined && { targetKeywords }),
          ...(aiPersonaName !== undefined && { aiPersonaName }),
          ...(aiLanguageDefault !== undefined && { aiLanguageDefault }),
        },
      });
    } else {
      updatedOrg = await prisma.organizationSetting.create({
        data: {
          id: 'default-org',
          companyName: companyName || 'CloudScale Solutions',
          website: website || 'https://cloudscale-solutions.com',
          description: description || 'Enterprise Microsoft 365, SharePoint Migration & AI Solutions Provider',
          productsCatalog: productsCatalog || 'Microsoft 365 Enterprise Migration, SharePoint Online Document Management, Zero-Downtime Cloud Cutover',
          targetKeywords: targetKeywords || 'Microsoft 365, SharePoint, Cloud Migration',
          aiPersonaName: aiPersonaName || 'Ava (Enterprise Solutions Lead)',
          aiLanguageDefault: aiLanguageDefault || 'en',
        },
      });
    }

    return NextResponse.json({ success: true, settings: updatedOrg });
  } catch (error: any) {
    console.error('Settings POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
