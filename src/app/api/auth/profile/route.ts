import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, companyName, companySize, industry, password } = body;

    if (!id && !email) {
      return NextResponse.json(
        { success: false, error: 'User identifier is required to update profile.' },
        { status: 400 }
      );
    }

    // Find the user by id or email
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(id ? [{ id }] : []),
          ...(email ? [{ email: email.trim().toLowerCase() }] : []),
        ],
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.trim().toLowerCase();
    if (companyName !== undefined) updateData.companyName = companyName.trim();
    if (companySize !== undefined) updateData.companySize = companySize;
    if (industry !== undefined) updateData.industry = industry;
    if (password && password.trim().length > 0) updateData.password = password.trim();

    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: updateData,
    });

    const safeUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      companyName: updatedUser.companyName,
      companySize: updatedUser.companySize,
      industry: updatedUser.industry,
      role: updatedUser.role,
    };

    return NextResponse.json({
      success: true,
      user: safeUser,
      message: 'Profile details updated successfully in Neon database!',
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while updating profile.' },
      { status: 500 }
    );
  }
}
