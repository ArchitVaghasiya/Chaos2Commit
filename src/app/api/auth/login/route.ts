import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body; // identifier can be Name or Email

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Please provide your name or email, and password.' },
        { status: 400 }
      );
    }

    const trimmedIdentifier = identifier.trim();

    // Query user by email (case-insensitive) or name (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: trimmedIdentifier, mode: 'insensitive' } },
          { name: { equals: trimmedIdentifier, mode: 'insensitive' } },
        ],
      },
    });

    if (!user || user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials. Please verify your name/email and password.' },
        { status: 401 }
      );
    }

    // Success response with safe user payload
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
      message: `Welcome back, ${user.name}!`,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected server error occurred during login.' },
      { status: 500 }
    );
  }
}
