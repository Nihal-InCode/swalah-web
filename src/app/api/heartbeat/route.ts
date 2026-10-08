import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';
import { sanitizeDevice, isMergeableDevice } from '@/lib/device-names';

function parseDevice(ua: string): string {
  if (!ua) return '';
  if (/android/i.test(ua)) {
    const m = ua.match(/Android\s[\d.]+\s*;\s*([^;)]+)/);
    return m ? `Android - ${m[1].trim()}` : 'Android';
  }
  if (/iPhone|iPad|iPod/i.test(ua)) {
    if (/iPad/.test(ua)) return 'iPad';
    if (/iPhone/.test(ua)) {
      const m = ua.match(/iPhone;\s*iOS\s[\d._]+/);
      return m ? `iPhone - ${m[0].split(';')[0].trim()}` : 'iPhone';
    }
    return 'iPod';
  }
  if (/Macintosh|Mac OS/i.test(ua)) return 'Mac';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Linux/i.test(ua)) return 'Linux';
  const m = ua.match(/^(\w+)/);
  return m ? m[1] : '';
}

export async function POST(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  const ua = request.headers.get('user-agent') || '';
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  let usageSeconds = 0;
  let visitorId = '';
  let bodyDevice = '';
  try {
    const body = await request.json();
    usageSeconds = body.usageSeconds || 0;
    visitorId = typeof body.visitorId === 'string' ? body.visitorId.trim() : '';
    bodyDevice = sanitizeDevice(body.device);
  } catch {}

  // Prefer the client-resolved device model; fall back to UA parsing.
  const device = bodyDevice || parseDevice(ua);

  let existing = null;
  if (visitorId) {
    existing = await prisma.visitor.findUnique({ where: { visitorId } });
    if (!existing && ip && ip !== 'unknown' && isMergeableDevice(bodyDevice)) {
      // Same IP + same specific device model = same physical machine that
      // came back with a new visitor id. Adopt its existing row instead of
      // creating a duplicate.
      existing = await prisma.visitor.findFirst({
        where: { ip, device: bodyDevice },
        orderBy: { lastSeen: 'desc' },
      });
    }
  } else if (ip) {
    existing = await prisma.visitor.findFirst({
      where: { ip },
      orderBy: { lastSeen: 'desc' },
    });
  }

  if (existing) {
    const resetToday = existing.todayDate !== today;
    await prisma.visitor.update({
      where: { id: existing.id },
      data: {
        visitorId: visitorId || existing.visitorId,
        ip,
        lastSeen: now,
        totalUsageSeconds: existing.totalUsageSeconds + usageSeconds,
        todayUsageSeconds: resetToday ? usageSeconds : existing.todayUsageSeconds + usageSeconds,
        todayDate: today,
        // Never downgrade a specific model name to a generic UA label
        device: bodyDevice || existing.device || device,
      },
    });
  } else {
    await prisma.visitor.create({
      data: {
        visitorId: visitorId || `legacy_${ip}_${now.getTime()}`,
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

  return Response.json({ ok: true });
}
