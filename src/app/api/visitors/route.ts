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
      data: { lastVisit: new Date(), visits: { increment: 1 } },
    });
  } else {
    await prisma.visitor.create({
      data: { ip, lastVisit: new Date(), visits: 1 },
    });
  }

  const total = await prisma.visitor.count();
  return Response.json({ total });
}

export async function GET() {
  const total = await prisma.visitor.count();
  const totalVisits = await prisma.visitor.aggregate({ _sum: { visits: true } });
  const recentVisitors = await prisma.visitor.findMany({
    orderBy: { lastVisit: 'desc' },
    take: 10,
    select: { ip: true, lastVisit: true, visits: true },
  });

  return Response.json({
    uniqueUsers: total,
    totalVisits: totalVisits._sum.visits || 0,
    recentVisitors,
  });
}
