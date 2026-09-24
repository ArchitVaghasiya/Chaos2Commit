import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { leads, duplicateStrategy = 'SKIP', workflowMode = 'CALLING_ONLY' } = await request.json();

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ success: false, error: 'No leads provided' }, { status: 400 });
    }

    let importedCount = 0;
    let duplicateCount = 0;
    let updatedCount = 0;

    for (const lead of leads) {
      // Duplicate detection by email or name + company
      const existing = await prisma.lead.findFirst({
        where: {
          OR: [
            lead.email ? { email: lead.email } : {},
            { name: lead.name, companyName: lead.companyName },
          ],
        },
      });

      if (existing) {
        duplicateCount++;
        if (duplicateStrategy === 'OVERWRITE') {
          await prisma.lead.update({
            where: { id: existing.id },
            data: {
              phone: lead.phone || existing.phone,
              jobTitle: lead.jobTitle || existing.jobTitle,
              industry: lead.industry || existing.industry,
              location: lead.location || existing.location,
              country: lead.country || existing.country,
              preferredLanguage: lead.preferredLanguage || existing.preferredLanguage,
              workflowType: workflowMode,
            },
          });
          updatedCount++;
        }
        continue;
      }

      await prisma.lead.create({
        data: {
          name: lead.name,
          email: lead.email || null,
          emailVerified: lead.emailVerified ?? true,
          phone: lead.phone || null,
          phoneVerified: lead.phoneVerified ?? true,
          companyName: lead.companyName || 'Enterprise Lead',
          jobTitle: lead.jobTitle || 'Executive',
          industry: lead.industry || 'IT Services',
          companySize: lead.companySize || '51 – 200 employees',
          sourcePlatform: lead.sourcePlatform || 'CSV/Excel Import',
          originalPostUrl: lead.originalPostUrl || null,
          originalPostSnippet: lead.originalPostSnippet || 'Uploaded via CSV/Excel lead campaign.',
          intentScore: lead.intentScore || 80,
          budgetSignal: lead.budgetSignal || 'Approved',
          urgencyLevel: lead.urgencyLevel || 'Medium',
          status: 'READY_TO_ENGAGE',
          location: lead.location || 'Global',
          country: lead.country || 'United States',
          preferredLanguage: lead.preferredLanguage || 'English',
          workflowType: workflowMode || lead.workflowType || 'CALLING_ONLY',
        },
      });
      importedCount++;
    }

    return NextResponse.json({
      success: true,
      importedCount,
      duplicateCount,
      updatedCount,
      message: `Successfully processed ${leads.length} leads: ${importedCount} imported, ${duplicateCount} duplicates handled (${duplicateStrategy})`,
    });
  } catch (error) {
    console.error('Lead import error:', error);
    return NextResponse.json({ success: false, error: 'Import failed' }, { status: 500 });
  }
}
