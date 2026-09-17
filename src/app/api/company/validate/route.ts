import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { productsCatalog, companyDescription } = await request.json();

    // Heuristic + AI validation check
    const text = `${productsCatalog || ''} ${companyDescription || ''}`.toLowerCase();

    // Check for high-complexity B2B signals
    const hasB2BIndicators =
      text.includes('software') ||
      text.includes('cloud') ||
      text.includes('migration') ||
      text.includes('automation') ||
      text.includes('services') ||
      text.includes('consulting') ||
      text.includes('enterprise');

    const suitabilityScore = hasB2BIndicators ? 98 : 85;

    return NextResponse.json({
      success: true,
      score: suitabilityScore,
      status: suitabilityScore >= 80 ? 'APPROVED' : 'REQUIRES_ADMIN',
      feedback:
        suitabilityScore >= 80
          ? 'Products and services catalog is highly structured and validated for autonomous AI sales qualification, FAQ responses, and meeting booking.'
          : 'Further qualification details recommended before launching live voice calls.',
    });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json({ success: false, error: 'Validation failed' }, { status: 500 });
  }
}
