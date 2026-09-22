import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';

function parseDevice(ua: string): string {
  if (!ua) return 'Unknown';
  if (/android/i.test(ua)) {
    const m = ua.match(/Android\s[\d.]+\s*;\s*([^;)]+)/);
    return m ? `Android - ${m[1].trim()}` : 'Android';
  }
  if (/iPhone|iPad|iPod/i.test(ua)) {
    if (/iPad/i.test(ua)) return 'iPad';
    if (/iPhone/i.test(ua)) {
      const m = ua.match(/iPhone;\s*iOS\s[\d._]+/);
      return m ? `iPhone - ${m[0].split(';')[0].trim()}` : 'iPhone';
    }
    return 'iPod';
  }
  if (/Macintosh|Mac OS/i.test(ua)) return 'Mac';
  if (/Windows/i.test(ua)) {
    const m = ua.match(/Windows NT [\d.]+/);
    return m ? `Windows` : 'Windows';
  }
  if (/Linux/i.test(ua)) return 'Linux';
  const m = ua.match(/^(\w+)/);
  return m ? m[1] : 'Unknown';
}

export async function POST(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  const ua = request.headers.get('user-agent') || '';
  const device = parseDevice(ua);
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
        visits: existing.visits + 1,
        totalUsageSeconds: existing.totalUsageSeconds + usageSeconds,
        todayUsageSeconds: resetToday ? usageSeconds : existing.todayUsageSeconds + usageSeconds,
        todayDate: today,
        device: device || existing.device,
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
        device,
      },
    });
  }

  const total = await prisma.visitor.count();
  return Response.json({ total });
}

export async function GET() {
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const today = new Date().toISOString().split('T')[0];

  const total = await prisma.visitor.count();
  const online = await prisma.visitor.findMany({
    where: { lastSeen: { gte: fiveMinAgo } },
    orderBy: { lastSeen: 'desc' },
    select: { ip: true, lastSeen: true, visits: true, totalUsageSeconds: true, todayUsageSeconds: true, todayDate: true, device: true },
  });
  const allVisitors = await prisma.visitor.findMany({
    orderBy: { lastVisit: 'desc' },
    select: { ip: true, lastVisit: true, lastSeen: true, visits: true, totalUsageSeconds: true, todayUsageSeconds: true, todayDate: true, device: true },
  });

  const totalUsageAll = allVisitors.reduce((sum, v) => sum + v.totalUsageSeconds, 0);

  const onlineWithToday = online.map(v => ({
    ip: v.ip,
    lastSeen: v.lastSeen,
    visits: v.visits,
    todayUsageSeconds: v.todayDate === today ? v.todayUsageSeconds : 0,
    totalUsageSeconds: v.totalUsageSeconds,
    device: v.device,
  }));

  return Response.json({
    uniqueUsers: total,
    onlineUsers: online.length,
    online: onlineWithToday,
    allVisitors,
    totalUsageSeconds: totalUsageAll,
  });
}
