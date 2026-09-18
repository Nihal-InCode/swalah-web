import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

  const existing = await prisma.visitor.findUnique({
    where: { ip },
  });

  if (existing) {
    await prisma.visitor.update({
      where: { ip },
      data: { lastVisit: new Date(), lastSeen: new Date(), visits: { increment: 1 } },
    });
  } else {
    await prisma.visitor.create({
      data: { ip, lastVisit: new Date(), lastSeen: new Date(), visits: 1 },
    });
  }

  const total = await prisma.visitor.count();
  return Response.json({ total });
}

export async function GET() {
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

  const total = await prisma.visitor.count();
  const online = await prisma.visitor.findMany({
    where: { lastSeen: { gte: fiveMinAgo } },
    orderBy: { lastSeen: 'desc' },
    select: { ip: true, lastSeen: true, visits: true },
  });
  const allVisitors = await prisma.visitor.findMany({
    orderBy: { lastVisit: 'desc' },
    select: { ip: true, lastVisit: true, lastSeen: true, visits: true },
  });

  return Response.json({
    uniqueUsers: total,
    onlineUsers: online.length,
    online,
    allVisitors,
  });
}
