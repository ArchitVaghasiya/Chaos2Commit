import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { intentScore: 'desc' },
    });

    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Company',
      'JobTitle',
      'Industry',
      'IntentScore',
      'BudgetSignal',
      'UrgencyLevel',
      'SourcePlatform',
      'Status',
    ];

    const rows = leads.map((l) => [
      `"${l.id}"`,
      `"${l.name}"`,
      `"${l.email || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.companyName}"`,
      `"${l.jobTitle}"`,
      `"${l.industry}"`,
      l.intentScore,
      `"${l.budgetSignal}"`,
      `"${l.urgencyLevel}"`,
      `"${l.sourcePlatform}"`,
      `"${l.status}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="ai_sales_leads_${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Lead export error:', error);
    return NextResponse.json({ success: false, error: 'Export failed' }, { status: 500 });
  }
}
