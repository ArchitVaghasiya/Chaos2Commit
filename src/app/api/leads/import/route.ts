import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { leads } = await request.json();

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ success: false, error: 'No leads provided' }, { status: 400 });
    }

    let importedCount = 0;
    let duplicateCount = 0;

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
          sourcePlatform: lead.sourcePlatform || 'CRM Import',
          originalPostSnippet: lead.originalPostSnippet || 'Imported via CSV/Excel custom list.',
          intentScore: lead.intentScore || 80,
          budgetSignal: lead.budgetSignal || 'Approved',
          urgencyLevel: lead.urgencyLevel || 'Medium',
          status: 'READY_TO_ENGAGE',
        },
      });
      importedCount++;
    }

    return NextResponse.json({
      success: true,
      importedCount,
      duplicateCount,
      message: `Successfully imported ${importedCount} leads (${duplicateCount} duplicates skipped)`,
    });
  } catch (error) {
    console.error('Lead import error:', error);
    return NextResponse.json({ success: false, error: 'Import failed' }, { status: 500 });
  }
}
