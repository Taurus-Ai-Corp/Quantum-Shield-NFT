import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const shields = await prisma.shield.findMany({
      where: { userId: session.user.id },
      include: {
        provenanceEvents: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ shields, total: shields.length });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load shields' },
      { status: 500 }
    );
  }
}
