import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, companyName, companySize, industry, password } = body;

    if (!name || !email || !companyName || !password) {
      return NextResponse.json(
        { success: false, error: 'Please provide all required company details and password.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this work email already exists.' },
        { status: 409 }
      );
    }

    // Create user in Neon PostgreSQL
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: trimmedEmail,
        password,
        companyName: companyName.trim(),
        companySize: companySize || '11 - 50 employees',
        industry: industry || 'Technology & Software',
        role: 'COMPANY_ADMIN',
      },
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      companyName: user.companyName,
      companySize: user.companySize,
      industry: user.industry,
      role: user.role,
    };

    return NextResponse.json({
      success: true,
      user: safeUser,
      message: 'Company account created successfully!',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected server error occurred during registration.' },
      { status: 500 }
    );
  }
}
