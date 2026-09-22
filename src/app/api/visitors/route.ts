import { prisma } from '@/lib/db';

export async function GET() {
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const today = new Date().toISOString().split('T')[0];

  const total = await prisma.visitor.count();
  const online = await prisma.visitor.findMany({
    where: { lastSeen: { gte: fiveMinAgo } },
    orderBy: { lastSeen: 'desc' },
    select: { ip: true, lastSeen: true, visits: true, totalUsageSeconds: true, todayUsageSeconds: true, todayDate: true },
  });
  const allVisitors = await prisma.visitor.findMany({
    orderBy: { lastVisit: 'desc' },
    select: { ip: true, lastVisit: true, lastSeen: true, visits: true, totalUsageSeconds: true, todayUsageSeconds: true, todayDate: true },
  });

  const totalUsageAll = allVisitors.reduce((sum, v) => sum + v.totalUsageSeconds, 0);

  const onlineWithToday = online.map(v => ({
    ip: v.ip,
    lastSeen: v.lastSeen,
    visits: v.visits,
    todayUsageSeconds: v.todayDate === today ? v.todayUsageSeconds : 0,
    totalUsageSeconds: v.totalUsageSeconds,
  }));

  return Response.json({
    uniqueUsers: total,
    onlineUsers: online.length,
    online: onlineWithToday,
    allVisitors,
    totalUsageSeconds: totalUsageAll,
  });
}
