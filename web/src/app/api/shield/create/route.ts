import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const FASTIFY_URL = process.env['FASTIFY_API_URL'] || 'http://localhost:3200';
const SERVICE_TOKEN = process.env['INTERNAL_SERVICE_TOKEN'];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!SERVICE_TOKEN) {
    return NextResponse.json(
      { error: 'Service configuration error' },
      { status: 500 }
    );
  }

  const body = await req.json();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${FASTIFY_URL}/api/v1/shield`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Token': SERVICE_TOKEN,
        'X-User-Id': session.user.id,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Shield service is temporarily unavailable. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create shield. Please try again.' },
      { status: 502 }
    );
  }
}
