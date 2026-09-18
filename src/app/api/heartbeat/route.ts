import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

  await prisma.visitor.upsert({
    where: { ip },
    update: { lastSeen: new Date() },
    create: { ip, lastSeen: new Date(), lastVisit: new Date(), visits: 1 },
  });

  return Response.json({ ok: true });
}
