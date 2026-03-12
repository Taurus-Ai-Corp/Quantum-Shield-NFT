import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Email and password (min 8 characters) required' },
        { status: 400 }
      );
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Generic response for both paths to prevent email enumeration
    const genericResponse = { message: 'Account created successfully' };

    if (existing) {
      return NextResponse.json(genericResponse, { status: 201 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const apiKey = `qsnft_${crypto.randomBytes(32).toString('hex')}`;

    await prisma.user.create({
      data: {
        name: typeof name === 'string' ? name.trim() : null,
        email: email.toLowerCase().trim(),
        hashedPassword,
        apiKey,
      },
    });

    return NextResponse.json(genericResponse, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
