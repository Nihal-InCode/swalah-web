import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  let usageSeconds = 0;
  try {
    const body = await request.json();
    usageSeconds = body.usageSeconds || 0;
  } catch {}

  const existing = await prisma.visitor.findUnique({ where: { ip } });

  if (existing) {
    const resetToday = existing.todayDate !== today;
    await prisma.visitor.update({
      where: { ip },
      data: {
        lastSeen: now,
        totalUsageSeconds: existing.totalUsageSeconds + usageSeconds,
        todayUsageSeconds: resetToday ? usageSeconds : existing.todayUsageSeconds + usageSeconds,
        todayDate: today,
      },
    });
  } else {
    await prisma.visitor.create({
      data: {
        ip,
        lastSeen: now,
        lastVisit: now,
        visits: 1,
        totalUsageSeconds: usageSeconds,
        todayUsageSeconds: usageSeconds,
        todayDate: today,
      },
    });
  }

  return Response.json({ ok: true });
}
