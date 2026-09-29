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
  if (/Windows/i.test(ua)) return 'Windows';
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

  let visitorId = '';
  let usageSeconds = 0;
  try {
    const body = await request.json();
    visitorId = body.visitorId || '';
    usageSeconds = body.usageSeconds || 0;
  } catch {}

  const id = visitorId || ip;

  const existing = await prisma.visitor.findUnique({ where: { id } });

  if (existing) {
    const resetToday = existing.todayDate !== today;
    const minutesSinceLastSeen = (now.getTime() - new Date(existing.lastSeen).getTime()) / 60000;
    const isNewVisit = minutesSinceLastSeen > 15;

    await prisma.visitor.update({
      where: { id },
      data: {
        ip,
        lastSeen: now,
        lastVisit: isNewVisit ? now : existing.lastVisit,
        visits: isNewVisit ? existing.visits + 1 : existing.visits,
        totalUsageSeconds: existing.totalUsageSeconds + usageSeconds,
        todayUsageSeconds: resetToday ? usageSeconds : existing.todayUsageSeconds + usageSeconds,
        todayDate: today,
        device: device || existing.device,
      },
    });
  } else {
    await prisma.visitor.create({
      data: {
        id,
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
  const threeMinAgo = new Date(Date.now() - 3 * 60 * 1000);
  const today = new Date().toISOString().split('T')[0];

  const total = await prisma.visitor.count();
  const allVisitors = await prisma.visitor.findMany({
    orderBy: { lastSeen: 'desc' },
  });

  const online = allVisitors.filter(v => new Date(v.lastSeen) >= threeMinAgo);
  const totalUsageAll = allVisitors.reduce((sum, v) => sum + v.totalUsageSeconds, 0);

  const onlineFormatted = online.map(v => ({
    id: v.id,
    ip: v.ip,
    lastSeen: v.lastSeen,
    lastVisit: v.lastVisit,
    visits: v.visits,
    todayUsageSeconds: v.todayDate === today ? v.todayUsageSeconds : 0,
    totalUsageSeconds: v.totalUsageSeconds,
    device: v.device,
  }));

  const allVisitorsFormatted = allVisitors.map(v => ({
    id: v.id,
    ip: v.ip,
    lastVisit: v.lastVisit,
    lastSeen: v.lastSeen,
    visits: v.visits,
    todayUsageSeconds: v.todayDate === today ? v.todayUsageSeconds : 0,
    totalUsageSeconds: v.totalUsageSeconds,
    todayDate: v.todayDate,
    device: v.device,
    isOnline: new Date(v.lastSeen) >= threeMinAgo,
  }));

  return Response.json({
    uniqueUsers: total,
    onlineUsers: online.length,
    online: onlineFormatted,
    allVisitors: allVisitorsFormatted,
    totalUsageSeconds: totalUsageAll,
  });
}
